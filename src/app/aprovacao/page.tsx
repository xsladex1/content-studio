import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AprovacaoCard from './AprovacaoCard'

export default async function AprovacaoPage() {
  const [fila, totalAprovados] = await Promise.all([
    prisma.conteudo.findMany({
      where: { status: 'revisao' },
      orderBy: { updatedAt: 'asc' },
      include: {
        projeto: {
          select: {
            id: true,
            nome: true,
            nicho: { select: { nome: true, icone: true } },
          },
        },
        publicacoes: { select: { plataforma: true, status: true } },
      },
    }),
    prisma.conteudo.count({ where: { status: 'aprovado' } }),
  ])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fila de Aprovação</h1>
          <p className="page-subtitle">
            {fila.length} aguardando revisão · {totalAprovados} aprovado{totalAprovados !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/conteudos" className="btn-secondary">Ver todos</Link>
      </div>

      {fila.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-600 font-medium">Nenhum conteúdo aguardando aprovação</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Crie conteúdos e coloque-os em &quot;Revisão&quot; para aparecerem aqui
          </p>
          <Link href="/conteudos/novo" className="btn-primary">Criar conteúdo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {fila.map((c) => (
            <AprovacaoCard key={c.id} conteudo={c} />
          ))}
        </div>
      )}
    </div>
  )
}
