import { useState, useRef, useEffect } from 'react'
import { Share2, Link, Check } from 'lucide-react'
import { useProductShare, type SharePlatform } from '@/hooks/useProductShare'
import type { MenuItem } from '@/types'

interface ShareMenuProps {
  item: MenuItem
  userId: string | null
}

const platforms: { id: SharePlatform; label: string; emoji: string }[] = [
  { id: 'link',      label: 'Copy Link',  emoji: '🔗' },
  { id: 'whatsapp',  label: 'WhatsApp',   emoji: '💬' },
  { id: 'facebook',  label: 'Facebook',   emoji: '👍' },
  { id: 'twitter',   label: 'Twitter / X',emoji: '🐦' },
]

export function ShareMenu({ item, userId }: ShareMenuProps) {
  const [open,   setOpen]   = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { share } = useProductShare()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleShare = async (platform: SharePlatform) => {
    const result = await share(item, platform, userId)
    if (platform === 'link') {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
    if (result === 'shared' || result === 'copied') setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="p-1.5 rounded-lg text-brand-700 hover:text-brand-400 hover:bg-brand-900/40 transition-colors"
        title="Share"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1.5 z-50 w-44 bg-surface-50 border border-brand-800/50 rounded-xl shadow-xl overflow-hidden animate-fade-up">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => handleShare(p.id)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-brand-400 hover:bg-brand-900/40 hover:text-brand-200 transition-colors text-left"
            >
              <span>{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}