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
DoceAjuda/
├── assets/ # Imagens e fontes
├── src/
│ ├── config/
│ │ └── firebase.ts # Configuração do Firebase
│ ├── contexts/
│ │ ├── AuthContext.tsx # Provedor de autenticação
│ │ └── useAuth.ts # Hook de autenticação
│ ├── database/
│ │ └── database.ts # Inicialização e queries do SQLite
│ ├── navigation/
│ │ └── AppNavigator.tsx # Navegação do app
│ ├── screens/
│ │ ├── LoginScreen.tsx
│ │ ├── MenuScreen.tsx
│ │ ├── EstoqueScreen.tsx
│ │ ├── ReceitasScreen.tsx
│ │ ├── OrcamentosScreen.tsx
│ │ ├── VendasScreen.tsx
│ │ └── ClientesScreen.tsx
│ ├── components/
│ │ └── EmConstrucaoScreen.tsx
│ └── types/
│ └── index.ts # Tipagens globais
├── App.tsx # Ponto de entrada do app
├── app.json # Configuração do Expo
├── tsconfig.json # Configuração do TypeScript
└── package.json
