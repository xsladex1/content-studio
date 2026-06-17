import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PromptForm from '../PromptForm'

export default async function EditPromptPage({ params }: { params: { id: string } }) {
  const [template, nichos] = await Promise.all([
    prisma.promptTemplate.findUnique({
      where: { id: params.id },
      include: { nicho: { select: { id: true, nome: true, icone: true } } },
    }),
    prisma.nicho.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, icone: true },
    }),
  ])

  if (!template) notFound()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Editar Template</h1>
          <p className="page-subtitle">{template.titulo}</p>
        </div>
      </div>
      <PromptForm nichos={nichos} template={template} />
    </div>
  )
}
