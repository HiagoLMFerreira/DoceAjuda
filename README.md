# 🍫 DoceAjuda

O **DoceAjuda** é um aplicativo mobile desenvolvido para auxiliar pequenos negócios de confeitaria na organização e controle das principais rotinas do dia a dia.

A aplicação permite gerenciar clientes, estoque, compras, receitas, produtos para venda, orçamentos, vendas e relatórios, centralizando informações importantes para melhorar o controle do negócio e apoiar a tomada de decisões.

O sistema conta com autenticação de usuários via **Firebase Authentication** e armazenamento local de dados utilizando **Expo SQLite**.

---

## 📱 Funcionalidades do Aplicativo

### 🏠 Menu Principal

* Navegação centralizada entre os módulos do sistema.
* Acesso rápido às áreas de clientes, estoque, compras, receitas, produtos, orçamentos, vendas e relatórios.

### 👥 Clientes

* Cadastro de clientes.
* Edição e exclusão de registros.
* Busca por nome ou ID.
* Visualização detalhada dos dados do cliente.
* Ordenação da listagem por cliente e total de compras.

### 📦 Estoque

* Cadastro de produtos e ingredientes.
* Controle de quantidade disponível.
* Entrada e saída manual de estoque.
* Registro de código de barras.
* Busca por nome, ID ou código de barras.
* Leitura de código de barras pela câmera.
* Controle de preço da última entrada.
* Cálculo de preço médio dos produtos.

### 🛒 Compras

* Registro de compras realizadas.
* Atualização automática do estoque.
* Atualização do preço médio e do preço da última entrada.
* Consulta e organização das compras cadastradas.

### 🧾 Receitas / Fichas Técnicas

* Cadastro de receitas.
* Inclusão de ingredientes do estoque.
* Definição de quantidade utilizada.
* Registro de rendimento.
* Modo de preparo.
* Edição e remoção de itens da receita.
* Consulta detalhada da ficha técnica.

### 🍰 Produtos para Venda

* Cadastro de produtos comercializados.
* Associação com receitas cadastradas.
* Inclusão de embalagens e itens diretos do estoque.
* Cálculo do custo total do produto.
* Definição da margem de lucro.
* Sugestão automática do preço de venda.
* Cálculo considerando custos fixos, custos variáveis e tempo de produção.

### 📋 Orçamentos

* Cadastro de orçamentos.
* Seleção de cliente.
* Inclusão de produtos, receitas e itens diretos.
* Cálculo automático de subtotal e total.
* Visualização detalhada do orçamento.
* Geração de PDF compartilhável.
* Lista de necessidades comparando os itens necessários com o estoque disponível.
* Conversão de orçamento em venda.

### 💰 Vendas

* Registro de vendas diretas.
* Conversão de orçamento em venda.
* Seleção da forma de pagamento.
* Baixa automática no estoque ao concluir a venda.
* Validação de estoque suficiente antes da conclusão.
* Cancelamento de venda com estorno automático do estoque.
* Controle para evitar baixa duplicada, estorno duplicado e conversão duplicada de orçamento.

### 📊 Relatórios

* Relatório de vendas.
* Relatório de compras.
* Relatório de estoque.
* Relatório de clientes.
* Filtros por período.
* Opções rápidas de data.
* Exibição de totais.
* Geração de PDF compartilhável.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia              | Finalidade                                      |
| ----------------------- | ----------------------------------------------- |
| React Native            | Desenvolvimento mobile multiplataforma          |
| Expo                    | Plataforma de desenvolvimento, execução e build |
| TypeScript              | Tipagem estática e maior segurança no código    |
| Firebase Authentication | Autenticação de usuários                        |
| Expo SQLite             | Banco de dados local                            |
| React Navigation        | Navegação entre telas                           |
| Expo Camera             | Leitura de código de barras                     |
| Expo Print              | Geração de arquivos PDF                         |
| Expo Sharing            | Compartilhamento de arquivos                    |
| Ionicons                | Ícones utilizados na interface                  |

---

## 📁 Estrutura de Pastas

