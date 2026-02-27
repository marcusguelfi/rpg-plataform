'use client'

import { motion } from 'framer-motion'
import type { RpgSystemSchema, SheetData } from '@/types/rpg'

interface Props {
  sheetData: SheetData
  schema: RpgSystemSchema
  onChange: (updater: (prev: SheetData) => SheetData) => void
  onRoll: (attrId: string) => void
  readOnly: boolean
}

export function SheetAttributes({ sheetData, schema, onChange, onRoll, readOnly }: Props) {
  const grouped = schema.attributes.reduce<Record<string, typeof schema.attributes>>((acc, attr) => {
    const cat = attr.category || 'geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(attr)
    return acc
  }, {})

  const updateAttr = (id: string, value: number) => {
    onChange(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [id]: Math.max(0, Math.min(99, value)) },
    }))
  }

  return (
    <div>
      {Object.entries(grouped).map(([cat, attrs]) => (
        <div key={cat} style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-subtle)', marginBottom: '0.75rem' }}>
            {cat}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
            {attrs.map(attr => {
              const val = sheetData.attributes[attr.id] ?? attr.defaultValue
              return (
                <AttributeBox
                  key={attr.id}
                  attr={attr}
                  value={val}
                  onChange={v => updateAttr(attr.id, v)}
                  onRoll={() => onRoll(attr.id)}
                  readOnly={readOnly}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function AttributeBox({
  attr, value, onChange, onRoll, readOnly
}: {
  attr: RpgSystemSchema['attributes'][number]
  value: number
  onChange: (v: number) => void
  onRoll: () => void
  readOnly: boolean
}) {
  return (
    <div style={{
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      padding: '0.75rem',
      textAlign: 'center',
      position: 'relative',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
        {attr.abbr}
      </div>
      {readOnly ? (
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-light)', lineHeight: 1 }}>{value}</div>
      ) : (
        <input
          type="number"
          value={value}
          onChange={e => onChange(parseInt(e.target.value) || 0)}
          min={attr.min}
          max={attr.max}
          style={{
            width: '100%', textAlign: 'center', fontSize: '2rem', fontWeight: 700,
            color: 'var(--color-primary-light)', background: 'transparent', border: 'none',
            outline: 'none', lineHeight: 1,
          }}
        />
      )}
      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attr.name}</div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onRoll}
        title={`Rolar ${attr.name}`}
        style={{
          position: 'absolute', bottom: '-0.5rem', right: '-0.375rem',
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--color-primary)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '0.65rem',
        }}
      >
        🎲
      </motion.button>
    </div>
  )
}
