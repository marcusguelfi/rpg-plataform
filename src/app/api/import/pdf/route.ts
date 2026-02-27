import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'GM')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const systemName = formData.get('systemName') as string | null

  if (!file || !systemName) {
    return NextResponse.json({ error: 'Arquivo e nome do sistema são obrigatórios' }, { status: 400 })
  }

  if (!file.name.endsWith('.pdf')) {
    return NextResponse.json({ error: 'Apenas arquivos PDF são aceitos' }, { status: 400 })
  }

  // Create the import job
  const job = await prisma.pdfImportJob.create({
    data: { filename: file.name, status: 'PENDING', progress: 0 },
  })

  // Process async - we respond immediately and process in background
  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Don't await - fire and forget, job tracks progress
  processImport(job.id, buffer, systemName).catch(console.error)

  return NextResponse.json({ jobId: job.id }, { status: 202 })
}

async function processImport(jobId: string, buffer: Buffer, systemName: string) {
  try {
    await prisma.pdfImportJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', progress: 10 },
    })

    // Dynamic import to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    await prisma.pdfImportJob.update({
      where: { id: jobId },
      data: { progress: 30 },
    })

    // Extract structured data from the PDF text
    const extracted = extractRpgDataFromText(text, systemName)

    await prisma.pdfImportJob.update({
      where: { id: jobId },
      data: { progress: 70 },
    })

    // Save as RPG System
    const slug = systemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const existingSystem = await prisma.rpgSystem.findUnique({ where: { slug } })
    
    if (existingSystem) {
      await prisma.rpgSystem.update({
        where: { slug },
        data: {
          schema: extracted.schema as object,
          data: extracted.data as object,
          updatedAt: new Date(),
        },
      })
    } else {
      await prisma.rpgSystem.create({
        data: {
          name: systemName,
          slug,
          schema: extracted.schema as object,
          data: extracted.data as object,
          isPublished: false,
        },
      })
    }

    await prisma.pdfImportJob.update({
      where: { id: jobId },
      data: {
        status: 'DONE',
        progress: 100,
        result: { systemSlug: slug, ...extracted.stats } as object,
      },
    })
  } catch (err) {
    await prisma.pdfImportJob.update({
      where: { id: jobId },
      data: {
        status: 'ERROR',
        log: String(err),
      },
    })
  }
}

interface ExtractedData {
  schema: object
  data: object
  stats: object
}

