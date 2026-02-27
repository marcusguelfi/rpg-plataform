'use client'

import { useState } from 'react'
import { Plus, Trash2, Package } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { RpgSystemSchema, SheetData, SystemData } from '@/types/rpg'

interface Props {
  sheetData: SheetData
  schema: RpgSystemSchema
  systemData: SystemData
  onChange: (updater: (prev: SheetData) => SheetData) => void
  readOnly: boolean
}

export function SheetInventory({ sheetData, schema, systemData, onChange, readOnly }: Props) {
  const [activeCategory, setActiveCategory] = useState(schema.itemCategories[0]?.id || '')

  const addItem = () => {
    onChange(prev => ({
      ...prev,
      inventory: [...prev.inventory, {
        id: uuidv4(),
        name: 'Novo item',
        category: activeCategory,
        quantity: 1,
        fields: {},
      }],
    }))
  }

  const removeItem = (id: string) => {
    onChange(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }))
  }

  const updateItem = (id: string, field: string, value: unknown) => {
    onChange(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => i.id === id ? { ...i, [field]: value } : i),
    }))
  }

  const updateItemField = (id: string, fieldId: string, value: unknown) => {
    onChange(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => i.id === id ? { ...i, fields: { ...i.fields, [fieldId]: value } } : i),
    }))
  }

  const categorized = schema.itemCategories.reduce<Record<string, typeof sheetData.inventory>>((acc, cat) => {
    acc[cat.id] = sheetData.inventory.filter(i => i.category === cat.id)
    return acc
  }, {})

  return (
    <div>
      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {schema.itemCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: 6, whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 600,
              background: activeCategory === cat.id ? 'var(--color-primary)' : 'var(--color-surface-2)',
              border: `1px solid ${activeCategory === cat.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              color: activeCategory === cat.id ? 'white' : 'var(--color-text-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {cat.name}
            {categorized[cat.id]?.length > 0 && (
              <span style={{ marginLeft: '0.375rem', opacity: 0.7 }}>({categorized[cat.id].length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Items for active category */}
      {schema.itemCategories.filter(c => c.id === activeCategory).map(cat => (
        <div key={cat.id}>
          {categorized[cat.id]?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <Package style={{ width: 32, height: 32, margin: '0 auto 0.5rem', opacity: 0.3 }} />
              Nenhum item em {cat.name}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {categorized[cat.id].map(item => (
                <div key={item.id} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: cat.fields.length > 0 ? '0.5rem' : 0 }}>
                    {!readOnly ? (
                      <>
                        <input
                          value={item.name}
                          onChange={e => updateItem(item.id, 'name', e.target.value)}
                          className="input"
                          style={{ flex: 1, fontSize: '0.875rem', padding: '0.375rem 0.5rem' }}
                          placeholder="Nome do item"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          style={{ width: 56, textAlign: 'center', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text)', fontSize: '0.875rem', padding: '0.375rem' }}
                          min={1}
                        />
                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>x{item.quantity}</span>
                      </div>
                    )}
                  </div>
                  {cat.fields.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {cat.fields.map(field => (
                        <div key={field.id} style={{ flex: 1, minWidth: 80 }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)', marginBottom: '0.125rem' }}>{field.name}</div>
                          {!readOnly ? (
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={(item.fields[field.id] as string) || ''}
                              onChange={e => updateItemField(item.id, field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                              style={{ width: '100%', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: 4, color: 'var(--color-text)', fontSize: '0.8rem', padding: '0.25rem 0.375rem' }}
                              placeholder="—"
                            />
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{(item.fields[field.id] as string) || '—'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!readOnly && (
            <button onClick={addItem} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>
              <Plus size={14} />
              Adicionar {cat.name.toLowerCase()}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
