# 🏖️ Sistema de Agendamento (Casa de Praia)

Um sistema de agendamento full-stack moderno, construído com Next.js, React, TypeScript, Prisma e Supabase (PostgreSQL). Este projeto foi refatorado de uma aplicação Node/Express + HTML/JS para uma arquitetura profissional baseada em Next.js (App Router).

O sistema permite que usuários se registrem, façam login, gerenciem reservas em um calendário interativo e inclui um painel de administração completo para gerenciamento de usuários e reservas.

---

## ✨ Features Principais

* **Autenticação Completa:** Cadastro, Login e gerenciamento de sessão (JWT) usando **NextAuth.js**.
* **Banco de Dados (Cloud):** Conectado a um banco **PostgreSQL** hospedado no **Supabase**, com schema gerenciado pelo **Prisma ORM**.
* **Calendário Interativo:** UI moderna com **React** e **TailwindCSS**, permitindo seleção de intervalo de datas (clique-início, clique-fim).
* **Feedback de UX Moderno:** Notificações (Toasts) com `react-hot-toast` e estados de loading em todas as ações assíncronas.
* **Controle de Acesso (RBAC):**
    * **Tela "Minhas Reservas":** Usuários podem ver e cancelar suas próprias reservas.
    * **Tela "Meu Perfil":** Usuários podem atualizar nome e senha (com validação de senha antiga).
    * **Painel de Administração:** Uma rota (`/admin`) protegida por **Middleware** que só permite acesso a usuários com `role` de `ADMIN`. Admins podem ver e cancelar *todas* as reservas.
* **Pronto para Produção:**
    * **CI/CD:** Pipeline de **GitHub Actions** que roda Lint, Testes Unitários (Jest) e Build a cada PR.
    * **Docker:** Totalmente "conteinerizado" com `Dockerfile` multi-estágio e `docker-compose.yml`.

---

## 🚀 Como Rodar o Projeto

Este projeto está localizado dentro da pasta `casa-praia-next/`.

### Opção 1: Rodar com Docker (Recomendado)

Esta é a maneira mais fácil e rápida. Você só precisa ter o Docker Desktop instalado e rodando.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/ViniMTrevisan/agendamento-praia.git](https://github.com/ViniMTrevisan/agendamento-praia.git)
    cd agendamento-praia/casa-praia-next
    ```

2.  **Crie o arquivo de ambiente:**
    * Crie um arquivo chamado `.env.docker` dentro da pasta `casa-praia-next`.
    * (Este arquivo é o mesmo que você criou no PR #12).

3.  **Configure as Variáveis de Ambiente** (`.env.docker`):
    ```.env
    # Sua URL do Supabase (com pgbouncer e porta 6543)
    DATABASE_URL="postgresql://..."

    # Seu segredo do NextAuth
    AUTH_SECRET="seu_segredo_aqui"

    # A URL que o Docker vai usar
    NEXTAUTH_URL="http://localhost:3001"
    ```

4.  **Inicie o Docker Compose:**
    ```bash
    docker-compose up --build
    ```

5.  **Acesse:** Abra `http://localhost:3001` no seu navegador.

### Opção 2: Rodar Localmente (Desenvolvimento)

1.  **Navegue até a pasta do projeto:**
    ```bash
    cd agendamento-praia/casa-praia-next
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Crie o arquivo de ambiente:**
    * Crie um arquivo chamado `.env` (ou `.env.local`).

4.  **Configure as Variáveis de Ambiente** (`.env`):
    * Copie o mesmo conteúdo do `.env` acima.

5.  **Sincronize o Banco de Dados:**
    * O Prisma precisa "empurrar" o schema para o seu banco Supabase.
    * *(Nota: Se o `pgbouncer` travar no terminal, use a URL de conexão direta (porta 5432) temporariamente para este comando).*
    ```bash
    npx prisma db push
    ```

6.  **Promova um Admin (Obrigatório):**
    * Para testar o Painel de Admin, você precisa se promover manualmente:
    ```bash
    npx prisma studio
    ```
    * Abra o modelo `User`, encontre seu usuário e mude o campo `role` de `USER` para `ADMIN`.

7.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

8.  **Acesse:** Abra `http://localhost:3000` (ou a porta que o Next.js indicar).

---

## 🧪 Como Rodar os Testes

1.  **Testes Unitários (Jest):**
    ```bash
    npm run test:unit
    ```