function extractRpgDataFromText(text: string, systemName: string): ExtractedData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const origins: Array<{ id: string; name: string; description: string; bonuses: object; abilities: string[] }> = []
  const spells: Array<{ id: string; name: string; description: string; school: string; cost: string; effect: string }> = []
  const weapons: Array<{ id: string; name: string; type: string; damage: string; description: string }> = []

  // Pattern detection for Ordem Paranormal and generic RPG books (Portuguese)
  let currentSection = ''
  let currentItem: Record<string, string> = {}

  const originPatterns = [/^origem[:\s]+(.+)/i, /^origin[:\s]+(.+)/i]
  const spellPatterns = [/^ritual[:\s]+(.+)/i, /^magia[:\s]+(.+)/i, /^feitiço[:\s]+(.+)/i, /^spell[:\s]+(.+)/i]
  const weaponPatterns = [/^arma[:\s]+(.+)/i, /^weapon[:\s]+(.+)/i, /^equipamento[:\s]+(.+)/i]
  const costPattern = /custo[:\s]+(.+)/i
  const damagePattern = /dano[:\s]+(.+)/i
  const effectPattern = /efeito[:\s]+(.+)/i
  const schoolPattern = /escola[:\s]+(.+)/i

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect section headers
    if (/^ORIGENS?$/i.test(line)) { currentSection = 'origins'; continue }
    if (/^RITUAIS?|MAGIAS?|FEITIÇOS?$/i.test(line)) { currentSection = 'spells'; continue }
    if (/^ARMAS?|EQUIPAMENTOS?$/i.test(line)) { currentSection = 'weapons'; continue }

    if (currentSection === 'origins') {
      for (const p of originPatterns) {
        const m = line.match(p)
        if (m) {
          if (currentItem.type === 'origin' && currentItem.name) {
            origins.push({
              id: slugify(currentItem.name),
              name: currentItem.name,
              description: currentItem.description || '',
              bonuses: {},
              abilities: [],
            })
          }
          currentItem = { type: 'origin', name: m[1].trim(), description: '' }
        }
      }
      if (currentItem.type === 'origin' && !line.match(originPatterns[0]) && !line.match(originPatterns[1])) {
        currentItem.description = (currentItem.description || '') + ' ' + line
      }
    }

    if (currentSection === 'spells') {
      for (const p of spellPatterns) {
        const m = line.match(p)
        if (m) {
          if (currentItem.type === 'spell' && currentItem.name) {
            spells.push({
              id: slugify(currentItem.name),
              name: currentItem.name,
              description: currentItem.description || '',
              school: currentItem.school || '',
              cost: currentItem.cost || '',
              effect: currentItem.effect || currentItem.description || '',
            })
          }
          currentItem = { type: 'spell', name: m[1].trim(), description: '' }
        }
      }
      if (currentItem.type === 'spell') {
        const costM = line.match(costPattern)
        const effectM = line.match(effectPattern)
        const schoolM = line.match(schoolPattern)
        if (costM) currentItem.cost = costM[1].trim()
        if (effectM) currentItem.effect = effectM[1].trim()
        if (schoolM) currentItem.school = schoolM[1].trim()
        else currentItem.description = (currentItem.description || '') + ' ' + line
      }
    }

    if (currentSection === 'weapons') {
      for (const p of weaponPatterns) {
        const m = line.match(p)
        if (m) {
          if (currentItem.type === 'weapon' && currentItem.name) {
            weapons.push({
              id: slugify(currentItem.name),
              name: currentItem.name,
              type: 'melee',
              damage: currentItem.damage || '',
              description: currentItem.description || '',
            })
          }
          currentItem = { type: 'weapon', name: m[1].trim(), description: '' }
        }
      }
      if (currentItem.type === 'weapon') {
        const dmgM = line.match(damagePattern)
        if (dmgM) currentItem.damage = dmgM[1].trim()
        else currentItem.description = (currentItem.description || '') + ' ' + line
      }
    }
  }

  // Push last item
  if (currentItem.type === 'origin' && currentItem.name) {
    origins.push({ id: slugify(currentItem.name), name: currentItem.name, description: currentItem.description || '', bonuses: {}, abilities: [] })
  }
  if (currentItem.type === 'spell' && currentItem.name) {
    spells.push({ id: slugify(currentItem.name), name: currentItem.name, description: currentItem.description || '', school: currentItem.school || '', cost: currentItem.cost || '', effect: currentItem.effect || '' })
  }
  if (currentItem.type === 'weapon' && currentItem.name) {
    weapons.push({ id: slugify(currentItem.name), name: currentItem.name, type: 'melee', damage: currentItem.damage || '', description: currentItem.description || '' })
  }

  // Build a generic schema based on what was found
  const schema = buildGenericSchema(systemName)

  return {
    schema,
    data: { origins, spells, weapons },
    stats: {
      originsFound: origins.length,
      spellsFound: spells.length,
      weaponsFound: weapons.length,
    },
  }
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function buildGenericSchema(systemName: string) {
  return {
    version: '1.0',
    attributes: [
      { id: 'str', name: 'Força', abbr: 'FOR', min: 1, max: 5, defaultValue: 1, category: 'combat' },
      { id: 'agi', name: 'Agilidade', abbr: 'AGI', min: 1, max: 5, defaultValue: 1, category: 'combat' },
      { id: 'int', name: 'Intelecto', abbr: 'INT', min: 1, max: 5, defaultValue: 1, category: 'mental' },
      { id: 'pre', name: 'Presença', abbr: 'PRE', min: 1, max: 5, defaultValue: 1, category: 'social' },
      { id: 'vig', name: 'Vigor', abbr: 'VIG', min: 1, max: 5, defaultValue: 1, category: 'combat' },
    ],
    skills: [
      { id: 'athletics', name: 'Atletismo', linkedAttribute: 'str' },
      { id: 'acrobatics', name: 'Acrobacia', linkedAttribute: 'agi' },
      { id: 'stealth', name: 'Furtividade', linkedAttribute: 'agi' },
      { id: 'investigation', name: 'Investigação', linkedAttribute: 'int' },
      { id: 'medicine', name: 'Medicina', linkedAttribute: 'int' },
      { id: 'persuasion', name: 'Persuasão', linkedAttribute: 'pre' },
      { id: 'intimidation', name: 'Intimidação', linkedAttribute: 'pre' },
      { id: 'perception', name: 'Percepção', linkedAttribute: 'pre' },
      { id: 'fortitude', name: 'Fortitude', linkedAttribute: 'vig' },
    ],
    derivedStats: [
      { id: 'hp', name: 'Pontos de Vida', abbr: 'PV', formula: 'vig * 4 + 8', displayType: 'bar', color: '#ef4444' },
      { id: 'mp', name: 'Pontos de Esforço', abbr: 'PE', formula: 'pre + int + 2', displayType: 'bar', color: '#8b5cf6' },
      { id: 'san', name: 'Sanidade', abbr: 'SAN', formula: 'pre * 5', displayType: 'bar', color: '#06b6d4' },
    ],
    itemCategories: [
      {
        id: 'weapons', name: 'Armas',
        fields: [
          { id: 'damage', name: 'Dano', type: 'text' },
          { id: 'range', name: 'Alcance', type: 'text' },
          { id: 'crit', name: 'Crítico', type: 'text' },
        ],
      },
      {
        id: 'armor', name: 'Proteção',
        fields: [
          { id: 'defense', name: 'Defesa', type: 'number' },
          { id: 'penalty', name: 'Penalidade', type: 'number' },
        ],
      },
      { id: 'items', name: 'Itens Gerais', fields: [{ id: 'weight', name: 'Peso', type: 'number' }] },
    ],
    conditions: [
      { id: 'abalado', name: 'Abalado', description: 'Penalidade de -2 em testes de PRE', iconName: 'brain' },
      { id: 'lento', name: 'Lento', description: 'Movimento reduzido à metade', iconName: 'footprints' },
      { id: 'vulneravel', name: 'Vulnerável', description: 'Ataques contra você têm +2 de bônus', iconName: 'shield-off' },
    ],
    sheetSections: [
      { id: 'info', title: 'Informações', component: 'SheetInfo', order: 0 },
      { id: 'attributes', title: 'Atributos', component: 'SheetAttributes', order: 1 },
      { id: 'derived', title: 'Status', component: 'SheetDerivedStats', order: 2 },
      { id: 'skills', title: 'Perícias', component: 'SheetSkills', order: 3 },
      { id: 'inventory', title: 'Inventário', component: 'SheetInventory', order: 4 },
      { id: 'spells', title: 'Rituais', component: 'SheetSpells', order: 5, collapsible: true },
      { id: 'notes', title: 'Anotações', component: 'SheetNotes', order: 6, collapsible: true },
    ],
  }
}
