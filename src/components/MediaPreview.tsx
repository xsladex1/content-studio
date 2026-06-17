'use client'

type Props = {
  plataforma: string
  imagemUrl:  string | null
  hook:       string | null
  titulo?:    string | null
}

export default function MediaPreview({ plataforma, imagemUrl, hook, titulo }: Props) {
  if (plataforma === 'youtube') {
    return <YouTubeThumbnail imagemUrl={imagemUrl} titulo={titulo ?? hook} />
  }
  if (plataforma === 'instagram') {
    return <InstagramFrame imagemUrl={imagemUrl} hook={hook} />
  }
  return <TikTokFrame imagemUrl={imagemUrl} hook={hook} />
}

// ── TikTok / Reels — moldura de celular vertical ────────────────────────────

function TikTokFrame({ imagemUrl, hook }: { imagemUrl: string | null; hook: string | null }) {
  return (
    <div className="flex justify-center">
      {/* Moldura do celular */}
      <div className="relative w-[180px] rounded-[28px] overflow-hidden border-4 border-gray-800 bg-black shadow-2xl"
        style={{ aspectRatio: '9/16' }}>

        {/* Imagem de fundo */}
        {imagemUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagemUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900" />
        )}

        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Barra de status topo */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-2">
          <span className="text-white text-[9px] font-bold">9:41</span>
          <div className="w-8 h-1.5 bg-black rounded-full" />
          <div className="flex gap-0.5 items-center">
            <div className="w-2 h-1.5 bg-white/80 rounded-sm" />
          </div>
        </div>

        {/* Hook overlay na parte de baixo */}
        {hook && (
          <div className="absolute bottom-10 left-2 right-8">
            <p className="text-white text-[9px] font-semibold leading-snug drop-shadow-lg line-clamp-3">
              {hook}
            </p>
          </div>
        )}

        {/* Ícones laterais TikTok */}
        <div className="absolute right-1.5 bottom-10 flex flex-col items-center gap-2">
          {[['❤️', '4K'], ['💬', '1K'], ['↗️', '8K'], ['🎵', '2K']].map(([icon, count], i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[11px]">{icon}</span>
              <span className="text-white text-[6px]">{count}</span>
            </div>
          ))}
        </div>

        {/* Logo TikTok */}
        <div className="absolute top-3 left-0 right-0 flex justify-center">
          <span className="text-white text-[9px] font-bold tracking-widest opacity-70">TikTok</span>
        </div>
      </div>
    </div>
  )
}

// ── Instagram — frame quadrado ───────────────────────────────────────────────

function InstagramFrame({ imagemUrl, hook }: { imagemUrl: string | null; hook: string | null }) {
  return (
    <div className="flex justify-center">
      <div className="w-[220px]">
        {/* Header fake do post */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-orange-400" />
          <span className="text-xs font-semibold text-gray-800">content_studio</span>
          <span className="ml-auto text-gray-400 text-xs">···</span>
        </div>

        {/* Imagem quadrada */}
        <div className="relative w-[220px] h-[220px] bg-gray-100 overflow-hidden">
          {imagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <span className="text-3xl">📸</span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3 mt-2 px-1">
          <span className="text-base">❤️</span>
          <span className="text-base">💬</span>
          <span className="text-base">↗️</span>
          <span className="ml-auto text-base">🔖</span>
        </div>

        {/* Legenda curta */}
        {hook && (
          <p className="text-[10px] text-gray-700 mt-1 px-1 line-clamp-2 leading-relaxed">
            <span className="font-semibold">content_studio</span> {hook}
          </p>
        )}
      </div>
    </div>
  )
}

// ── YouTube — thumbnail wide ─────────────────────────────────────────────────

function YouTubeThumbnail({ imagemUrl, titulo }: { imagemUrl: string | null; titulo: string | null }) {
  return (
    <div className="flex justify-center">
      <div className="w-[280px]">
        {/* Thumbnail 16:9 */}
        <div className="relative w-[280px] rounded-lg overflow-hidden bg-gray-900" style={{ aspectRatio: '16/9' }}>
          {imagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
              <span className="text-4xl">📺</span>
            </div>
          )}

          {/* Duração fake */}
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] px-1 rounded font-medium">
            0:45
          </div>
        </div>

        {/* Info abaixo */}
        <div className="flex gap-2 mt-2 px-0.5">
          <div className="w-6 h-6 rounded-full bg-red-600 flex-shrink-0 mt-0.5" />
          <div>
            {titulo && (
              <p className="text-[10px] font-semibold text-gray-900 leading-tight line-clamp-2">{titulo}</p>
            )}
            <p className="text-[9px] text-gray-500 mt-0.5">Content Studio · 0 visualizações</p>
          </div>
        </div>
      </div>
    </div>
  )
}
