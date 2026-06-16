'use client'

import { useState } from 'react'
import { generateRoteirosPrompt } from '@/lib/generate-prompt'
import type { Projeto, Nicho } from '@prisma/client'

type ProjetoComNicho = Projeto & { nicho: Nicho }

export default function GeneratePromptButton({ projeto }: { projeto: ProjetoComNicho }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const prompt = generateRoteirosPrompt(projeto)

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <button
        onClick={() => setShow(!show)}
        className="btn-primary"
      >
        💡 {show ? 'Ocultar Prompt' : 'Gerar Prompt de Roteiros'}
      </button>

      {show && (
        <div className="mt-4 card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900">Prompt para Claude / ChatGPT</p>
              <p className="text-xs text-gray-500 mt-0.5">Copie e cole em qualquer IA para gerar 10 roteiros completos</p>
            </div>
            <button
              onClick={handleCopy}
              className={`btn-secondary text-sm ${copied ? '!text-green-700 !border-green-300 !bg-green-50' : ''}`}
            >
              {copied ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
          <textarea
            readOnly
            value={prompt}
            className="w-full h-64 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
      )}
    </div>
  )
}
