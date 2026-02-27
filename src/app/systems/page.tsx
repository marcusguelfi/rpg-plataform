'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Loader2, ChevronRight, Upload, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface RpgSystem {
  id: string
  name: string
  slug: string
  description: string
  version: string
  isPublished: boolean
}

export default function SystemsPage() {
  const router = useRouter()
  const [systems, setSystems] = useState<RpgSystem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/systems')
      .then((r) => r.json())
      .then((d) => { setSystems(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Sistemas de RPG</h1>
            <p className="text-muted">Explore os sistemas disponíveis ou importe o seu próprio via PDF.</p>
          </div>
          <Link
            href="/import"
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar via PDF
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : systems.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <BookOpen className="w-16 h-16 text-muted mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Nenhum sistema ainda</h2>
            <p className="text-muted">Importe um livro de regras em PDF para começar.</p>
            <Link href="/import" className="btn-primary inline-flex items-center gap-2">
              <Upload className="w-4 h-4" /> Importar Sistema
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systems.map((sys, i) => (
              <motion.div
                key={sys.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/40 border border-transparent transition-colors cursor-pointer group"
                onClick={() => router.push(`/sheet/new?system=${sys.slug}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-muted border border-border rounded-full px-2 py-1">
                    v{sys.version}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">{sys.name}</h3>
                  <p className="text-sm text-muted mt-1 line-clamp-3">{sys.description}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <span className="flex items-center gap-1 text-xs text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    {sys.isPublished ? 'Disponível' : 'Em desenvolvimento'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
