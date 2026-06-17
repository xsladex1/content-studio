export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import NovoProjetoForm from './NovoProjetoForm'

export default async function NovoProjetoPage() {
  const nichos = await prisma.nicho.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
  })

  return <NovoProjetoForm nichos={nichos} />
}
