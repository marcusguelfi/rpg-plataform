'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Dice6, BookOpen, Users, Zap, Upload, ChevronRight, Sword, Star } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const features = [
  {
    icon: Dice6,
    title: 'Rolagem em Tempo Real',
    description: 'Role dados com um clique. Todos na mesa veem o resultado na hora, com efeitos visuais e som.',
    color: '#7c3aed',
  },
  {
    icon: BookOpen,
    title: 'Multi-Sistema',
    description: 'Suporta qualquer sistema de RPG. Importe o PDF das regras e o sistema é criado automaticamente.',
    color: '#06b6d4',
  },
  {
    icon: Shield,
    title: 'Escudo do Mestre',
    description: 'Painel exclusivo para o Mestre. Veja todas as fichas, controle NPCs e gerencie a sessão.',
    color: '#f59e0b',
  },
  {
    icon: Users,
    title: 'Campanhas e Grupos',
    description: 'Crie campanhas, convide jogadores com código e organize seus personagens em um só lugar.',
    color: '#22c55e',
  },
  {
    icon: Upload,
    title: 'Importação de PDF',
    description: 'Suba o livro de regras em PDF e extraímos origens, rituais, armas, efeitos e muito mais.',
    color: '#ef4444',
  },
  {
    icon: Zap,
    title: 'Fichas Dinâmicas',
    description: 'Atributos, perícias, inventário e status calculados automaticamente conforme as regras.',
    color: '#8b5cf6',
  },
]

const steps = [
  { number: '01', title: 'Crie sua conta', desc: 'Em segundos, sem email obrigatório' },
  { number: '02', title: 'Escolha o sistema', desc: 'Ordem Paranormal, D&D, Tormenta20 e mais' },
  { number: '03', title: 'Monte sua ficha', desc: 'Interface intuitiva, tudo em um só lugar' },
  { number: '04', title: 'Role os dados', desc: 'Jogue com seus amigos em tempo real' },
]

export default function HomePage() {
  const { user, loading } = useAuthStore()

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Navbar */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7" style={{ color: 'var(--color-primary-light)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-text)' }}>
              RPG Platform
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Link href="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
                <Link href="/sheet" className="btn-primary">
                  Minhas Fichas
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Entrar
                </Link>
                <Link href="/register" className="btn-primary">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '70%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '60%',
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)',
          }} />
          {/* Floating dice decoration */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: 40 + i * 10,
                height: 40 + i * 10,
                borderRadius: i % 2 === 0 ? '8px' : '50%',
                border: `1px solid rgba(124,58,237,${0.1 + i * 0.05})`,
                top: `${10 + i * 15}%`,
                right: `${5 + i * 8}%`,
              }}
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="badge badge-primary mb-6 inline-flex">
              <Star className="w-3 h-3" />
              Plataforma Universal de RPG
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}>
              Suas fichas,{' '}
              <span className="text-gradient-primary">
                do jeito certo
              </span>
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '520px' }}>
              Plataforma digital para fichas de RPG que suporta qualquer sistema. Importe o PDF das regras, monte sua campanha e jogue com amigos em tempo real.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                Começar agora
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/systems" className="btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                Ver sistemas
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8" style={{ color: 'var(--color-text-subtle)', fontSize: '0.875rem' }}>
              <span>✓ Gratuito</span>
              <span>✓ Self-hosted</span>
              <span>✓ Multi-sistema</span>
            </div>
          </motion.div>

          {/* Hero visual - Mock sheet card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <MockSheetCard />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              Tudo que você precisa
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
              De fichas digitais a ferramentas para o Mestre — tudo em um só lugar
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card glass-hover"
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${f.color}20`, border: `1px solid ${f.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <f.icon style={{ width: 24, height: 24, color: f.color }} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--color-surface)' }} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '4rem' }}
          >
            Como funciona
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900,
                  color: 'var(--color-primary)', opacity: 0.5, marginBottom: '0.5rem',
                }}>{s.number}</div>
                <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.375rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card glow-primary"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))' }}
          >
            <Sword className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-primary-light)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Pronto para aventurar?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.125rem' }}>
              Crie sua conta gratuitamente e comece a jogar hoje mesmo.
            </p>
            <Link href="/register" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Criar conta grátis
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '2rem', textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: '0.875rem' }}>
        <p>RPG Platform — Construído com ♥ para jogadores</p>
      </footer>
    </div>
  )
}

function MockSheetCard() {
  return (
    <div className="card glow-primary" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚔️</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Valentina Santos</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Ocultista • Nível 3</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[['FOR', 2], ['AGI', 3], ['INT', 4], ['PRE', 3], ['VIG', 2]].map(([abbr, val]) => (
          <div key={abbr as string} style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>{abbr}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* HP/PE bars */}
      {[
        { label: 'PV', current: 18, max: 20, color: '#ef4444' },
        { label: 'PE', current: 7, max: 9, color: '#8b5cf6' },
        { label: 'SAN', current: 12, max: 15, color: '#06b6d4' },
      ].map(({ label, current, max, color }) => (
        <div key={label} style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <span style={{ color }}>{label}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{current}/{max}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(current / max) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>
      ))}

      {/* Dice roll indicator */}
      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.1)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Dice6 style={{ color: 'var(--color-primary-light)', width: 16, height: 16 }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Atletismo: </span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>18 + 3 = <span style={{ color: '#22c55e' }}>21</span></span>
        <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>Sucesso!</span>
      </div>
    </div>
  )
}
