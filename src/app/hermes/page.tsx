export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import HermesForm from './HermesForm'

export default async function HermesPage() {
  const projetos = await prisma.projeto.findMany({
    where: { status: 'ativo' },
    include: { nicho: { select: { nome: true, icone: true } } },
    orderBy: { nome: 'asc' },
  })

  const stats = await prisma.conteudo.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  const statMap = Object.fromEntries(stats.map(s => [s.status, s._count.id]))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">HERMES</h1>
          <p className="page-subtitle">
            Defina o objetivo do dia e o sistema cria o plano de conteúdo automaticamente
          </p>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Rascunhos',  value: statMap['rascunho'] ?? 0, cls: 'text-gray-600' },
          { label: 'Em revisão', value: statMap['revisao']  ?? 0, cls: 'text-yellow-600' },
          { label: 'Aprovados',  value: statMap['aprovado'] ?? 0, cls: 'text-green-600' },
          { label: 'Projetos',   value: projetos.length,          cls: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Formulário HERMES */}
        <div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚡</span>
              <div>
                <p className="font-bold text-lg">HERMES</p>
                <p className="text-indigo-200 text-sm">AI Content Orchestrator</p>
              </div>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Diga o que quer criar e o HERMES planeja, organiza e prepara {projetos.length} projeto{projetos.length !== 1 ? 's' : ''} para geração automática.
            </p>
          </div>

          {projetos.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-500 mb-2">Nenhum projeto ativo encontrado</p>
              <a href="/projetos/novo" className="btn-primary text-sm">Criar projeto</a>
            </div>
          ) : (
            <HermesForm projetos={projetos} />
          )}
        </div>

        {/* Como funciona */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">Como funciona</p>
            <ol className="space-y-3">
              {[
                { step: '1', icon: '💬', title: 'Defina o objetivo', desc: 'Escreva o que você quer criar em linguagem natural' },
                { step: '2', icon: '🧠', title: 'HERMES planeja',    desc: 'GPT-4o cria um plano com títulos e plataformas para cada conteúdo' },
                { step: '3', icon: '📁', title: 'Rascunhos criados', desc: 'Os conteúdos são criados automaticamente como rascunhos' },
                { step: '4', icon: '✍️', title: 'Gere o texto',      desc: 'Acesse cada conteúdo e gere o roteiro, imagem e áudio com IA' },
                { step: '5', icon: '✅', title: 'Aprove e publique', desc: 'Revise na fila de aprovação e agende a publicação' },
              ].map(s => (
                <li key={s.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.icon} {s.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-900 mb-3">Exemplos de objetivos</p>
            <ul className="space-y-1.5">
              {[
                '"Quero 3 posts cristãos para hoje"',
                '"5 vídeos de review para TikTok"',
                '"2 posts de comparação com concorrentes"',
                '"Série de 7 dicas sobre o produto"',
              ].map(ex => (
                <li key={ex} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-indigo-400 flex-shrink-0">→</span>
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
