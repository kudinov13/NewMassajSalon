$pass = $env:koosmo_root_pass
if (-not $pass) {
    Write-Error 'set $env:koosmo_root_pass first'
    exit 1
}

$script = @'
#!/bin/bash
set -x

pkill -f 'node index.js' || true
sleep 1

cd /var/www/koosmo/NewMassajSalon/server
nohup runuser -u www-data -- sh -c 'cd /var/www/koosmo/NewMassajSalon/server && node index.js' > /tmp/node.log 2>&1 </dev/null &
sleep 3

echo '--- node log ---'
tail -n 50 /tmp/node.log
'@

$bytes = [System.Text.Encoding]::UTF8.GetBytes($script)
$b64 = [System.Convert]::ToBase64String($bytes)
$remoteCmd = "echo $b64 | base64 -d | bash"

$pass | ssh -T -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=password -o PubkeyAuthentication=no root@82.202.170.14 $remoteCmd
