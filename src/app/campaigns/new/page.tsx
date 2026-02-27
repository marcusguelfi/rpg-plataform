'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, Lock, Loader2, ChevronLeft, Sword } from 'lucide-react'

const SYSTEMS_PLACEHOLDER = [
  { id: 'ordem-paranormal', name: 'Ordem Paranormal' },
  { id: 'dnd-5e', name: 'D&D 5e' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '', systemId: '', isPublic: false })
  const [submitting, setSubmitting] = useState(false)
  const [systems] = useState(SYSTEMS_PLACEHOLDER)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.systemId) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const campaign = await res.json()
      router.push(`/gm/${campaign.id}`)
    } catch {
      alert('Erro ao criar campanha.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-muted hover:text-foreground mb-4 text-sm transition-colors">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Sword className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Nova Campanha</h1>
              <p className="text-muted text-sm">Configure sua aventura</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="label">Nome da Campanha *</label>
            <input
              className="input"
              placeholder="Ex: A Maldição de Arkham"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">Sistema de RPG *</label>
            <select
              className="input"
              value={form.systemId}
              onChange={(e) => setForm((f) => ({ ...f, systemId: e.target.value }))}
              required
            >
              <option value="">Selecionar sistema…</option>
              {systems.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Descreva sua campanha, o cenário, o tom da aventura…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="label mb-2">Visibilidade</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isPublic: false }))}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${!form.isPublic ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted hover:border-primary/40'}`}
              >
                <Lock className="w-4 h-4" /> Privada
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isPublic: true }))}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${form.isPublic ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted hover:border-primary/40'}`}
              >
                <Globe className="w-4 h-4" /> Pública
              </button>
            </div>
            <p className="text-xs text-muted mt-2">
              {form.isPublic ? 'Qualquer jogador pode encontrar e entrar via código.' : 'Somente quem tiver o código de convite pode entrar.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.name || !form.systemId}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Criando…</>
            ) : (
              <><Sword className="w-4 h-4" /> Criar Campanha</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
