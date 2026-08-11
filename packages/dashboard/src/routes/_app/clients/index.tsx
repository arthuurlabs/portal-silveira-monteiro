import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/clients/')({
  component: ClientsRoutes,
})

function ClientsRoutes() {
  return <div>Hello "/_app/clients/"!</div>
}
