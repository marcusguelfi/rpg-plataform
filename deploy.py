import paramiko
import os
import stat
import sys
from pathlib import Path

HOST = '192.168.0.225'
USER = 'larry'
PASS = 'h7t846m2'
REMOTE_DIR = '/home/larry/rpg-platform'
LOCAL_DIR = Path(r'C:\rpg-platform')

EXCLUDE = {
    'node_modules', '.next', '.git', '__pycache__',
    '.venv', 'venv', 'deploy_check.py', 'deploy.py',
    '.env',  # vamos criar no servidor
}

def should_skip(path: Path) -> bool:
    for part in path.parts:
        if part in EXCLUDE:
            return True
    return False

def collect_files(base: Path):
    files = []
    for root, dirs, filenames in os.walk(base):
        root_path = Path(root)
        rel_root = root_path.relative_to(base)
        dirs[:] = [d for d in dirs if d not in EXCLUDE]
        for fname in filenames:
            rel = rel_root / fname
            if not should_skip(rel):
                files.append((root_path / fname, str(rel).replace('\\', '/')))
    return files

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print(f'Conectando a {HOST}...')
client.connect(HOST, username=USER, password=PASS, timeout=15)

def run(cmd, show=True):
    _, stdout, stderr = client.exec_command(cmd, get_pty=True)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    if show and out:
        print(out)
    return out, exit_status

# Criar diretório remoto
print(f'\n📁 Criando {REMOTE_DIR}...')
run(f'mkdir -p {REMOTE_DIR}/prisma/migrations {REMOTE_DIR}/public {REMOTE_DIR}/src', show=False)

# Upload dos arquivos via SFTP
sftp = client.open_sftp()

def mkdirs_remote(sftp, path):
    parts = path.split('/')
    current = ''
    for part in parts:
        if not part:
            continue
        current += '/' + part
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)

files = collect_files(LOCAL_DIR)
print(f'📤 Enviando {len(files)} arquivos...\n')

for i, (local_path, rel_path) in enumerate(files, 1):
    remote_path = f'{REMOTE_DIR}/{rel_path}'
    remote_dir = remote_path.rsplit('/', 1)[0]
    try:
        mkdirs_remote(sftp, remote_dir)
        sftp.put(str(local_path), remote_path)
        if i % 20 == 0 or i == len(files):
            print(f'  [{i}/{len(files)}] {rel_path}')
    except Exception as e:
        print(f'  ⚠️  Erro em {rel_path}: {e}', file=sys.stderr)

sftp.close()
print(f'\n✅ Upload concluído!')

# Criar .env no servidor
import secrets
jwt_secret = secrets.token_hex(64)

env_content = f"""POSTGRES_DB=rpgplatform
POSTGRES_USER=rpg
POSTGRES_PASSWORD=rpg_secure_2026
DATABASE_URL=postgresql://rpg:rpg_secure_2026@postgres:5432/rpgplatform
JWT_SECRET={jwt_secret}
PORT=3200
NEXT_PUBLIC_APP_URL=http://192.168.0.225:3200
NODE_ENV=production
"""

with client.open_sftp() as sftp:
    with sftp.file(f'{REMOTE_DIR}/.env', 'w') as f:
        f.write(env_content)

print('🔐 .env criado com JWT_SECRET gerado automaticamente')
print(f'🌐 A aplicação será exposta em: http://192.168.0.225:3200')

# Build e start com Docker Compose
print('\n🐳 Iniciando Docker Compose build...')
print('   (pode levar 3-5 minutos no primeiro build)\n')

build_cmd = f'cd {REMOTE_DIR} && docker compose --env-file .env up -d --build 2>&1'
_, stdout, stderr = client.exec_command(build_cmd, get_pty=True)

# Stream output
while True:
    line = stdout.readline()
    if not line:
        break
    print(' ', line.rstrip())

exit_status = stdout.channel.recv_exit_status()

if exit_status == 0:
    print('\n✅ Containers iniciados!')
else:
    print(f'\n⚠️  Docker Compose retornou código {exit_status}')

# Status final
print('\n📊 Status dos containers:')
run(f'cd {REMOTE_DIR} && docker compose ps')

client.close()
print('\n🎲 Deploy concluído!')
print(f'   App:       http://192.168.0.225:3200')
print(f'   Portainer: http://192.168.0.225:9000')
print(f'   Login:     admin / admin123')
