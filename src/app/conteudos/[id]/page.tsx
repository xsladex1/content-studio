import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EditConteudoForm from './EditConteudoForm'
import GerarIAButtons from './GerarIAButtons'
import MediaPreview from '@/components/MediaPreview'
import AgendarPublicacao from './AgendarPublicacao'

const STATUS_CONTEUDO: Record<string, { label: string; cls: string }> = {
  rascunho: { label: 'Rascunho', cls: 'bg-gray-100 text-gray-600' },
  gerando:  { label: 'Gerando',  cls: 'bg-blue-100 text-blue-700' },
  revisao:  { label: 'Revisão',  cls: 'bg-yellow-100 text-yellow-800' },
  aprovado: { label: 'Aprovado', cls: 'bg-green-100 text-green-800' },
  pausado:  { label: 'Pausado',  cls: 'bg-red-100 text-red-700' },
}

const STATUS_PUB: Record<string, { label: string; cls: string }> = {
  pendente:   { label: 'Pendente',   cls: 'bg-gray-100 text-gray-600' },
  agendado:   { label: 'Agendado',   cls: 'bg-blue-100 text-blue-700' },
  publicando: { label: 'Publicando', cls: 'bg-indigo-100 text-indigo-700' },
  publicado:  { label: 'Publicado',  cls: 'bg-green-100 text-green-800' },
  falhou:     { label: 'Falhou',     cls: 'bg-red-100 text-red-700' },
  cancelado:  { label: 'Cancelado',  cls: 'bg-gray-100 text-gray-500' },
}

const PLATAFORMA: Record<string, { label: string; icon: string; cls: string }> = {
  tiktok:       { label: 'TikTok',        icon: '🎵', cls: 'bg-pink-50 border-pink-200' },
  instagram:    { label: 'Instagram',     icon: '📸', cls: 'bg-purple-50 border-purple-200' },
  youtube:      { label: 'YouTube',       icon: '📺', cls: 'bg-red-50 border-red-200' },
  shopee:       { label: 'Shopee',        icon: '🛍️', cls: 'bg-orange-50 border-orange-200' },
  mercadolivre: { label: 'Mercado Livre', icon: '🛒', cls: 'bg-yellow-50 border-yellow-200' },
}

