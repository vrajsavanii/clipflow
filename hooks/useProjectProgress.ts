import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export interface ProgressPayload {
  type: 'connected' | 'update' | 'complete' | 'error'
  projectId: string
  status: string
  progress: number
  clipCount: number
  activeJob: string | null
  doneJobs: number
  totalJobs: number
  failed: boolean
  error: string | null
  sourceUrl: string | null
  createdAt?: string
  timestamp: string
}

interface UseProjectProgressOptions {
  projectId: string | null
  onUpdate?: (data: ProgressPayload) => void
  onComplete?: (data: ProgressPayload) => void
  onError?: (error: string) => void
  enabled?: boolean
}

export function useProjectProgress({
  projectId,
  onUpdate,
  onComplete,
  onError,
  enabled = true,
}: UseProjectProgressOptions) {
  const [data, setData] = useState<ProgressPayload | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const finalStatusRef = useRef(false)

  const onUpdateRef = useRef(onUpdate)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onUpdateRef.current = onUpdate
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  }, [onUpdate, onComplete, onError])

  useEffect(() => {
    if (!projectId || !enabled) {
      setIsConnected(false)
      setData(null)
      setError(null)
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    setIsConnected(true)

    // Subscribe to polling
    let interval: NodeJS.Timeout
    
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/progress/${projectId}?poll=true`)
        if (!res.ok) {
          const err = await res.text()
          setError(err)
          onErrorRef.current?.(err)
          return
        }
        
        const payload: ProgressPayload = await res.json()
        
        if (payload.type === 'error' as any) {
          setError(payload.error || 'Unknown error')
          onErrorRef.current?.(payload.error || 'Unknown error')
          return
        }

        const isComplete = payload.status === 'ready' || payload.status === 'completed' || payload.status === 'success' || payload.status === 'failed'
        if (isComplete) {
          payload.type = 'complete'
        }

        setData(prev => {
          if (prev && prev.status === payload.status && prev.progress === payload.progress) {
            return prev
          }
          return payload
        })
        
        // Always trigger onUpdate so the React UI can update its projectStatus state
        onUpdateRef.current?.(payload)

        if (isComplete) {
          finalStatusRef.current = true
          onCompleteRef.current?.(payload)
          if (interval) clearInterval(interval) // Stop polling once complete!
        }
      } catch (err: any) {
        setError(err.message)
        onErrorRef.current?.(err.message)
      }
    }

    fetchStatus()
    interval = setInterval(fetchStatus, 1500)

    return () => {
      if (interval) clearInterval(interval)
      setIsConnected(false)
    }
  }, [projectId, enabled])

  return {
    data,
    isConnected,
    error,
    isComplete: data?.type === 'complete' || finalStatusRef.current,
    reconnect: () => {
      finalStatusRef.current = false
    },
  }
}
