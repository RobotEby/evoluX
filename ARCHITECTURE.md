<!-- src/
├── app/ # 1. Configurações globais e inicialização
│ ├── providers/
│ │ └── theme-provider.tsx # (Veio de lib/)
│ ├── styles/
│ │ ├── index.css
│ │ └── App.css
│ ├── App.tsx
│ └── main.tsx
│
├── pages/ # 2. Páginas completas (Roteamento)
│ ├── dashboard/ui/Dashboard.tsx
│ ├── treino/ui/Treino.tsx
│ ├── treino/ui/EmTreino.tsx
│ ├── fichas/ui/Fichas.tsx
│ ├── fichas/ui/FichaDetail.tsx
│ ├── historico/ui/Historico.tsx
│ ├── progresso/ui/Progresso.tsx
│ ├── biblioteca/ui/Biblioteca.tsx
│ ├── onboarding/ui/Onboarding.tsx
│ ├── home/ui/Index.tsx # Renomeado para não conflitar com index do FSD
│ └── not-found/ui/NotFound.tsx
│
├── widgets/ # 3. Blocos independentes que compõem as páginas
│ ├── layout/ui/AppLayout.tsx # (Veio de components/)
│ ├── sidebar/ui/DesktopSidebar.tsx
│ └── navigation/ui/BottomNav.tsx
│
├── features/ # 4. Ações do usuário e interações
│ └── theme-toggle/ui/ThemeToggle.tsx # O botão de mudar tema é uma feature!
│
├── entities/ # 5. Entidades de negócio (O core do seu app)
│ ├── workout/ # Domínio dos treinos
│ │ ├── model/
│ │ │ └── workout.ts # Suas tipagens (Veio de types/)
│ │ └── api/
│ │ ├── exercises.ts # (Veio de data/)
│ │ └── mock-data.ts # (Veio de data/)
│ │
│ └── user/ # Futuramente, dados do usuário virão para cá
│
└── shared/ # 6. Código reutilizável, sem contexto de negócio
├── ui/
│ ├── ui/ # Todos os seus componentes do shadcn/ui
│ └── NavLink.tsx # Componente burro de UI
├── lib/
│ ├── utils.ts # Funções puras
│ └── storage.ts # Gerenciador de localStorage/IndexedDB
└── hooks/
├── use-mobile.tsx # (Veio de hooks/)
└── use-toast.ts # (Veio de hooks/) -->
