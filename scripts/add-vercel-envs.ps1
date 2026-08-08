# Parse .env.local dynamically so no secrets are hardcoded in the script
$envFilePath = Join-Path $PSScriptRoot "..\.env.local"

if (Test-Path $envFilePath) {
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $val = $parts[1].Trim()
                if ($key -and $val) {
                    Write-Host "Syncing $key to Vercel production..."
                    $val | npx -y vercel env add $key production
                }
            }
        }
    }
}
