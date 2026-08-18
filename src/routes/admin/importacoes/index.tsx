import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/importacoes/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/importacoes/"!</div>
}
