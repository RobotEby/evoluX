```text
src/
├── app/                        # 1. Configurações globais e inicialização
│   ├── providers/
│   │   ├── theme-provider.tsx  
│   │   └── router-provider.tsx # Configuração do React Router Dom
│   ├── styles/
│   │   ├── index.css
│   │   └── App.css
│   ├── App.tsx
│   └── main.tsx
│
├── pages/                      # 2. Páginas completas (Roteamento)
│   ├── dashboard/              # Cada página exporta seu componente principal no index.ts
│   │   ├── ui/Dashboard.tsx
│   │   └── index.ts
│   ├── treino/
│   ├── fichas/
│   ├── historico/
│   ├── progresso/
│   ├── biblioteca/
│   ├── onboarding/
│   ├── home/
│   └── not-found/
│
├── widgets/                    # 3. Blocos independentes (Junção de entities e features)
│   ├── layout/ui/AppLayout.tsx 
│   ├── sidebar/ui/DesktopSidebar.tsx
│   └── navigation/ui/BottomNav.tsx
│
├── features/                   # 4. Ações do usuário e interações de negócio
│   ├── theme-toggle/ui/ThemeToggle.tsx
│   ├── auth/                   # Lógicas de login/registro
│   ├── routine-builder/        # Lógica de montar ficha de treino
│   └── workout-tracker/        # Lógica do cronômetro e registro do treino ativo
│
├── entities/                   # 5. Entidades de negócio (O core do app)
│   ├── exercise/               # Exercícios base (Supino, Rosca...)
│   │   ├── model/types.ts
│   │   └── api/exercises.ts
│   ├── routine/                # Fichas de treino prontas
│   ├── session/                # O treino que está sendo executado no momento
│   └── user/                   # Dados e preferências do usuário logado
│
└── shared/                     # 6. Código reutilizável, sem contexto de negócio
    ├── api/                    # Cliente HTTP base (Axios/Fetch)
    ├── config/                 # Variáveis de ambiente (env)
    ├── routes/                 # Constantes de rotas (ex: ROUTES.TREINO)
    ├── ui/                     # UI Kit
    │   ├── shadcn/             # Componentes gerados pelo shadcn/ui
    │   └── NavLink.tsx         
    ├── lib/                    
    │   ├── utils.ts            
    │   └── storage.ts          
    └── hooks/
        ├── use-mobile.tsx      
        └── use-toast.ts        
```

# Regras do FSD neste projeto:
1. Uma camada só pode importar recursos das camadas **abaixo** dela.
   (ex: `features` pode importar de `entities`, mas `entities` NUNCA pode importar de `features`).
2. A comunicação entre os módulos (slices) deve ser feita exclusivamente através do arquivo `index.ts` (Public API) de cada pasta.
