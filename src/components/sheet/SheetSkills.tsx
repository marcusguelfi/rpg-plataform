'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import type { RpgSystemSchema, SheetData } from '@/types/rpg'

interface Props {
  sheetData: SheetData
  schema: RpgSystemSchema
  onChange: (updater: (prev: SheetData) => SheetData) => void
  onRoll: (skillId: string) => void
  readOnly: boolean
}

export function SheetSkills({ sheetData, schema, onChange, onRoll, readOnly }: Props) {
  const [filter, setFilter] = useState('')

  const filteredSkills = schema.skills.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  )

  const toggleTrained = (skillId: string) => {
    if (readOnly) return
    onChange(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillId]: {
          ...(prev.skills[skillId] || { trained: false, bonus: 0 }),
          trained: !(prev.skills[skillId]?.trained ?? false),
        },
      },
    }))
  }

  const updateBonus = (skillId: string, bonus: number) => {
    onChange(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillId]: {
          ...(prev.skills[skillId] || { trained: false, bonus: 0 }),
          customBonus: bonus,
        },
      },
    }))
  }

  const getSkillTotal = (skillId: string) => {
    const skillDef = schema.skills.find(s => s.id === skillId)
    if (!skillDef) return 0
    const attrVal = sheetData.attributes[skillDef.linkedAttribute] || 0
    const skill = sheetData.skills[skillId]
    if (!skill?.trained) return attrVal
    return attrVal + (skill.bonus || 0) + (skill.customBonus || 0)
  }

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input
          className="input"
          placeholder="Buscar perícia..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ paddingLeft: '2rem', fontSize: '0.875rem' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3rem 3rem 3rem', gap: '0.5rem', padding: '0 0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)' }}>Perícia</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', textAlign: 'center' }}>Trei.</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', textAlign: 'center' }}>Bônus</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', textAlign: 'center' }}>Total</span>
        </div>

        {filteredSkills.map(skill => {
          const trained = sheetData.skills[skill.id]?.trained ?? false
          const customBonus = sheetData.skills[skill.id]?.customBonus ?? 0
          const total = getSkillTotal(skill.id)
          const linkedAttr = schema.attributes.find(a => a.id === skill.linkedAttribute)

          return (
            <motion.div
              key={skill.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 3rem 3rem 3rem', gap: '0.5rem',
                padding: '0.5rem', borderRadius: 8, alignItems: 'center',
                border: '1px solid transparent',
                borderColor: trained ? 'rgba(124,58,237,0.2)' : 'transparent',
                background: trained ? 'rgba(124,58,237,0.05)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => onRoll(skill.id)}
                  style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.125rem' }}
                  title={`Rolar ${skill.name}`}
                >
                  🎲
                </button>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: trained ? 600 : 400, color: trained ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {skill.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)' }}>{linkedAttr?.abbr}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => toggleTrained(skill.id)}
                  disabled={readOnly}
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    background: trained ? 'var(--color-primary)' : 'var(--color-surface-3)',
                    border: `1px solid ${trained ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: readOnly ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', transition: 'all 0.15s',
                  }}
                >
                  {trained && '✓'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {!readOnly ? (
                  <input
                    type="number"
                    value={customBonus}
                    onChange={e => updateBonus(skill.id, parseInt(e.target.value) || 0)}
                    style={{ width: 36, textAlign: 'center', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 4, color: 'var(--color-text)', fontSize: '0.8rem', padding: '0.125rem' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{customBonus >= 0 ? '+' : ''}{customBonus}</span>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: trained ? 'var(--color-primary-light)' : 'var(--color-text)' }}>
                  {total >= 0 ? '+' : ''}{total}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
