'use client'

import type { RpgSystemSchema, SheetData, SystemData } from '@/types/rpg'

interface Props {
  sheetData: SheetData
  schema: RpgSystemSchema
  systemData: SystemData
  onChange: (updater: (prev: SheetData) => SheetData) => void
  readOnly: boolean
}

export function SheetInfo({ sheetData, schema, systemData, onChange, readOnly }: Props) {
  const origins = systemData.origins || []

  const update = (field: string, value: unknown) => {
    onChange(prev => ({
      ...prev,
      info: { ...prev.info, [field]: value },
    }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem' }}>
      <div>
        <label className="label">Nome do personagem</label>
        {readOnly ? (
          <div style={{ fontSize: '0.9rem', padding: '0.375rem 0', fontWeight: 600 }}>{sheetData.info.name || '—'}</div>
        ) : (
          <input className="input" value={(sheetData.info.name as string) || ''} onChange={e => update('name', e.target.value)} placeholder="Nome" />
        )}
      </div>

      {origins.length > 0 && (
        <div>
          <label className="label">Origem</label>
          {readOnly ? (
            <div style={{ fontSize: '0.9rem', padding: '0.375rem 0' }}>{origins.find(o => o.id === sheetData.info.origin)?.name || sheetData.info.origin || '—'}</div>
          ) : (
            <select
              className="input"
              value={(sheetData.info.origin as string) || ''}
              onChange={e => update('origin', e.target.value)}
            >
              <option value="">Selecionar origem</option>
              {origins.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          )}
        </div>
      )}

      <div>
        <label className="label">Nível</label>
        {readOnly ? (
          <div style={{ fontSize: '0.9rem', padding: '0.375rem 0' }}>{sheetData.info.level || 1}</div>
        ) : (
          <input className="input" type="number" min={1} max={20} value={(sheetData.info.level as number) || 1} onChange={e => update('level', parseInt(e.target.value) || 1)} />
        )}
      </div>

      <div>
        <label className="label">Experiência (XP)</label>
        {readOnly ? (
          <div style={{ fontSize: '0.9rem', padding: '0.375rem 0' }}>{sheetData.info.xp || 0}</div>
        ) : (
          <input className="input" type="number" min={0} value={(sheetData.info.xp as number) || 0} onChange={e => update('xp', parseInt(e.target.value) || 0)} />
        )}
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <label className="label">Histórico / Background</label>
        {readOnly ? (
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{(sheetData.info.background as string) || '—'}</div>
        ) : (
          <textarea
            className="input"
            rows={3}
            value={(sheetData.info.background as string) || ''}
            onChange={e => update('background', e.target.value)}
            placeholder="Descreva o histórico do seu personagem..."
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        )}
      </div>

      {/* Origin bonus display */}
      {sheetData.info.origin && origins.length > 0 && (() => {
        const origin = origins.find(o => o.id === sheetData.info.origin)
        if (!origin) return null
        return (
          <div style={{ gridColumn: '1 / -1', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-light)', marginBottom: '0.5rem' }}>
              Origem: {origin.name}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{origin.description}</p>
            {origin.abilities.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {origin.abilities.map((ab, i) => (
                  <span key={i} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{ab}</span>
                ))}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
