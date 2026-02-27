'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Loader2, Dice6, ChevronDown, ChevronUp, Package, Sparkles, ScrollText } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import type { FullRpgSystem, SheetData } from '@/types/rpg'
import { SheetAttributes } from '@/components/sheet/SheetAttributes'
import { SheetDerivedStats } from '@/components/sheet/SheetDerivedStats'
import { SheetSkills } from '@/components/sheet/SheetSkills'
import { SheetInventory } from '@/components/sheet/SheetInventory'
import { SheetSpells } from '@/components/sheet/SheetSpells'
import { SheetInfo } from '@/components/sheet/SheetInfo'
import { DicePanel } from '@/components/dice/DicePanel'
import { useDiceRoll } from '@/hooks/useDiceRoll'

interface Character {
  id: string
  name: string
  portrait?: string
  sheetData: SheetData
  notes?: string
  system: FullRpgSystem
  owner: { id: string; username: string }
  campaignId?: string
}

export default function SheetPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuthStore()
  const [character, setCharacter] = useState<Character | null>(null)
  const [sheetData, setSheetData] = useState<SheetData | null>(null)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set(['info', 'attributes', 'derived', 'skills']))
  const [showDice, setShowDice] = useState(false)

  const { roll } = useDiceRoll({
    characterId: character?.id,
    campaignId: character?.campaignId,
    characterName: character?.name,
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const id = params?.id as string

  useEffect(() => {
    if (!id || id === 'new') return
    fetch(`/api/characters/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setCharacter(data)
          setSheetData(data.sheetData || getDefaultSheetData())
        }
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [id])

  const updateSheetData = useCallback((updater: (prev: SheetData) => SheetData) => {
    setSheetData(prev => prev ? updater(prev) : prev)
    setSaved(false)
  }, [])

  const handleSave = async () => {
    if (!character || !sheetData) return
    setSaving(true)
    try {
      const res = await fetch(`/api/characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetData, name: sheetData.info.name || character.name }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (id: string) => {
    setActiveSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-background)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!character || !sheetData) return null

  const { schema } = character.system
  const isOwner = character.owner.id === user?.id

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Sheet Header */}
      <div className="glass" style={{ borderBottom: '1px solid var(--color-border)', padding: '0.875rem 1.5rem', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              {character.portrait ? <img src={character.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : '⚔️'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>{character.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{character.system.name}</div>
            </div>
          </div>
          <button
            onClick={() => setShowDice(!showDice)}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Dice6 size={14} />
            Dados
          </button>
          {isOwner && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: saved ? 'var(--color-success)' : undefined }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        {/* Left: Main sheet */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info section */}
          <SheetSection
            id="info"
            title="Informações"
            active={activeSections.has('info')}
            onToggle={toggleSection}
          >
            <SheetInfo
              sheetData={sheetData}
              schema={schema}
              systemData={character.system.data}
              onChange={updateSheetData}
              readOnly={!isOwner}
            />
          </SheetSection>

          {/* Attributes */}
          <SheetSection
            id="attributes"
            title="Atributos"
            active={activeSections.has('attributes')}
            onToggle={toggleSection}
          >
            <SheetAttributes
              sheetData={sheetData}
              schema={schema}
              onChange={updateSheetData}
              onRoll={async (attrId) => {
                const attrDef = schema.attributes.find(a => a.id === attrId)
                const val = sheetData.attributes[attrId] || 0
                await roll(`1d20`, `${attrDef?.name || attrId} (${val})`)
              }}
              readOnly={!isOwner}
            />
          </SheetSection>

          {/* Derived stats */}
          <SheetSection
            id="derived"
            title="Pontos de Vida & Status"
            active={activeSections.has('derived')}
            onToggle={toggleSection}
          >
            <SheetDerivedStats
              sheetData={sheetData}
              schema={schema}
              onChange={updateSheetData}
              readOnly={!isOwner}
            />
          </SheetSection>

          {/* Skills */}
          <SheetSection
            id="skills"
            title="Perícias"
            icon={<ScrollText size={16} />}
            active={activeSections.has('skills')}
            onToggle={toggleSection}
          >
            <SheetSkills
              sheetData={sheetData}
              schema={schema}
              onChange={updateSheetData}
              onRoll={async (skillId) => {
                const skillDef = schema.skills.find(s => s.id === skillId)
                const attrVal = sheetData.attributes[skillDef?.linkedAttribute || ''] || 0
                const skill = sheetData.skills[skillId]
                const bonus = skill?.trained ? attrVal + (skill.bonus || 0) + (skill.customBonus || 0) : attrVal
                await roll(`1d20`, `${skillDef?.name} (${bonus})`)
              }}
              readOnly={!isOwner}
            />
          </SheetSection>

          {/* Inventory */}
          <SheetSection
            id="inventory"
            title="Inventário"
            icon={<Package size={16} />}
            active={activeSections.has('inventory')}
            onToggle={toggleSection}
          >
            <SheetInventory
              sheetData={sheetData}
              schema={schema}
              systemData={character.system.data}
              onChange={updateSheetData}
              readOnly={!isOwner}
            />
          </SheetSection>

          {/* Spells */}
          <SheetSection
            id="spells"
            title="Rituais & Magias"
            icon={<Sparkles size={16} />}
            active={activeSections.has('spells')}
            onToggle={toggleSection}
          >
            <SheetSpells
              sheetData={sheetData}
              schema={schema}
              systemData={character.system.data}
              onChange={updateSheetData}
              readOnly={!isOwner}
            />
          </SheetSection>
        </div>

        {/* Right: Dice panel + quick info */}
        <div className="space-y-4">
          {/* HP quick bar - always visible */}
          <QuickStatusBar sheetData={sheetData} schema={schema} onChange={updateSheetData} readOnly={!isOwner} />

          {/* Dice panel */}
          <DicePanel
            onRoll={roll}
            characterName={character.name}
            schema={schema}
          />
        </div>
      </div>

      {/* Mobile dice FAB */}
      <AnimatePresence>
        {showDice && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowDice(false) }}
          >
            <div style={{ width: '100%', background: 'var(--color-surface)', borderRadius: '1rem 1rem 0 0', padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <DicePanel onRoll={roll} characterName={character.name} schema={schema} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SheetSection({
  id, title, icon, active, onToggle, children,
}: {
  id: string
  title: string
  icon?: React.ReactNode
  active: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => onToggle(id)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
      >
        {icon}
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
        {active ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
      </button>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}
          >
            <div style={{ padding: '1rem' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuickStatusBar({ sheetData, schema, onChange, readOnly }: {
  sheetData: SheetData
  schema: FullRpgSystem['schema']
  onChange: (updater: (prev: SheetData) => SheetData) => void
  readOnly: boolean
}) {
  return (
    <div className="card">
      <div style={{ fontWeight: 600, fontSize: '0.7rem', marginBottom: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Rápido</div>
      {schema.derivedStats.map(stat => {
        const val = sheetData.derived[stat.id] || { current: stat.formula ? 10 : 0, max: 20 }
        const pct = Math.max(0, Math.min(100, (val.current / (val.max || 1)) * 100))
        return (
          <div key={stat.id} style={{ marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600, color: stat.color || 'var(--color-text)' }}>{stat.abbr || stat.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {!readOnly ? (
                  <>
                    <input
                      type="number"
                      value={val.current}
                      onChange={e => onChange(prev => ({
                        ...prev,
                        derived: { ...prev.derived, [stat.id]: { ...val, current: parseInt(e.target.value) || 0 } },
                      }))}
                      style={{ width: 40, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 4, color: 'var(--color-text)', textAlign: 'center', fontSize: '0.8rem', padding: '0.125rem' }}
                    />
                    <span style={{ color: 'var(--color-text-muted)' }}>/</span>
                    <input
                      type="number"
                      value={val.max}
                      onChange={e => onChange(prev => ({
                        ...prev,
                        derived: { ...prev.derived, [stat.id]: { ...val, max: parseInt(e.target.value) || 0 } },
                      }))}
                      style={{ width: 40, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 4, color: 'var(--color-text-muted)', textAlign: 'center', fontSize: '0.8rem', padding: '0.125rem' }}
                    />
                  </>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>{val.current}/{val.max}</span>
                )}
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-3)', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 4, background: stat.color || 'var(--color-primary)' }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getDefaultSheetData(): SheetData {
  return {
    info: { name: '', background: '', origin: '', level: 1, xp: 0 },
    attributes: {},
    skills: {},
    derived: {},
    inventory: [],
    spells: [],
    currency: { ouro: 0 },
    extra: {},
  }
}
