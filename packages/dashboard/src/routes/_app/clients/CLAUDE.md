# Contexto das rotas de clientes

Esta pasta reúne as rotas do módulo de clientes. Use `index.tsx` como entrada e listagem do módulo. Coloque em `$client_id/` as páginas relacionadas a um cliente específico.

## Estrutura prevista

A árvore pode crescer conforme novas áreas do cliente forem implementadas:

```text
clients/
├── index.tsx
└── $client_id/
    ├── index.tsx
    ├── intakes/
    ├── files/
    └── templates/
```

Use `$client_id/index.tsx` como visão geral do cliente. Mantenha `intakes`, `files`, `templates` e outras áreas vinculadas ao cliente dentro de `$client_id/`.