```txt
DoceAjuda/
├── assets/                         # Imagens, ícones e recursos visuais
│
├── src/
│   ├── components/
│   │   └── BarcodeScannerModal.tsx  # Componente para leitura de código de barras
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Contexto de autenticação
│   │   └── useAuth.ts               # Hook personalizado de autenticação
│   │
│   ├── database/
│   │   └── database.ts              # Criação das tabelas e operações SQLite
│   │
│   ├── firebase/
│   │   └── config.ts                # Configuração do Firebase
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Configuração das rotas da aplicação
│   │
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Tela de login
│   │   ├── CadastroScreen.tsx       # Tela de cadastro de usuário
│   │   ├── MenuScreen.tsx           # Menu principal
│   │   ├── ClientesScreen.tsx       # Módulo de clientes
│   │   ├── EstoqueScreen.tsx        # Módulo de estoque
│   │   ├── ComprasScreen.tsx        # Módulo de compras
│   │   ├── ReceitasScreen.tsx       # Módulo de receitas
│   │   ├── ProdutosVendaScreen.tsx  # Módulo de produtos para venda
│   │   ├── OrcamentosScreen.tsx     # Módulo de orçamentos
│   │   ├── VendasScreen.tsx         # Módulo de vendas
│   │   └── RelatoriosScreen.tsx     # Módulo de relatórios
│   │
│   └── types.ts                     # Tipagens globais do projeto
│
├── App.tsx                         # Componente principal da aplicação
├── index.ts                        # Arquivo inicial do projeto
├── app.json                        # Configurações do Expo
├── tsconfig.json                   # Configuração do TypeScript
└── package.json                    # Dependências e scripts do projeto
```

---

## 🔑 Credencial de Teste

Para acessar o aplicativo em ambiente de teste, utilize:

```txt
E-mail: x@x.com
Senha: 123456
```

---

## ⚙️ Como Executar o Projeto

### 1. Instalar as dependências

```bash
npm install
```

### 2. Iniciar o projeto

```bash
npx expo start
```

Após iniciar o projeto, o Expo exibirá as opções para executar a aplicação em um emulador Android, iOS ou em um dispositivo físico utilizando o aplicativo **Expo Go**.

---

## 📦 Dependências Principais

Caso seja necessário instalar manualmente as dependências principais do projeto, utilize:

```bash
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/drawer
npm install @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install expo-sqlite
npm install firebase
npm install expo-camera
npm install expo-print
npm install expo-sharing
npm install @expo/vector-icons
```

---

## 🗄️ Banco de Dados

O projeto utiliza **Expo SQLite** para armazenar os dados localmente no dispositivo.

As tabelas e operações principais estão centralizadas no arquivo:

```txt
src/database/database.ts
```

Esse arquivo é responsável pela criação das tabelas e pelas funções de cadastro, consulta, edição, exclusão e atualização dos dados utilizados nos módulos do sistema.

---

## 🔐 Autenticação

A autenticação dos usuários é realizada com **Firebase Authentication**.

A configuração do Firebase está localizada em:

```txt
src/firebase/config.ts
```

O controle de autenticação é gerenciado por meio do contexto:

```txt
src/contexts/AuthContext.tsx
```

---

## 🧮 Regras de Negócio

### Precificação

A margem informada representa a margem de lucro desejada sobre o preço de venda.

A fórmula utilizada é:

```txt
Preço sugerido = Custo total / (1 - Margem de lucro / 100)
```

Exemplo:

```txt
Custo total: R$ 30,00
Margem desejada: 30%

Preço sugerido = 30 / (1 - 0,30)
Preço sugerido = R$ 42,86
```

### Rateio de Custos

O rateio de custos fixos e variáveis é calculado com base no tempo gasto na produção.

```txt
Custo rateado = ((Custos fixos + Custos variáveis) / Horas desejadas no mês) * Horas gastas no produto
```

Quando o tempo é informado em minutos, o sistema converte o valor para horas antes de realizar o cálculo.

### Controle de Estoque

Ao concluir uma venda, o sistema desconta automaticamente do estoque:

* Ingredientes utilizados nas receitas.
* Produtos diretos.
* Embalagens vinculadas ao produto.

Ao cancelar uma venda, o sistema devolve ao estoque as quantidades anteriormente descontadas.

---

## 📌 Status do Projeto

O projeto encontra-se funcional, com os principais módulos implementados e integrados.

Funcionalidades disponíveis:

* Autenticação.
* Clientes.
* Estoque.
* Compras.
* Receitas.
* Produtos para venda.
* Orçamentos.
* Vendas.
* Controle de estoque nas vendas.
* Cancelamento com estorno.
* Relatórios.
* Geração de PDFs.

---

## 👨‍💻 Autor

**Hiago Lucas Marculino Ferreira**
