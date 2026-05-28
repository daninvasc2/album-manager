# Project Structure

```
panini-manager/
├── app/                    # Telas (file-based routing via Expo Router)
│   ├── _layout.tsx         # Layout raiz (Stack navigator + tema)
│   ├── index.tsx           # Tela inicial (busca + progresso + grupos)
│   ├── duplicates.tsx      # Tela de figurinhas repetidas (add/remove + export)
│   ├── missing.tsx         # Tela de figurinhas faltantes (visualização)
│   └── team/
│       └── [code].tsx      # Tela de seleção (grid de figurinhas)
├── data/
│   └── album.ts            # Dados estáticos do álbum (grupos, seleções, códigos)
├── database/
│   └── db.ts               # Camada de acesso ao SQLite (CRUD da coleção)
├── assets/                 # Ícones e splash screen
├── .kiro/steering/         # Steering files para AI assistant
├── app.json                # Configuração do Expo
├── package.json            # Dependências
├── tailwind.config.js      # Configuração do NativeWind/Tailwind
├── tsconfig.json           # Configuração TypeScript
└── global.css              # Imports do Tailwind
```

## Convenções

- Nomes de arquivos: kebab-case para configs, camelCase para módulos TS
- Rotas dinâmicas: `[param].tsx` (padrão Expo Router)
- Componentes de tela: export default function em cada arquivo de rota
- Banco de dados: funções async exportadas de `database/db.ts`
- Dados estáticos: tipos e constantes em `data/`
