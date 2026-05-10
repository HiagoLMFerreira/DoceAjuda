# 🍫 Doce Ajuda

Aplicativo mobile para gestão de pequenos negócios de confeitaria. Controle de estoque, orçamentos, vendas e cadastro de clientes, com autenticação segura via Firebase.

---

## 📱 Telas do aplicativo

- **Login** – autenticação por e‑mail e senha (Firebase Auth)
- **Menu principal** – navegação para todas as áreas do sistema
- **Estoque** – entrada/saída de produtos, cadastro de novos itens
- **Receitas** – calculadora de custo de receitas *(em construção)*
- **Orçamentos** – criação e consulta de orçamentos *(em construção)*
- **Vendas** – registro de vendas e relatórios *(em construção)*
- **Clientes** – cadastro, busca e visualização de clientes

---

## 🚀 Tecnologias

| Tecnologia | Finalidade |
|------------|------------|
| [React Native](https://reactnative.dev/) | Framework mobile multiplataforma |
| [Expo](https://expo.dev/) | Plataforma de desenvolvimento e build |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Firebase Auth](https://firebase.google.com/products/auth) | Autenticação de usuários |
| [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) | Banco de dados local |
| [React Navigation](https://reactnavigation.org/) | Navegação entre telas |

---

## 📁 Estrutura de pastas
```bash
DoceAjuda/
├── assets/                     # Imagens, ícones e fontes
├── src/
│   ├── config/
│   │   └── firebase.ts         # Configuração do Firebase
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Contexto de autenticação
│   │   └── useAuth.ts          # Hook personalizado de autenticação
│   │
│   ├── database/
│   │   └── database.ts         # Inicialização e operações SQLite
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Configuração das rotas e navegação
│   │
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── MenuScreen.tsx
│   │   ├── EstoqueScreen.tsx
│   │   ├── ReceitasScreen.tsx
│   │   ├── OrcamentosScreen.tsx
│   │   ├── VendasScreen.tsx
│   │   └── ClientesScreen.tsx
│   │
│   ├── components/
│   │   └── EmConstrucaoScreen.tsx  # Tela reutilizável de "Em construção"
│   │
│   └── types/
│       └── index.ts            # Tipagens globais do projeto
│
├── App.tsx                     # Ponto de entrada da aplicação
├── app.json                    # Configurações do Expo
├── tsconfig.json               # Configuração do TypeScript
└── package.json                # Dependências e scripts do projeto
