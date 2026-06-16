import { prisma } from '@/lib/prisma'
import CopyPromptButton from './CopyPromptButton'

const TIPO_META: Record<string, { label: string; icon: string; cls: string }> = {
  roteiro: { label: 'Roteiro', icon: '🎬', cls: 'bg-pink-100 text-pink-800' },
  legenda: { label: 'Legenda', icon: '✍️', cls: 'bg-blue-100 text-blue-800' },
  hashtags: { label: 'Hashtags', icon: '#️⃣', cls: 'bg-indigo-100 text-indigo-800' },
  analise: { label: 'Análise', icon: '🏆', cls: 'bg-green-100 text-green-800' },
  hook: { label: 'Hook', icon: '🎣', cls: 'bg-orange-100 text-orange-800' },
  thumbnail: { label: 'Thumbnail', icon: '🖼️', cls: 'bg-violet-100 text-violet-800' },
}

export default async function PromptsPage() {
  const templates = await prisma.promptTemplate.findMany({
    where: { ativo: true },
    orderBy: [{ tipo: 'asc' }, { titulo: 'asc' }],
    include: { nicho: { select: { nome: true, icone: true } } },
  })

  const grouped = templates.reduce<Record<string, typeof templates>>((acc, t) => {
    if (!acc[t.tipo]) acc[t.tipo] = []
    acc[t.tipo].push(t)
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Biblioteca de Prompts</h1>
          <p className="page-subtitle">Templates prontos para gerar conteúdo com IA — use variáveis como {`{{produto}}`}, {`{{preco}}`}</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">💡</p>
          <p className="text-gray-600 font-medium">Nenhum template cadastrado</p>
          <p className="text-gray-400 text-sm mt-1">Execute o seed para carregar os templates padrão:</p>
          <code className="block mt-2 text-sm bg-gray-100 px-3 py-2 rounded">npm run db:seed</code>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([tipo, items]) => {
            const meta = TIPO_META[tipo] ?? { label: tipo, icon: '💡', cls: 'bg-gray-100 text-gray-600' }
            return (
              <div key={tipo}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{meta.icon}</span>
                  <h2 className="font-semibold text-gray-900 text-lg">{meta.label}</h2>
                  <span className={`badge ${meta.cls}`}>{items.length}</span>
                </div>
                <div className="space-y-4">
                  {items.map((t) => (
                    <div key={t.id} className="card p-5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{t.titulo}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {t.plataforma && (
                              <span className="badge bg-slate-100 text-slate-600">{t.plataforma}</span>
                            )}
                            {t.nicho && (
                              <span className="badge bg-slate-100 text-slate-600">
                                {t.nicho.icone} {t.nicho.nome}
                              </span>
                            )}
                            {!t.plataforma && !t.nicho && (
                              <span className="badge bg-gray-100 text-gray-500">Universal</span>
                            )}
                          </div>
                        </div>
                        <CopyPromptButton text={t.conteudo} />
                      </div>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto mt-3">
                        {t.conteudo}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
