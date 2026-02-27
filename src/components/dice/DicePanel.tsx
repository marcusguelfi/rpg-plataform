'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice6, History, Trash2 } from 'lucide-react'
import type { RpgSystemSchema } from '@/types/rpg'
import { useDiceStore } from '@/stores/dice.store'
import { STANDARD_DICE } from '@/lib/dice'
import { cn } from '@/lib/utils'

interface Props {
  onRoll: (expression: string, label?: string) => Promise<unknown>
  characterName?: string
  schema: RpgSystemSchema
  compact?: boolean
}

export function DicePanel({ onRoll, characterName, schema, compact }: Props) {
  const [expression, setExpression] = useState('')
  const [label, setLabel] = useState('')
  const [rollingDice, setRollingDice] = useState<number | null>(null)
  const { rolls, clearRolls } = useDiceStore()

  const quickRoll = async (sides: number) => {
    setRollingDice(sides)
    await onRoll(`1d${sides}`, `d${sides}`)
    setTimeout(() => setRollingDice(null), 500)
  }

  const handleCustomRoll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expression) return
    await onRoll(expression, label || undefined)
    setExpression('')
  }

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Dice6 size={14} />
        Dados
      </div>

      {/* Quick dice */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
        {STANDARD_DICE.map(sides => (
          <motion.button
            key={sides}
            whileTap={{ scale: 0.85 }}
            onClick={() => quickRoll(sides)}
            className={cn('dice-btn', rollingDice === sides && 'rolling')}
          >
            d{sides}
          </motion.button>
        ))}
      </div>

      {/* Custom expression */}
      <form onSubmit={handleCustomRoll} style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.875rem' }}>
        <input
          className="input"
          value={expression}
          onChange={e => setExpression(e.target.value.toLowerCase())}
          placeholder="2d6+3"
          style={{ fontSize: '0.8rem', flex: 1 }}
        />
        <input
          className="input"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Rótulo"
          style={{ fontSize: '0.8rem', width: 90 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          Rolar
        </button>
      </form>

      {/* Roll history */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <History size={12} />
            Histórico
          </div>
          {rolls.length > 0 && (
            <button onClick={clearRolls} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', fontSize: '0.7rem' }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: 240, overflowY: 'auto' }}>
          <AnimatePresence mode="popLayout">
            {rolls.slice(0, 20).map(roll => (
              <motion.div
                key={roll.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.5rem',
                  background: roll.isMine ? 'rgba(124,58,237,0.08)' : 'var(--color-surface-2)',
                  borderRadius: 6, border: `1px solid ${roll.isMine ? 'rgba(124,58,237,0.2)' : 'var(--color-border)'}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {roll.username}
                      {roll.label && ` · ${roll.label}`}
                      {' · '}{roll.expression}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)' }}>
                    [{roll.result.dice?.join(', ')}] {roll.result.modifier ? `+ ${roll.result.modifier}` : ''}
                  </div>
                </div>
                <div style={{
                  fontWeight: 800, fontSize: '1rem', flexShrink: 0,
                  color: roll.result.isCritical ? '#22c55e' : roll.result.isFumble ? 'var(--color-danger)' : 'var(--color-primary-light)',
                }}>
                  {roll.result.total}
                  {roll.result.isCritical && <span style={{ fontSize: '0.65rem', color: '#22c55e', marginLeft: '0.25rem' }}>CRIT!</span>}
                  {roll.result.isFumble && <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)', marginLeft: '0.25rem' }}>FALHA</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {rolls.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: '0.8rem', padding: '1rem' }}>
              Nenhuma rolagem ainda
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
