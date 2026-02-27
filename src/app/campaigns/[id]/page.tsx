'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Scroll, Loader2, ChevronRight, Dices, Copy, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { useSocket } from '@/hooks/useSocket'

interface Campaign {
  id: string
  name: string
  description?: string
  inviteCode: string
  system: { name: string; slug: string }
}

interface CampaignMember {
  id: string
  role: string
  character?: { id: string; name: string }
  user: { username: string }
}

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { on } = useSocket(id)

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [members, setMembers] = useState<CampaignMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [announcement, setAnnouncement] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then((d) => { setCampaign(d); setMembers(d.members ?? []) })
      .finally(() => setLoading(false))
  }, [id])

  // Listen for GM announcements
  useEffect(() => {
    const off = on('gm:announce', (data: unknown) => {
      const msg = (data as { message: string }).message
      setAnnouncement(msg)
      setTimeout(() => setAnnouncement(null), 8000)
    })
    return off
  }, [on])

  function copyCode() {
    if (!campaign) return
    navigator.clipboard.writeText(campaign.inviteCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Campanha não encontrada.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">Voltar</button>
        </div>
      </div>
    )
  }

  const myMember = members[0]
  const myChar = myMember?.character

  return (
    <div className="min-h-screen bg-background">
      {/* GM Announcement Banner */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-accent text-white text-center py-3 px-4 text-sm font-medium shadow-lg"
          >
            <span className="mr-2">📢</span>{announcement}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Campaign header */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-primary mb-1">{campaign.system.name}</div>
              <h1 className="text-2xl font-display font-bold text-foreground">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-muted text-sm mt-2 max-w-lg">{campaign.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Código:</span>
              <code className="text-sm text-foreground font-mono bg-surface px-3 py-1 rounded-lg">
                {campaign.inviteCode}
              </code>
              <button onClick={copyCode} className="p-1.5 text-muted hover:text-foreground transition-colors">
                {copiedCode ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* My character */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-primary" /> Meu Personagem
          </h2>
          {myChar ? (
            <Link href={`/sheet/${myChar.id}`} className="glass rounded-2xl p-5 flex items-center justify-between group hover:border-primary/40 border border-transparent transition-colors block">
              <div>
                <div className="font-semibold text-foreground">{myChar.name}</div>
                <div className="text-sm text-muted mt-0.5">{campaign.system.name}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </Link>
          ) : (
            <div className="glass rounded-2xl p-5 space-y-3">
              <p className="text-muted text-sm">Você ainda não tem um personagem nesta campanha.</p>
              <Link
                href={`/sheet/new?campaign=${campaign.id}&system=${campaign.system.slug}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Dices className="w-4 h-4" /> Criar Personagem
              </Link>
            </div>
          )}
        </div>

        {/* Party members */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Grupo ({members.length})
          </h2>
          <div className="space-y-2">
            {members.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                    {m.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{m.user.username}</div>
                    {m.character && (
                      <div className="text-xs text-muted">{m.character.name}</div>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${m.role === 'GM' ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary'}`}>
                  {m.role === 'GM' ? 'Mestre' : 'Jogador'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
