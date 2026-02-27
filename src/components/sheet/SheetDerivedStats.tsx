'use client'

import { motion } from 'framer-motion'
import type { RpgSystemSchema, SheetData } from '@/types/rpg'

interface Props {
  sheetData: SheetData
  schema: RpgSystemSchema
  onChange: (updater: (prev: SheetData) => SheetData) => void
  readOnly: boolean
}

export function SheetDerivedStats({ sheetData, schema, onChange, readOnly }: Props) {
  const update = (id: string, field: 'current' | 'max', value: number) => {
    onChange(prev => ({
      ...prev,
      derived: {
        ...prev.derived,
        [id]: { ...(prev.derived[id] || { current: 0, max: 0 }), [field]: Math.max(0, value) },
      },
    }))
  }

  // Calculate max from formula if not set
  const calcMax = (stat: RpgSystemSchema['derivedStats'][number]) => {
    try {
      const formula = stat.formula
      // Replace attribute names with values
      let expr = formula
      for (const attr of schema.attributes) {
        const val = sheetData.attributes[attr.id] || attr.defaultValue
        expr = expr.replace(new RegExp(attr.abbr.toUpperCase(), 'gi'), String(val))
        expr = expr.replace(new RegExp(attr.id, 'gi'), String(val))
      }
      // eslint-disable-next-line no-new-func
      return Math.floor(Function(`"use strict"; return (${expr})`)())
    } catch {
      return sheetData.derived[stat.id]?.max || 10
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {schema.derivedStats.map(stat => {
        const maxCalc = calcMax(stat)
        const current = sheetData.derived[stat.id]?.current ?? maxCalc
        const max = sheetData.derived[stat.id]?.max ?? maxCalc
        const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0

        return (
          <div key={stat.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: stat.color || 'var(--color-primary-light)', fontSize: '0.9rem' }}>
                  {stat.abbr || stat.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stat.name}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {!readOnly ? (
                  <>
                    <button onClick={() => update(stat.id, 'current', current - 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <input
                      type="number"
                      value={current}
                      onChange={e => update(stat.id, 'current', parseInt(e.target.value) || 0)}
                      style={{ width: 50, textAlign: 'center', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text)', fontSize: '0.9rem', padding: '0.25rem' }}
                    />
                    <button onClick={() => update(stat.id, 'current', current + 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>/</span>
                    <input
                      type="number"
                      value={max}
                      onChange={e => update(stat.id, 'max', parseInt(e.target.value) || 0)}
                      style={{ width: 50, textAlign: 'center', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '0.25rem' }}
                    />
                  </>
                ) : (
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{current}<span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/{max}</span></span>
                )}
              </div>
            </div>

            <div style={{ height: 12, borderRadius: 6, background: 'var(--color-surface-3)', overflow: 'hidden', position: 'relative' }}>
              <motion.div
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 6, background: stat.color || 'var(--color-primary)', boxShadow: `0 0 8px ${stat.color || 'var(--color-primary)'}80` }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
