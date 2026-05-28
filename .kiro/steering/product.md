# Product Summary

Panini Manager é um aplicativo Android para gerenciar o preenchimento do álbum de figurinhas da Copa do Mundo 2026.

## Funcionalidades

- Buscar figurinhas na coleção pessoal (retorna apenas as que o usuário possui)
- Adicionar figurinhas à coleção quando não encontradas na busca
- Visualizar grupos e seleções com progresso individual
- Ver quais figurinhas já possui, quais faltam e quais são repetidas
- Barra de progresso geral do álbum (porcentagem completa)
- Tela de repetidas: gerenciar figurinhas duplicadas (adicionar/remover) + exportar para .txt
- Tela de faltantes: visualizar todas as figurinhas que faltam para completar o álbum

## Estrutura do Álbum

- 1 figurinha especial: `00`
- 19 figurinhas FWC (FIFA World Cup History): `FWC1` a `FWC19`
- 14 figurinhas CC (Coca-Cola): `CC1` a `CC14`
- 48 seleções divididas em 12 grupos (A-L), cada uma com 20 figurinhas
- **Total: 994 figurinhas**

## Conceitos do Domínio

- **Sticker (Figurinha)**: Item identificado por código (ex: BRA1, FWC5, CC3)
- **Team (Seleção)**: País com código de 3 letras e 20 figurinhas
- **Group (Grupo)**: Agrupamento de 4 seleções (A até L)
- **Collection (Coleção)**: Inventário pessoal do usuário com quantidades
- **Duplicates (Repetidas)**: Figurinhas com quantidade > 1
- **Missing (Faltantes)**: Figurinhas que o usuário ainda não possui
