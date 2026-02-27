'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users, ScrollText, Dice6,
  Shield, Eye, EyeOff, Megaphone,
  Settings, Loader2, ChevronDown, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useSocket } from '@/hooks/useSocket'
import { useDiceRoll } from '@/hooks/useDiceRoll'
import { DicePanel } from '@/components/dice/DicePanel'
import type { FullRpgSystem } from '@/types/rpg'

interface CampaignMember {
  id: string
  role: string
  user: { id: string; username: string; avatar?: string }
}

interface Character {
  id: string
  name: string
  portrait?: string
  isNPC: boolean
  isPublic: boolean
  sheetData: Record<string, unknown>
  owner: { id: string; username: string }
}

interface Campaign {
  id: string
  name: string
  description?: string
  status: string
  inviteCode: string
  system: FullRpgSystem
  owner: { id: string; username: string }
  members: CampaignMember[]
  characters: Character[]
}

type ActiveTab = 'players' | 'npcs' | 'dice' | 'notes' | 'settings'

export default function GMPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuthStore()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('players')
  const [announcement, setAnnouncement] = useState('')

  const campaignId = params?.id as string
  const { emitSocket } = useSocket(campaignId)
  const { roll } = useDiceRoll({ campaignId, emitSocket })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!campaignId) return
    fetch(`/api/campaigns/${campaignId}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) setCampaign(data)
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [campaignId])

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-background)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!campaign) return null

  const isGM = campaign.owner.id === user?.id
  if (!isGM) { router.push(`/campaigns/${campaignId}`); return null }

  const players = campaign.members.filter(m => m.role !== 'GM')
  const playerChars = campaign.characters.filter(c => !c.isNPC)
  const npcs = campaign.characters.filter(c => c.isNPC)

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'players', label: 'Jogadores', icon: Users },
    { id: 'npcs', label: 'NPCs', icon: Shield },
    { id: 'dice', label: 'Dados', icon: Dice6 },
    { id: 'notes', label: 'Notas', icon: ScrollText },
    { id: 'settings', label: 'Config.', icon: Settings },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', flexDirection: 'column' }}>
      {/* GM Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.08))', borderBottom: '1px solid var(--color-border)', padding: '1rem 1.5rem' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Shield style={{ color: 'var(--color-primary-light)', width: 20, height: 20 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Escudo do Mestre
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{campaign.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <span>{campaign.system.name}</span>
            <span>•</span>
            <span>{players.length} jogadores</span>
            <span>•</span>
            <span style={{ color: 'var(--color-text-subtle)' }}>Código: <strong style={{ color: 'var(--color-accent)', fontFamily: 'monospace' }}>{campaign.inviteCode}</strong></span>
          </div>
        </div>
      </div>

      {/* Announcement bar */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '0.625rem 1.5rem' }}>
        <div className="max-w-7xl mx-auto flex gap-2">
          <input
            className="input"
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            placeholder="Anunciar para todos os jogadores..."
            style={{ fontSize: '0.875rem', flex: 1 }}
            onKeyDown={e => {
              if (e.key === 'Enter' && announcement.trim()) {
                emitSocket('gm:announce', { campaignId, message: announcement, type: 'info' })
                setAnnouncement('')
              }
            }}
          />
          <button
            onClick={() => {
              if (announcement.trim()) {
                emitSocket('gm:announce', { campaignId, message: announcement, type: 'info' })
                setAnnouncement('')
              }
            }}
            className="btn-primary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', flexShrink: 0 }}
          >
            <Megaphone size={14} />
            Anunciar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex gap-6 flex-1">
        {/* Left sidebar: navigation */}
        <div style={{ width: 48, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface)',
                border: `1px solid ${activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                cursor: 'pointer', color: activeTab === tab.id ? 'white' : 'var(--color-text-muted)',
                transition: 'all 0.15s',
              }}
            >
              <tab.icon size={18} />
              <span style={{ fontSize: '0.55rem', fontWeight: 600 }}>{tab.label.slice(0, 5)}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'players' && (
            <GMPlayersTab playerChars={playerChars} schema={campaign.system.schema} campaignId={campaignId} />
          )}
          {activeTab === 'npcs' && (
            <GMNPCsTab npcs={npcs} campaignId={campaignId} systemId={campaign.system.id} />
          )}
          {activeTab === 'dice' && (
            <div className="max-w-md">
              <DicePanel onRoll={roll} characterName="Mestre" schema={campaign.system.schema} />
            </div>
          )}
          {activeTab === 'settings' && (
            <GMSettingsTab campaign={campaign} />
          )}
        </div>
      </div>
    </div>
  )
}

