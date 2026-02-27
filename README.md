# RPG Platform 🎲

Plataforma digital de RPG multi-sistema, auto-hospedável. Crie fichas de personagem, gerencie campanhas, role dados em tempo real e importe qualquer sistema via PDF.

---

## ✨ Funcionalidades

- **Multi-sistema** — Suporte a qualquer RPG via JSON schema dinâmico
- **Importação por PDF** — Suba o livro de regras e extraímos origens, rituais, armas e muito mais
- **Fichas interativas** — Atributos, perícias, inventário, magias/rituais, status e anotações
- **Modo Mestre (Escudo do Mestre)** — Visualize todos os personagens, gerencie NPCs, faça anúncios
- **Dados em tempo real** — Rolagens transmitidas via Socket.io para toda a mesa
- **Auto-hospedável** — Docker Compose + Portainer ready

---

## 🚀 Início Rápido (Docker)

### 1. Pré-requisitos
- Docker e Docker Compose instalados
- Portainer (opcional, mas recomendado)

### 2. Configurar variáveis
```bash
cp .env.example .env
```

Edite o `.env` e configure:
- `POSTGRES_PASSWORD` — senha segura para o banco
- `JWT_SECRET` — string aleatória longa (mínimo 64 chars)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `NEXT_PUBLIC_APP_URL` — URL pública da sua aplicação

### 3. Subir os serviços
```bash
docker-compose up -d
```

### 4. Executar migrations e seed
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run db:seed
```

### 5. Acessar
Abra [http://localhost:3000](http://localhost:3000)

**Login admin padrão:** `admin` / `admin123`  
> ⚠️ Troque a senha do admin imediatamente após o primeiro login!

---

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 20+
- PostgreSQL 14+ rodando localmente

### Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite DATABASE_URL para apontar para seu PostgreSQL local

# Criar banco e rodar migrations
npm run db:push

# Popular com dados de exemplo (Ordem Paranormal + D&D 5e)
npm run db:seed

# Iniciar em modo desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Login, registro, logout, me
│   │   ├── campaigns/     # CRUD de campanhas
│   │   ├── characters/    # CRUD de personagens
│   │   ├── dice/          # Histórico de rolagens
│   │   ├── import/pdf/    # Importação via PDF
│   │   └── systems/       # Listagem de sistemas
│   ├── campaigns/         # Página do jogador na campanha
│   ├── dashboard/         # Dashboard principal
│   ├── gm/                # Painel do Mestre
│   ├── import/            # Upload de PDF
│   ├── login/             # Autenticação
│   ├── register/          # Registro
│   ├── sheet/             # Fichas de personagem
│   └── systems/           # Catálogo de sistemas
├── components/
│   ├── dice/              # DicePanel
│   ├── providers/         # AuthProvider
│   └── sheet/             # Componentes da ficha
├── hooks/                 # useSocket, useDiceRoll
├── lib/                   # auth, prisma, dice, utils
├── stores/                # Zustand (auth, dice)
└── types/                 # Tipos TypeScript (rpg.ts)
prisma/
├── schema.prisma          # Schema do banco
└── seed.ts                # Dados iniciais (OP, D&D 5e)
server.ts                  # Servidor customizado com Socket.io
```

---

## 🎮 Sistemas Incluídos

### Ordem Paranormal
- 16 origens (Amnésico, Artista, Militar…)
- 27 perícias com atributos vinculados
- Atributos: FOR, AGI, INT, PRE, VIG
- Status derivados: PV, PE, Sanidade
- 6 rituais de exemplo
- 6 armas de exemplo
- 12 condições (Abalado, Apavorado, Paralisado…)

### D&D 5e
- 6 atributos (STR, DEX, CON, INT, WIS, CHA)
- 18 perícias
- CA + PV derivados

---

## 📤 Importando Novos Sistemas via PDF

1. Acesse **Sistemas → Importar via PDF**
2. Selecione o PDF do livro de regras
3. Aguarde o processamento (≈1-2 min)
4. O sistema fica disponível para criar personagens

**O que é extraído automaticamente:**
- Origens / Backgrounds
- Rituais / Magias / Poderes
- Armas e equipamentos
- Perícias
- Condições

---

## 🐳 Deploy com Portainer

1. No Portainer, vá em **Stacks → Add Stack**
2. Cole o conteúdo do `docker-compose.yml`
3. Configure as variáveis de ambiente no campo **Environment variables**
4. Clique em **Deploy the stack**

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | — |
| `JWT_SECRET` | Segredo para JWT (mínimo 32 chars) | — |
| `PORT` | Porta do servidor | `3000` |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação | `http://localhost:3000` |
| `POSTGRES_DB` | Nome do banco (Docker) | `rpgplatform` |
| `POSTGRES_USER` | Usuário do banco (Docker) | `rpg` |
| `POSTGRES_PASSWORD` | Senha do banco (Docker) | — |

---

## 🛡️ Segurança

- Senhas hash com bcrypt (12 rounds)
- JWT em cookie httpOnly (30 dias)
- Middleware de rotas protegidas
- Sem OAuth / dependências externas

---

## 📄 Licença

MIT