export default async function ConteudoDetailPage({ params }: { params: { id: string } }) {
  const conteudo = await prisma.conteudo.findUnique({
    where: { id: params.id },
    include: {
      projeto: { include: { nicho: { select: { id: true, nome: true, icone: true } } } },
      publicacoes: { orderBy: { plataforma: 'asc' } },
      jobsIA: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!conteudo) notFound()

  const plataformaAlvo = conteudo.publicacoes[0]?.plataforma ?? null
  const templates = await prisma.promptTemplate.findMany({
    where: {
      ativo: true,
      tipo: 'roteiro',
      OR: [
        { nichoId: conteudo.projeto.nichoId, plataforma: plataformaAlvo },
        { nichoId: conteudo.projeto.nichoId, plataforma: null },
        { nichoId: null, plataforma: plataformaAlvo },
        { nichoId: null, plataforma: null },
      ],
    },
    select: { id: true, titulo: true, tipo: true, plataforma: true },
    orderBy: { titulo: 'asc' },
  })

  const st = STATUS_CONTEUDO[conteudo.status] ?? STATUS_CONTEUDO.rascunho

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            <Link href="/conteudos" className="hover:text-indigo-600">Conteúdos</Link>
            {' / '}
            <Link href={`/projetos/${conteudo.projeto.id}`} className="hover:text-indigo-600">
              {conteudo.projeto.nicho.icone} {conteudo.projeto.nome}
            </Link>
          </p>
          <h1 className="page-title">{conteudo.tituloInterno}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${st.cls}`}>{st.label}</span>
            {conteudo.modeloIA && (
              <span className="badge bg-indigo-50 text-indigo-700">IA: {conteudo.modeloIA}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="col-span-2 space-y-6">

          {/* Publicações por plataforma */}
          {conteudo.publicacoes.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {conteudo.publicacoes.map((pub) => {
                const plat = PLATAFORMA[pub.plataforma] ?? { label: pub.plataforma, icon: '📢', cls: 'bg-gray-50 border-gray-200' }
                const ps = STATUS_PUB[pub.status] ?? STATUS_PUB.pendente
                return (
                  <div key={pub.plataforma} className={`card p-4 border ${plat.cls}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        {plat.icon} {plat.label}
                      </span>
                      <span className={`badge ${ps.cls}`}>{ps.label}</span>
                    </div>
                    {pub.agendadoPara && (
                      <p className="text-xs text-gray-500">
                        Agendado: {new Date(pub.agendadoPara).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {pub.publicadoEm && (
                      <p className="text-xs text-gray-500">
                        Publicado: {new Date(pub.publicadoEm).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {pub.urlPublicacao && (
                      <a href={pub.urlPublicacao} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline mt-1 block">
                        Ver publicação →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Conteúdo textual */}
          {(conteudo.hook || conteudo.roteiro || conteudo.legenda || conteudo.hashtags) && (
            <div className="card p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conteúdo</p>
              {conteudo.hook && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Hook</p>
                  <p className="text-sm font-medium text-gray-900 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                    {conteudo.hook}
                  </p>
                </div>
              )}
              {conteudo.roteiro && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Roteiro</p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    {conteudo.roteiro}
                  </pre>
                </div>
              )}
              {conteudo.legenda && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Legenda</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    {conteudo.legenda}
                  </p>
                </div>
              )}
              {conteudo.hashtags && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Hashtags</p>
                  <p className="text-sm text-indigo-700">{conteudo.hashtags}</p>
                </div>
              )}
            </div>
          )}

          {/* Mídia */}
          {(conteudo.videoUrl || conteudo.imagemUrl || conteudo.audioUrl) && (
            <div className="card p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mídia gerada</p>

              {/* Player de vídeo */}
              {conteudo.videoUrl && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400">Vídeo</p>
                    <a href={conteudo.videoUrl} download
                      className="text-xs text-indigo-600 hover:underline">⬇ Download</a>
                  </div>
                  <video
                    controls
                    src={conteudo.videoUrl}
                    className="w-full rounded-lg border border-gray-200"
                    style={{ maxHeight: '320px' }}
                  />
                </div>
              )}

              {/* Imagem */}
              {conteudo.imagemUrl && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400">Imagem</p>
                    <a href={conteudo.imagemUrl} download target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline">⬇ Download</a>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={conteudo.imagemUrl}
                    alt="Imagem do conteúdo"
                    className="rounded-lg max-h-52 w-full object-cover border border-gray-200"
                  />
                </div>
              )}

              {/* Áudio */}
              {conteudo.audioUrl && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400">Narração</p>
                    <a href={conteudo.audioUrl} download target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline">⬇ Download</a>
                  </div>
                  <audio controls src={conteudo.audioUrl} className="w-full" />
                </div>
              )}

              {/* Export CapCut */}
              {(conteudo.imagemUrl || conteudo.audioUrl) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-orange-700 mb-1.5">📱 Exportar para CapCut</p>
                  <p className="text-xs text-orange-600 mb-2">
                    Baixe os assets abaixo e importe no CapCut para editar o vídeo final.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conteudo.imagemUrl && (
                      <a
                        href={conteudo.imagemUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        🖼️ Baixar imagem
                      </a>
                    )}
                    {conteudo.audioUrl && (
                      <a
                        href={conteudo.audioUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        🎙️ Baixar narração
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Jobs de IA */}
          {conteudo.jobsIA.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Histórico de IA</p>
              <div className="space-y-2">
                {conteudo.jobsIA.map((job) => (
                  <div key={job.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{job.tipo}</span>
                      {job.modelo && <span className="text-gray-400">{job.modelo}</span>}
                    </div>
                    <span className={`badge text-xs ${
                      job.status === 'concluido' ? 'bg-green-100 text-green-700' :
                      job.status === 'falhou'    ? 'bg-red-100 text-red-700' :
                      job.status === 'processando' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Botões de geração com IA */}
          <div className="card p-5">
            <GerarIAButtons
              conteudoId={conteudo.id}
              plataforma={conteudo.publicacoes[0]?.plataforma}
              nichoId={conteudo.projeto.nichoId}
              templates={templates}
              hook={conteudo.hook}
              roteiro={conteudo.roteiro}
              legenda={conteudo.legenda}
              hashtags={conteudo.hashtags}
              imagemUrl={conteudo.imagemUrl}
              audioUrl={conteudo.audioUrl}
            />
          </div>

          {/* Agendamento de publicação */}
          {conteudo.publicacoes.length > 0 && (
            <div className="card p-5">
              <AgendarPublicacao
                publicacoes={conteudo.publicacoes}
                conteudoAprovado={conteudo.status === 'aprovado'}
              />
            </div>
          )}

          {/* Preview da plataforma */}
          {conteudo.imagemUrl && conteudo.publicacoes[0] && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Preview — {conteudo.publicacoes[0].plataforma}
              </p>
              <MediaPreview
                plataforma={conteudo.publicacoes[0].plataforma}
                imagemUrl={conteudo.imagemUrl}
                hook={conteudo.hook}
                titulo={conteudo.tituloInterno}
              />
            </div>
          )}

          {/* Edição manual */}
          <div className="card p-5">
            <p className="font-semibold text-gray-900 text-sm mb-4">Editar Conteúdo</p>
            <EditConteudoForm conteudo={conteudo} />
          </div>
        </div>
      </div>
    </div>
  )
}
