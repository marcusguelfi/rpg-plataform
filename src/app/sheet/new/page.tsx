'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Dices, User, BookOpen, Loader2 } from 'lucide-react'

interface RpgSystem { id: string; name: string; description: string; version: string; slug: string }
interface Attribute { id: string; name: string; abbr: string; defaultValue: number; min: number; max: number }
interface Origin { id: string; name: string; description: string }

export default function NewCharacterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState(1)
  const [systems, setSystems] = useState<RpgSystem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [selectedSystem, setSelectedSystem] = useState<RpgSystem | null>(null)
  const [systemSchema, setSystemSchema] = useState<{ attributes?: Attribute[] } | null>(null)
  const [systemData, setSystemData] = useState<{ origins?: Origin[] } | null>(null)

  const [form, setForm] = useState({
    name: '',
    campaignId: params.get('campaign') ?? '',
    originId: '',
    level: 1,
    xp: 0,
    background: '',
    attributes: {} as Record<string, number>,
  })

  // Load systems
  useEffect(() => {
    fetch('/api/systems').then((r) => r.json()).then(setSystems)
  }, [])

  // Load system schema when selected
  useEffect(() => {
    if (!selectedSystem) return
    setLoading(true)
    fetch(`/api/systems/${selectedSystem.slug}`)
      .then((r) => r.json())
      .then((d) => {
        setSystemSchema(d.schema)
        setSystemData(d.data)
        // Initialize attribute values
        const attrs: Record<string, number> = {}
        d.schema?.attributes?.forEach((a: Attribute) => { attrs[a.id] = a.defaultValue })
        setForm((f) => ({ ...f, attributes: attrs }))
      })
      .finally(() => setLoading(false))
  }, [selectedSystem])

  async function submit() {
    if (!selectedSystem || !form.name) return
    setSubmitting(true)

    const sheetData = {
      attributes: form.attributes,
      derivedStats: {},
      skills: {},
      inventory: [],
      spells: [],
    }

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          systemId: selectedSystem.id,
          campaignId: form.campaignId || undefined,
          sheetData,
          metadata: { originId: form.originId, level: form.level, xp: form.xp, background: form.background },
        }),
      })
      if (!res.ok) throw new Error()
      const char = await res.json()
      router.push(`/sheet/${char.id}`)
    } catch {
      alert('Erro ao criar personagem.')
    } finally {
      setSubmitting(false)
    }
  }

  const canNext =
    (step === 1 && selectedSystem !== null) ||
    (step === 2 && form.name.trim().length > 0) ||
    (step === 3)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">Novo Personagem</h1>
          <p className="text-muted">Crie seu personagem em 3 passos</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: 'Sistema', icon: BookOpen },
            { n: 2, label: 'Identidade', icon: User },
            { n: 3, label: 'Atributos', icon: Dices },
          ].map(({ n, label, icon: Icon }, i) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${step === n ? 'bg-primary text-white' : step > n ? 'bg-green-500/20 text-green-400' : 'bg-surface text-muted'}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{n}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl p-6 space-y-6"
        >
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-foreground">Escolha o Sistema de RPG</h2>
              <div className="grid gap-3">
                {systems.map((sys) => (
                  <button
                    key={sys.id}
                    onClick={() => setSelectedSystem(sys)}
                    className={`text-left p-4 rounded-xl border transition-all ${selectedSystem?.id === sys.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40 bg-surface/50'}`}
                  >
                    <div className="font-semibold text-foreground">{sys.name}</div>
                    <div className="text-sm text-muted mt-0.5 line-clamp-2">{sys.description}</div>
                    <div className="text-xs text-primary/70 mt-1">v{sys.version}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-foreground">Identidade do Personagem</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Nome *</label>
                  <input className="input" placeholder="Nome do personagem" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nível</label>
                    <input type="number" min={1} max={20} className="input" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">XP</label>
                    <input type="number" min={0} className="input" value={form.xp} onChange={(e) => setForm((f) => ({ ...f, xp: +e.target.value }))} />
                  </div>
                </div>
                {systemData?.origins && (
                  <div>
                    <label className="label">Origem</label>
                    <select className="input" value={form.originId} onChange={(e) => setForm((f) => ({ ...f, originId: e.target.value }))}>
                      <option value="">Selecionar…</option>
                      {systemData.origins.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                    {form.originId && (
                      <p className="text-sm text-muted mt-2">
                        {systemData.origins.find((o) => o.id === form.originId)?.description}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="label">História / Background</label>
                  <textarea className="input min-h-[100px] resize-none" placeholder="Conte um pouco sobre seu personagem…" value={form.background} onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-foreground">Atributos Base</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {systemSchema?.attributes?.map((attr) => (
                    <div key={attr.id} className="bg-surface rounded-xl p-4 text-center">
                      <div className="text-xs text-muted uppercase tracking-wider mb-1">{attr.abbr}</div>
                      <div className="text-sm text-foreground mb-2">{attr.name}</div>
                      <input
                        type="number"
                        min={attr.min}
                        max={attr.max}
                        className="input text-center text-lg font-bold"
                        value={form.attributes[attr.id] ?? attr.defaultValue}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          attributes: { ...f.attributes, [attr.id]: +e.target.value },
                        }))}
                      />
                      <div className="text-xs text-muted mt-1">{attr.min}–{attr.max}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || !form.name}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4" />}
              Criar Personagem
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
