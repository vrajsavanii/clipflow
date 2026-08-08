import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const STATUS_ORDER = ['pending', 'queued', 'ingesting', 'downloading', 'transcribing', 'transcribed', 'visual_analyzing', 'face_detecting', 'analyzing', 'analyzing_done', 'ready', 'completed', 'failed']

function buildPayload(project: any) {
  const currentIdx = STATUS_ORDER.indexOf(project.status)
  const progress = Math.min(100, Math.round((currentIdx / (STATUS_ORDER.length - 3)) * 100))
  const activeJob = project.jobs?.find((j: any) => j.status === 'processing' || j.status === 'queued')
  const failedJob = project.jobs?.find((j: any) => j.status === 'failed')
  const doneJobs = project.jobs?.filter((j: any) => j.status === 'done').length || 0
  const totalJobs = project.jobs?.length || 0
  const clipCount = project.clips?.[0]?.count || 0

  return {
    type: 'update' as const,
    projectId: project.id,
    status: project.status,
    progress,
    clipCount,
    activeJob: activeJob?.type || null,
    doneJobs,
    totalJobs,
    failed: !!failedJob,
    error: failedJob?.error_msg || null,
    sourceUrl: project.source_url,
    createdAt: project.created_at,
    timestamp: new Date().toISOString(),
  }
}

// GET /api/progress/[projectId] - SSE endpoint (or ?poll=true for single fetch)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const isPoll = request.nextUrl.searchParams.has('poll')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: project } = await supabase
    .from('projects')
    .select('*, clips(count), jobs(type, status, error_msg)')
    .eq('id', projectId)
    .single()

  if (!project) {
    const err = JSON.stringify({ type: 'error', message: 'Project not found' })
    if (isPoll) return Response.json({ type: 'error', message: 'Project not found' }, { status: 404 })
    return new Response(`data: ${err}\n\n`, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }

  // For polling mode, return a single JSON response
  if (isPoll) {
    const payload = buildPayload(project)
    if (project.status === 'ready' || project.status === 'completed' || project.status === 'failed') {
      return Response.json({ ...payload, type: 'complete' })
    }
    return Response.json(payload)
  }

  // SSE mode: stream updates
  const encoder = new TextEncoder()
  let isConnected = true

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', projectId })}\n\n`))

      const keepalive = setInterval(() => {
        try { controller.enqueue(encoder.encode(`: keepalive\n\n`)) } catch {}
      }, 30000)

      const interval = setInterval(async () => {
        if (!isConnected) { clearInterval(interval); return }

        try {
          const { data: current } = await supabase
            .from('projects')
            .select('*, clips(count), jobs(type, status, error_msg)')
            .eq('id', projectId)
            .single()

          if (!current) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Project not found' })}\n\n`))
            clearInterval(interval); clearInterval(keepalive)
            controller.close()
            return
          }

          const payload = buildPayload(current)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))

          if (current.status === 'ready' || current.status === 'completed' || current.status === 'failed') {
            clearInterval(interval); clearInterval(keepalive)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...payload, type: 'complete' })}\n\n`))
            controller.close()
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`))
        }
      }, 1500)

      request.signal.addEventListener('abort', () => {
        isConnected = false
        clearInterval(interval); clearInterval(keepalive)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
