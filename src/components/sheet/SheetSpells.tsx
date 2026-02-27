'use client'

import { useState } from 'react'
import { Plus, X, Search, Sparkles } from 'lucide-react'
import type { RpgSystemSchema, SheetData, SystemData } from '@/types/rpg'

interface Props {
  sheetData: SheetData
  schema: RpgSystemSchema
  systemData: SystemData
  onChange: (updater: (prev: SheetData) => SheetData) => void
  readOnly: boolean
}

export function SheetSpells({ sheetData, schema, systemData, onChange, readOnly }: Props) {
  const [search, setSearch] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const spells = systemData.spells || []
  const knownSpells = spells.filter(s => sheetData.spells.includes(s.id))
  const unknownSpells = spells.filter(s => !sheetData.spells.includes(s.id) && s.name.toLowerCase().includes(search.toLowerCase()))

  const addSpell = (id: string) => {
    onChange(prev => ({ ...prev, spells: [...prev.spells, id] }))
  }

  const removeSpell = (id: string) => {
    onChange(prev => ({ ...prev, spells: prev.spells.filter(s => s !== id) }))
  }

  return (
    <div>
      {knownSpells.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          <Sparkles style={{ width: 32, height: 32, margin: '0 auto 0.5rem', opacity: 0.3 }} />
          Nenhum ritual conhecido
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {knownSpells.map(spell => (
            <div key={spell.id} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{spell.name}</div>
                  {(spell.school || spell.cost) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      {spell.school && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{spell.school}</span>}
                      {spell.cost && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Custo: {spell.cost}</span>}
                    </div>
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{spell.description || spell.effect}</p>
                </div>
                {!readOnly && (
                  <button onClick={() => removeSpell(spell.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: '0.125rem', flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!readOnly && spells.length > 0 && (
        <>
          <button onClick={() => setShowPicker(!showPicker)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem', marginBottom: showPicker ? '0.75rem' : 0 }}>
            <Plus size={14} />
            Adicionar ritual
          </button>

          {showPicker && (
            <div>
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input className="input" placeholder="Buscar ritual..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem', fontSize: '0.875rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 300, overflowY: 'auto' }}>
                {unknownSpells.map(spell => (
                  <button key={spell.id} onClick={() => { addSpell(spell.id); setSearch('') }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text)', textAlign: 'left', transition: 'border-color 0.15s' }}>
                    <Plus size={14} style={{ color: 'var(--color-primary-light)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{spell.name}</div>
                      {spell.school && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{spell.school}</div>}
                    </div>
                  </button>
                ))}
                {unknownSpells.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '1rem' }}>Nenhum ritual encontrado</div>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
