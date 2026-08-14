$pass = $env:koosmo_root_pass
if (-not $pass) {
    Write-Error 'set $env:koosmo_root_pass first'
    exit 1
}

$script = @'
#!/bin/bash
set -e

cd /var/www/koosmo/NewMassajSalon/server

node -e "
const { initDb, getDb } = require('./db/db');
const { getUserByLogin } = require('./db/users');
const { addToken } = require('./db/tokens');
(async () => {
  console.log('initDb start');
  await initDb();
  console.log('initDb done');
  console.log('getUserByLogin start');
  const user = await getUserByLogin('oookoosmo@mail.ru');
  console.log('getUserByLogin done', JSON.stringify(user));
  console.log('addToken start');
  const token = await addToken(user.id);
  console.log('addToken done', token);
})().catch(err => { console.error('error', err); process.exit(1); });
"
'@

$bytes = [System.Text.Encoding]::UTF8.GetBytes($script)
$b64 = [System.Convert]::ToBase64String($bytes)
$remoteCmd = "echo $b64 | base64 -d | bash"

$pass | ssh -T -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=password -o PubkeyAuthentication=no root@82.202.170.14 $remoteCmd
