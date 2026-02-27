import { create } from 'zustand'
import type { DiceResult } from '@/lib/dice'

export interface DiceRollEntry {
  id: string
  expression: string
  result: DiceResult
  label?: string
  username: string
  characterName?: string
  timestamp: string
  isSecret: boolean
  isMine: boolean
}

interface DiceStore {
  rolls: DiceRollEntry[]
  isRolling: boolean
  addRoll: (roll: DiceRollEntry) => void
  setRolling: (rolling: boolean) => void
  clearRolls: () => void
}

export const useDiceStore = create<DiceStore>((set) => ({
  rolls: [],
  isRolling: false,
  addRoll: (roll) => set((state) => ({
    rolls: [roll, ...state.rolls].slice(0, 100), // keep last 100
  })),
  setRolling: (isRolling) => set({ isRolling }),
  clearRolls: () => set({ rolls: [] }),
}))
