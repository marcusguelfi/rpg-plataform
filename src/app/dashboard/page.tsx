'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Shield, Users, BookOpen, Dice6, ChevronRight, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

interface Campaign {
  id: string
  name: string
  description?: string
  coverImage?: string
  status: string
  system: { id: string; name: string; slug: string; coverImage?: string }
  owner: { id: string; username: string }
  _count: { members: number; characters: number }
}

interface Character {
  id: string
  name: string
  portrait?: string
  system: { id: string; name: string; slug: string }
  campaign?: { id: string; name: string }
  updatedAt: string
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuthStore()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch('/api/campaigns').then(r => r.json()),
      fetch('/api/characters').then(r => r.json()),
    ]).then(([c, ch]) => {
      setCampaigns(Array.isArray(c) ? c : [])
      setCharacters(Array.isArray(ch) ? ch : [])
      setFetching(false)
    }).catch(() => setFetching(false))
  }, [user])

  if (loading || !user) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Topbar */}
      <nav className="glass" style={{ borderBottom: '1px solid var(--color-border)', padding: '1rem 1.5rem' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
            <Shield style={{ color: 'var(--color-primary-light)', width: 24, height: 24 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>RPG Platform</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/systems" className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              <BookOpen size={14} />
              Sistemas
            </Link>
            <Link href="/import" className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              Importar PDF
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.875rem', background: 'var(--color-surface-2)', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                {user.username[0].toUpperCase()}
              </div>
              {user.username}
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Olá, {user.username} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Pronto para a próxima sessão?</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Campanhas', value: campaigns.length, icon: Users, color: '#7c3aed' },
            { label: 'Personagens', value: characters.length, icon: Shield, color: '#06b6d4' },
            { label: 'Sessões', value: '—', icon: Dice6, color: '#f59e0b' },
            { label: 'Sistemas', value: '—', icon: BookOpen, color: '#22c55e' },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon style={{ width: 20, height: 20, color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Campaigns */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Campanhas</h2>
              <Link href="/campaigns/new" className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
                <Plus size={14} />
                Nova
              </Link>
            </div>
            {fetching ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>Carregando...</div>
            ) : campaigns.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhuma campanha"
                desc="Crie sua primeira campanha ou entre com um código de convite"
                href="/campaigns/new"
                label="Criar campanha"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {campaigns.slice(0, 5).map(c => (
                  <CampaignCard key={c.id} campaign={c} currentUserId={user.id} />
                ))}
              </div>
            )}
          </section>

          {/* Characters */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Personagens</h2>
              <Link href="/sheet/new" className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
                <Plus size={14} />
                Novo
              </Link>
            </div>
            {fetching ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>Carregando...</div>
            ) : characters.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="Nenhum personagem"
                desc="Crie seu primeiro personagem para começar a jogar"
                href="/sheet/new"
                label="Criar personagem"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {characters.slice(0, 5).map(ch => (
                  <CharacterCard key={ch.id} character={ch} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function CampaignCard({ campaign, currentUserId }: { campaign: Campaign; currentUserId: string }) {
  const isGM = campaign.owner.id === currentUserId
  return (
    <Link href={isGM ? `/gm/${campaign.id}` : `/campaigns/${campaign.id}`}>
      <div className="card glass-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
          🗺️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaign.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.75rem' }}>
            <span>{campaign.system.name}</span>
            <span>•</span>
            <span>{campaign._count.members} jogadores</span>
            {isGM && <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0 0.375rem' }}>GM</span>}
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} />
      </div>
    </Link>
  )
}

function CharacterCard({ character }: { character: Character }) {
  return (
    <Link href={`/sheet/${character.id}`}>
      <div className="card glass-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
          {character.portrait ? <img src={character.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : '⚔️'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{character.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {character.system.name}
            {character.campaign && ` • ${character.campaign.name}`}
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} />
      </div>
    </Link>
  )
}

function EmptyState({ icon: Icon, title, desc, href, label }: { icon: React.ElementType; title: string; desc: string; href: string; label: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
      <Icon style={{ width: 40, height: 40, color: 'var(--color-text-subtle)', margin: '0 auto 1rem' }} />
      <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{title}</p>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{desc}</p>
      <Link href={href} className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
        <Plus size={14} />
        {label}
      </Link>
    </div>
  )
}
