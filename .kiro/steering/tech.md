# Tech Stack

## Language & Runtime
- TypeScript
- React Native (via Expo)

## Frameworks
- Expo SDK ~52
- Expo Router ~4 (file-based routing)
- NativeWind ~4.1 (Tailwind CSS for React Native)

## Database
- SQLite local via `expo-sqlite` (offline-first, sem backend)

## Package Manager
- npm

## Common Commands

| Action | Command |
|--------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npx expo start` |
| Run on Android | `npx expo start --android` |
| Build APK (dev) | `npx expo run:android` |
| Build production | `eas build --platform android` |

## Key Conventions
- Dados do álbum são estáticos em `data/album.ts`
- Banco de dados armazena apenas a coleção do usuário (sticker_code + quantity)
- Todas as telas usam NativeWind (classes Tailwind) para estilização
- Rotas são baseadas em arquivos dentro de `app/`
