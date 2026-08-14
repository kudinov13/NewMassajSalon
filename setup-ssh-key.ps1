$pass = $env:koosmo_root_pass
if (-not $pass) {
    Write-Error 'set $env:koosmo_root_pass first'
    exit 1
}

$keyDir = Join-Path $env:USERPROFILE '.ssh'
if (-not (Test-Path $keyDir)) {
    New-Item -ItemType Directory -Path $keyDir -Force | Out-Null
}

# get short 8.3 path to avoid spaces in ssh-keygen -f
$shortDir = (cmd /c "for %A in (`"$keyDir`") do @echo %~sA" | Select-Object -Last 1).Trim()
if (-not $shortDir) {
    Write-Error 'Could not get short path for .ssh directory'
    exit 1
}

$keyPath = "$shortDir\koosmo_deploy"
$pubPath = "$keyPath.pub"

if (-not (Test-Path $keyPath)) {
    Write-Host "Generating SSH key for koosmo deploy at $keyPath..."
    $genCmd = "ssh-keygen -t ed25519 -f `"$keyPath`" -N `"`" -C koosmo-deploy"
    cmd /c $genCmd
} else {
    Write-Host "SSH key already exists at $keyPath"
}

if (-not (Test-Path $pubPath)) {
    Write-Error "Public key not found at $pubPath"
    exit 1
}

Write-Host 'Copying public key to server...'
$pubKey = (Get-Content $pubPath).Trim()
$remoteCmd = "mkdir -p .ssh && chmod 700 .ssh && echo '$pubKey' >> .ssh/authorized_keys && chmod 600 .ssh/authorized_keys"
& .\deploy-ssh.cmd "$remoteCmd"

Write-Host 'Testing passwordless SSH...'
ssh -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=publickey -o PasswordAuthentication=no -i "$keyPath" root@82.202.170.14 'echo OK'
if ($LASTEXITCODE -eq 0) {
    Write-Host 'SSH key auth works'
} else {
    Write-Host "SSH key test failed (exit $LASTEXITCODE)"
}
