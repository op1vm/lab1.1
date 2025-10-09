param(
  [int]$Port = 5500,
  [string]$BasicAuth = 'user:password',
  [string]$NgrokPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe",
  [string]$NodePath = 'C:\Program Files\nodejs\node.exe'
)

function Stop-NgrokIfRunning {
  Get-Process -Name ngrok -ErrorAction SilentlyContinue | ForEach-Object { 
    Write-Output "Stopping ngrok (PID: $($_.Id))"; 
    $_ | Stop-Process -Force -ErrorAction SilentlyContinue 
  }
}

function Start-LocalServer {
  if(Test-Path $NodePath -PathType Leaf -ErrorAction SilentlyContinue) {
    Write-Output "Starting local server with node: $NodePath"
    Start-Process -FilePath $NodePath -ArgumentList 'serve.js' -WorkingDirectory (Get-Location) -NoNewWindow -PassThru | Out-Null
    Start-Sleep -Seconds 1
  } else {
    Write-Output "Node not found at $NodePath. Ensure server is running on port $Port.";
  }
}

function Start-Ngrok {
  param($NgrokPath, $Port, $BasicAuth)
  $out = Join-Path $env:TEMP 'ngrok-out.log'
  $err = Join-Path $env:TEMP 'ngrok-err.log'
  if(Test-Path $out){ Remove-Item $out -Force -ErrorAction SilentlyContinue }
  if(Test-Path $err){ Remove-Item $err -Force -ErrorAction SilentlyContinue }

  Write-Output "Starting ngrok from: $NgrokPath"
  Start-Process -FilePath $NgrokPath -ArgumentList "http $Port --basic-auth='$BasicAuth' --log=stdout --log-format=json" -RedirectStandardOutput $out -RedirectStandardError $err -NoNewWindow -PassThru | Out-Null
  Start-Sleep -Seconds 2
  if(Test-Path $out){ Get-Content $out -Tail 200 }
}

Stop-NgrokIfRunning
Start-LocalServer
Start-Ngrok -NgrokPath $NgrokPath -Port $Port -BasicAuth $BasicAuth

Write-Output "To stop ngrok: Get-Process -Name ngrok | Stop-Process"
Write-Output "Inspect logs: $env:TEMP\ngrok-out.log"
