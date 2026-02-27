// Universal RPG System Type Definitions
// This is the core of the multi-system architecture.
// A RpgSystemSchema defines the "rules" of a system,
// and SheetData holds a character's filled values.

// ============================================================
// SYSTEM SCHEMA (what defines an RPG system)
// ============================================================

export interface AttributeDefinition {
  id: string
  name: string
  abbr: string           // e.g. "FOR", "AGI"
  description?: string
  min: number
  max: number
  defaultValue: number
  category?: string      // e.g. "combat", "social"
}

export interface SkillDefinition {
  id: string
  name: string
  linkedAttribute: string  // attribute id
  description?: string
  trainedOnly?: boolean
}

export interface DerivedStatDefinition {
  id: string
  name: string
  abbr?: string
  formula: string          // e.g. "FOR + TEI" or "floor(AGI/2)"
  displayType: 'bar' | 'number' | 'text'
  color?: string
}

export interface ItemCategoryDefinition {
  id: string
  name: string
  fields: ItemFieldDefinition[]
}

export interface ItemFieldDefinition {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'boolean'
  options?: string[]      // for select type
  defaultValue?: unknown
}

export interface OriginDefinition {
  id: string
  name: string
  description: string
  bonuses: Record<string, number>  // attributeId -> bonus value
  abilities: string[]
  skills?: string[]      // skill ids granted
}

export interface SpellDefinition {
  id: string
  name: string
  description: string
  school?: string
  level?: number
  cost?: string          // e.g. "2 PE"
  range?: string
  target?: string
  duration?: string
  effect: string
  tags?: string[]
}

export interface WeaponDefinition {
  id: string
  name: string
  type: string           // melee, ranged, etc.
  damage: string         // e.g. "1d6+For"
  range?: string
  crit?: string
  weight?: number
  properties?: string[]
  description?: string
}

export interface ConditionDefinition {
  id: string
  name: string
  description: string
  iconName?: string
  effects?: string
}

export interface RpgSystemSchema {
  version: string
  attributes: AttributeDefinition[]
  skills: SkillDefinition[]
  derivedStats: DerivedStatDefinition[]
  itemCategories: ItemCategoryDefinition[]
  conditions: ConditionDefinition[]
  // Sheet sections to show and their order
  sheetSections: SheetSection[]
}

export interface SheetSection {
  id: string
  title: string
  component: string   // which UI component to render
  order: number
  collapsible?: boolean
}

export interface SystemData {
  origins?: OriginDefinition[]
  spells?: SpellDefinition[]
  weapons?: WeaponDefinition[]
  conditions?: ConditionDefinition[]
  [key: string]: unknown
}

// ============================================================
// SHEET DATA (character's filled values)
// ============================================================

export interface SheetData {
  // Core info
  info: {
    name: string
    portrait?: string
    background?: string
    origin?: string      // origin id
    level?: number
    xp?: number
    [key: string]: unknown
  }
  // Attribute values: { attributeId: value }
  attributes: Record<string, number>
  // Skill values: { skillId: {trained: bool, bonus: number} }
  skills: Record<string, { trained: boolean; bonus: number; customBonus?: number }>
  // Derived stats current values (HP, PE, etc.)
  derived: Record<string, { current: number; max: number }>
  // Inventory
  inventory: CharacterItem[]
  // Known spells/rituals
  spells: string[]   // spell ids
  // Currency
  currency: Record<string, number>
  // Extra free-form fields (system-specific)
  extra: Record<string, unknown>
}

export interface CharacterItem {
  id: string
  definitionId?: string   // weapon/item definition id (optional)
  name: string
  category: string
  quantity: number
  fields: Record<string, unknown>
  notes?: string
}

// ============================================================
// FULL SYSTEM (schema + data combined)
// ============================================================

export interface FullRpgSystem {
  id: string
  name: string
  slug: string
  description?: string
  version: string
  coverImage?: string
  schema: RpgSystemSchema
  data: SystemData
  isPublished: boolean
}
