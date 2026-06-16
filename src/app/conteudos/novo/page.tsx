import { prisma } from '@/lib/prisma'
import NovoConteudoForm from './NovoConteudoForm'

export default async function NovoConteudoPage({
  searchParams,
}: {
  searchParams: { projetoId?: string }
}) {
  const projetos = await prisma.projeto.findMany({
    where: { status: 'ativo' },
    orderBy: { nome: 'asc' },
    include: { nicho: { select: { nome: true, icone: true } } },
  })

  return (
    <NovoConteudoForm
      projetos={projetos}
      projetoIdInicial={searchParams.projetoId}
    />
  )
}