function GMPlayersTab({ playerChars, schema, campaignId }: {
  playerChars: Character[]
  schema: FullRpgSystem['schema']
  campaignId: string
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (playerChars.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Users style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.3 }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhum personagem de jogador nesta campanha ainda.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {playerChars.map(char => {
        const sheetData = char.sheetData as Record<string, unknown>
        const derived = (sheetData.derived as Record<string, { current: number; max: number }>) || {}
        const isOpen = expanded === char.id

        return (
          <div key={char.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => setExpanded(isOpen ? null : char.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {char.portrait ? <img src={char.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : '⚔️'}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>{char.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Jogador: {char.owner.username}</div>
              </div>

              {/* HP bar preview */}
              {schema.derivedStats.slice(0, 2).map(stat => {
                const val = derived[stat.id] || { current: 0, max: 1 }
                const pct = Math.max(0, Math.min(100, (val.current / (val.max || 1)) * 100))
                return (
                  <div key={stat.id} style={{ width: 100 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: stat.color || 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 600 }}>
                      <span>{stat.abbr}</span>
                      <span>{val.current}/{val.max}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-3)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: stat.color || 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}

              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isOpen && (
              <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ paddingTop: '0.875rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {schema.attributes.map(attr => {
                      const attrs = (sheetData.attributes as Record<string, number>) || {}
                      return (
                        <div key={attr.id} style={{ textAlign: 'center', background: 'var(--color-surface-2)', borderRadius: 8, padding: '0.375rem 0.5rem', minWidth: 48 }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{attr.abbr}</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>{attrs[attr.id] ?? attr.defaultValue}</div>
                        </div>
                      )
                    })}
                  </div>
                  <a href={`/sheet/${char.id}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', marginLeft: 'auto' }}>
                    <Eye size={14} />
                    Ver ficha completa
                  </a>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function GMNPCsTab({ npcs, campaignId, systemId }: {
  npcs: Character[]
  campaignId: string
  systemId: string
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <a href={`/sheet/new?campaignId=${campaignId}&systemId=${systemId}&npc=1`} className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}>
          + Criar NPC
        </a>
      </div>
      {npcs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Shield style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhum NPC criado ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {npcs.map(npc => (
            <div key={npc.id} className="card glass-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👹</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{npc.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.125rem' }}>
                  {npc.isPublic
                    ? <span style={{ color: 'var(--color-success)' }}><Eye size={12} style={{ display: 'inline' }} /> Visível aos jogadores</span>
                    : <span><EyeOff size={12} style={{ display: 'inline' }} /> Oculto</span>
                  }
                </div>
              </div>
              <a href={`/sheet/${npc.id}`} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
                Ver ficha
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GMSettingsTab({ campaign }: { campaign: Campaign }) {
  return (
    <div className="card">
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.125rem' }}>Configurações da Campanha</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label className="label">Código de convite</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="input" value={campaign.inviteCode} readOnly style={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '1rem', fontWeight: 700, color: 'var(--color-accent)' }} />
            <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(campaign.inviteCode)} style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
              Copiar
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>Compartilhe este código para que jogadores entrem na campanha</p>
        </div>
        <div>
          <label className="label">Sistema</label>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{campaign.system.name} v{campaign.system.version}</div>
        </div>
        <div>
          <label className="label">Status</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['ACTIVE', 'PAUSED', 'FINISHED'] as const).map(s => (
              <span key={s} className={`badge ${campaign.status === s ? 'badge-primary' : ''}`} style={{ cursor: 'default' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
