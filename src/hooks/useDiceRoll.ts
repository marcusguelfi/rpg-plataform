'use client'

import { useCallback, useState } from 'react'
import { rollDice, type DiceResult } from '@/lib/dice'
import { useDiceStore } from '@/stores/dice.store'
import { useAuthStore } from '@/stores/auth.store'
import { v4 as uuidv4 } from 'uuid'

export function useDiceRoll(options?: {
  campaignId?: string
  characterId?: string
  characterName?: string
  onRoll?: (result: DiceResult) => void
  emitSocket?: (event: string, data?: unknown) => void
}) {
  const [isRolling, setIsRolling] = useState(false)
  const [lastResult, setLastResult] = useState<DiceResult | null>(null)
  const { addRoll } = useDiceStore()
  const { user } = useAuthStore()

  const roll = useCallback(async (expression: string, label?: string, isSecret = false) => {
    setIsRolling(true)
    
    // Small delay for animation feel
    await new Promise(r => setTimeout(r, 300))
    
    try {
      const result = rollDice(expression)
      setLastResult(result)

      // Add to local store
      addRoll({
        id: uuidv4(),
        expression,
        result,
        label,
        username: user?.username || 'Anônimo',
        characterName: options?.characterName,
        timestamp: new Date().toISOString(),
        isSecret,
        isMine: true,
      })

      // Emit via socket if in a campaign
      if (options?.campaignId && options?.emitSocket) {
        options.emitSocket('dice:roll', { expression, result, label, characterName: options.characterName, isSecret })
      }

      // Save to DB
      if (options?.campaignId || options?.characterId) {
        fetch('/api/dice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression,
            label,
            isSecret,
            characterId: options?.characterId,
            campaignId: options?.campaignId,
          }),
        }).catch(console.error)
      }

      options?.onRoll?.(result)
      return result
    } finally {
      setIsRolling(false)
    }
  }, [addRoll, user, options])

  return { roll, isRolling, lastResult }
}
