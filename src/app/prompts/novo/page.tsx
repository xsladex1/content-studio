import { prisma } from '@/lib/prisma'
import PromptForm from '../PromptForm'

export default async function NovoPromptPage() {
  const nichos = await prisma.nicho.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true, icone: true },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Novo Template</h1>
          <p className="page-subtitle">Crie um prompt com variáveis para geração de conteúdo com IA</p>
        </div>
      </div>
      <PromptForm nichos={nichos} />
    </div>
  )
}
