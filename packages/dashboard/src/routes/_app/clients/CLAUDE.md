# Contexto das rotas de clientes

Esta pasta reúne as rotas do módulo de clientes. Use `index.tsx` como entrada e listagem do módulo. Coloque em `$clientId/` as páginas relacionadas a um cliente específico.

## Estrutura prevista

A árvore pode crescer conforme novas áreas do cliente forem implementadas:

```text
clients/
├── index.tsx
└── $clientId/
    ├── index.tsx
    ├── intakes/
    ├── files/
    └── templates/
```

Use `$clientId/index.tsx` como visão geral do cliente. Mantenha `intakes`, `files`, `templates` e outras áreas vinculadas ao cliente dentro de `$clientId/`.


