@echo off
set KEY=%USERPROFILE%\.ssh\koosmo_deploy
if exist "%KEY%" (
    ssh -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=publickey -o PasswordAuthentication=no -i "%KEY%" root@82.202.170.14 "%~1" 2>&1
) else (
    echo vbif88vbif | ssh -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o PreferredAuthentications=password -o PubkeyAuthentication=no root@82.202.170.14 "%~1" 2>&1
)
