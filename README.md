# Geek - Avaliações de Entretenimento

Aplicação web minimalista para avaliações de filmes, séries, livros e outros conteúdos de entretenimento.

Estilo limpo e sofisticado (inspirado em Notion, Vercel e Letterboxd).

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + CSS Variables (temas)
- **Prisma** + PostgreSQL (ou SQLite)
- **NextAuth.js** (autenticação)
- **Lucide React** (ícones)
- **Zod** (validação)

## Funcionalidades

- Sistema de temas dinâmico: Claro / Escuro / Sistema (salvo em localStorage)
- Autenticação completa (cadastro, login, logout, sessão)
- Busca global de obras pelo nome original
- **Cadastro manual de obras**: se a obra não existir, o usuário pode cadastrá-la diretamente pela busca
- Sistema de reviews com nota numérica e texto detalhado
- Prioridade ao nome original oficial da obra
- Capa via URL de imagem

## Como rodar

### 1. Clone e instale

```bash
git clone https://github.com/qeloize-elyot/geek.git
cd geek
npm install
```

### 2. Configure o ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/geek?schema=public"
# ou para desenvolvimento rápido:
# DATABASE_URL="file:./dev.db"

NEXTAUTH_SECRET="gere-um-segredo-forte-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Banco de dados

```bash
npx prisma generate
npx prisma db push
```

### 4. Rode o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura principal

```
src/
├── app/                  # Rotas (App Router)
├── components/
│   ├── theme/            # ThemeProvider + ThemeToggle
│   ├── search/           # Busca global + modal de cadastro manual
│   ├── works/            # Cards e capa
│   ├── reviews/          # Formulário e lista de reviews
│   └── ui/               # Componentes base
├── lib/                  # Prisma, auth, utils
└── types/
```

## Diretrizes de design

- Zero emojis em toda a interface
- Ícones apenas via Lucide React
- Temas claro, escuro e system com persistência
- Visual extremamente limpo e sem poluição
