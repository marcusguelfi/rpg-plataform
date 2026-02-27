import paramiko
import sys

HOST = '192.168.0.225'
USER = 'larry'
PASS = 'h7t846m2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASS, timeout=15)

def run(cmd, show=True):
    _, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if show:
        if out: print(out)
        if err: print('[ERR]', err, file=sys.stderr)
    return out

print('=== Sistema ===')
run('uname -a')
run('cat /etc/os-release | head -5')

print('\n=== Docker ===')
run('docker --version')
run('docker compose version 2>/dev/null || docker-compose --version 2>/dev/null')

print('\n=== Portainer ===')
run('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -i portainer || echo "Portainer nao encontrado como container"')

print('\n=== Disco ===')
run('df -h / | tail -1')

print('\n=== Diretorio de projetos ===')
run('ls /opt/ 2>/dev/null || echo "/opt nao existe"')
run('ls /home/larry/ 2>/dev/null')

client.close()
print('\nOK — servidor acessivel')
