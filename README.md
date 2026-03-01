# FastDocs - Gerador de Documentos

Sistema profissional de gestão e geração automatizada de documentos com calendário de eventos integrado.

## Tecnologias Utilizadas

- **Vite** - Build tool e servidor de desenvolvimento
- **TypeScript** - Superset tipado do JavaScript
- **React 18** - Biblioteca para construção de interfaces
- **shadcn/ui** - Componentes UI baseados em Radix UI
- **Tailwind CSS** - Framework CSS utilitário
- **React Router DOM** - Roteamento no cliente
- **React Query** - Gerenciamento de estado para dados assíncronos
- **React Hook Form + Zod** - Formulários e validação
- **Axios** - Cliente HTTP

## Como Executar o Projeto

### Pré-requisitos

- Node.js 18+ e npm instalados

### Passos para Desenvolvimento

```sh
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Entrar no diretório do projeto
cd fastdocs-frontend

# 3. Instalar dependências
npm install

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:8080`.

### Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Pré-visualiza o build de produção
- `npm run test` - Executa testes com Vitest
- `npm run lint` - Executa linter ESLint

## Estrutura do Projeto

```
fastdocs-frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   ├── ui/         # Componentes shadcn/ui
│   │   └── ...         # Outros componentes
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e configurações
│   ├── services/       # Serviços de API
│   └── test/           # Configurações de testes
├── public/             # Arquivos estáticos
└── ...configurações
```

## Funcionalidades

- **Gestão de Templates**: Criação, edição e exclusão de templates de documentos
- **Preenchimento Inteligente**: Interface para preencher templates com dados dinâmicos
- **Calendário Integrado**: Visualização e gestão de eventos relacionados a documentos
- **Responsividade**: Interface adaptada para mobile e desktop

## Desenvolvimento

### Adicionar Novos Componentes UI

Este projeto utiliza [shadcn/ui](https://ui.shadcn.com/). Para adicionar novos componentes:

```sh
npx shadcn-ui@latest add <component-name>
```

### Testes

O projeto utiliza Vitest e Testing Library para testes. Para executar:

```sh
npm run test           # Executa testes uma vez
npm run test:watch     # Modo watch
npm run test:ui        # Interface visual de testes
```

## Deploy

Para criar um build de produção:

```sh
npm run build
```

Os arquivos gerados estarão no diretório `dist/` e podem ser servidos por qualquer servidor web estático.

## Licença

[MIT](LICENSE)
