// Dice rolling utilities

export interface DiceResult {
  expression: string
  dice: number[]        // individual rolls
  modifier: number
  total: number
  isCritical?: boolean  // nat 20 on d20
  isFumble?: boolean    // nat 1 on d20
}

export function parseDiceExpression(expr: string): { count: number; sides: number; modifier: number } {
  const match = expr.toLowerCase().replace(/\s/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/)
  if (!match) throw new Error(`Invalid dice expression: ${expr}`)
  return {
    count: parseInt(match[1]),
    sides: parseInt(match[2]),
    modifier: match[3] ? parseInt(match[3]) : 0,
  }
}

export function rollDice(expression: string): DiceResult {
  const { count, sides, modifier } = parseDiceExpression(expression)
  const dice: number[] = []

  for (let i = 0; i < count; i++) {
    dice.push(Math.floor(Math.random() * sides) + 1)
  }

  const sum = dice.reduce((a, b) => a + b, 0)
  const total = sum + modifier

  return {
    expression,
    dice,
    modifier,
    total,
    isCritical: sides === 20 && count === 1 && dice[0] === 20,
    isFumble: sides === 20 && count === 1 && dice[0] === 1,
  }
}

export function rollAttribute(attributeValue: number, bonus: number = 0): DiceResult {
  // Ordem Paranormal style: 1d20 + attribute
  const result = rollDice('1d20')
  return {
    ...result,
    modifier: attributeValue + bonus,
    total: result.dice[0] + attributeValue + bonus,
  }
}

export const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100] as const
