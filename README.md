# Geek

Catalogo pessoal de entretenimento: filmes, series, livros, animes e jogos.

Estetica limpa (inspirada em Letterboxd / Notion). Identidade propria focada em **registrar, organizar e avaliar** o que voce consome.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS + temas (claro / escuro / sistema)
- Prisma + PostgreSQL (Neon)
- NextAuth.js
- Lucide React (sem emojis)

## Funcionalidades

### Base
- Cadastro, login e sessao
- Obras com nome original, categoria, ano, capa e tags
- Busca global + cadastro manual se nao existir
- Reviews com nota 0-10, texto e marcacao de spoiler
- Like em reviews

### Fase 1
- Status por obra: Quero ver / Consumindo / Concluido / Pausado / Abandonei
- Watchlist pessoal agrupada por status
- Perfil com stats, media e distribuicao de notas
- Rankings globais
- Filtros na home (categoria, ordenacao, nota minima)

### Fase 2
- Ate 4 favoritos no perfil
- Listas personalizadas publicas
- Diario de consumo (data + rewatch)
- Tags nas obras

## Como rodar

```bash
git clone https://github.com/qeloize-elyot/geek.git
cd geek
npm install
cp .env.example .env
# configure DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npx prisma generate
npx prisma db push
npm run dev
```

## Rotas principais

| Rota | Descricao |
|------|-----------|
| `/` | Explorar + busca + filtros |
| `/works/[id]` | Pagina da obra |
| `/rankings` | Ranking por media |
| `/watchlist` | Status pessoais |
| `/diary` | Diario |
| `/lists` | Suas listas |
| `/profile/[id]` | Perfil publico |
