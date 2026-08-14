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
cd "$d/server"

echo '--- admin row ---'
sqlite3 database.db "SELECT id, login, isadmin, email FROM users WHERE isadmin=1 LIMIT 1"

echo '--- login test ---'
printf '{"login":"oookoosmo@mail.ru","password":"tamina1040103"}\n' > /tmp/login.json
curl -s --max-time 10 --data @/tmp/login.json --header content-type:application/json http://127.0.0.1:3001/api/auth
'@

$bytes = [System.Text.Encoding]::UTF8.GetBytes($script)
$b64 = [System.Convert]::ToBase64String($bytes)
$remoteCmd = "echo $b64 | base64 -d | bash"

ssh -T -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -i "$keyPath" root@82.202.170.14 $remoteCmd
