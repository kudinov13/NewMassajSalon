$keyPath = Join-Path $env:USERPROFILE '.ssh\koosmo_deploy'
if (-not (Test-Path $keyPath)) {
    Write-Error "SSH key not found at $keyPath; run setup-ssh-key.ps1 first"
    exit 1
}

$script = @'
#!/bin/bash
set -e
set -x

cd /var/www/koosmo
d=$(find . -mindepth 1 -maxdepth 1 -type d | head -n1)
cd "$d"

git pull origin main

cd server

pkill -f 'node index.js' || true
sleep 1

nohup runuser -u www-data -- sh -c "cd $(pwd) && node index.js" > /dev/null 2>&1 </dev/null &
sleep 2

nginx -s reload || true
'@

$bytes = [System.Text.Encoding]::UTF8.GetBytes($script)
$b64 = [System.Convert]::ToBase64String($bytes)
$remoteCmd = "echo $b64 | base64 -d | bash"

ssh -T -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i "$keyPath" root@82.202.170.14 $remoteCmd
