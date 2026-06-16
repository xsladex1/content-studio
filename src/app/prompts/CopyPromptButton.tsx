'use client'

import { useState } from 'react'

export default function CopyPromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`btn-secondary text-xs flex-shrink-0 ${copied ? '!text-green-700 !border-green-300 !bg-green-50' : ''}`}
    >
      {copied ? '✓ Copiado!' : '📋 Copiar'}
    </button>
  )
}
