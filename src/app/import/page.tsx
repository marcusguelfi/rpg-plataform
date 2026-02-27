'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, CheckCircle2, XCircle, Loader2, AlertTriangle, Sparkles, ChevronRight,
} from 'lucide-react'

type ImportStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface ImportJob {
  id: string
  status: string
  progress: number
  systemId?: string
  error?: string
}

export default function ImportPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [job, setJob] = useState<ImportJob | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [systemName, setSystemName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  async function handleFile(file: File) {
    if (!file.name.endsWith('.pdf')) {
      alert('Por favor, envie um arquivo PDF.')
      return
    }
    setSelectedFile(file)
  }

  async function startImport() {
    if (!selectedFile) return
    setStatus('uploading')

    const formData = new FormData()
    formData.append('file', selectedFile)
    if (systemName) formData.append('systemName', systemName)

    try {
      const res = await fetch('/api/import/pdf', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Falha ao iniciar importação')
      const data = await res.json()
      setJob(data)
      setStatus('processing')
      pollJob(data.id)
    } catch (err) {
      setStatus('error')
    }
  }

  async function pollJob(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/import/pdf/${jobId}`)
        const data: ImportJob = await res.json()
        setJob(data)
        if (data.status === 'completed') {
          clearInterval(interval)
          setStatus('done')
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setStatus('error')
        }
      } catch {
        clearInterval(interval)
        setStatus('error')
      }
    }, 2000)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const steps = [
    { label: 'Upload do PDF', icon: Upload, done: status !== 'idle' },
    { label: 'Extraindo texto', icon: FileText, done: (job?.progress ?? 0) >= 25 },
    { label: 'Identificando elementos', icon: Sparkles, done: (job?.progress ?? 0) >= 75 },
    { label: 'Criando sistema', icon: CheckCircle2, done: status === 'done' },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Importar Sistema via PDF
          </h1>
          <p className="text-muted">
            Envie o livro de regras em PDF e nós extrairemos automaticamente origens,
            rituais, armas, condições e montaremos a ficha para você.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' || status === 'uploading' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* System name */}
              <div>
                <label className="label">Nome do Sistema (opcional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Tormenta20, Call of Cthulhu…"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
                <p className="text-xs text-muted mt-1">
                  Se não informado, usaremos o nome detectado no PDF.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                  ${dragOver
                    ? 'border-primary bg-primary/10 scale-[1.01]'
                    : 'border-border hover:border-primary/50 hover:bg-surface/50'}
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 text-primary mx-auto" />
                    <p className="font-semibold text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <p className="text-xs text-muted">Clique para trocar o arquivo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-muted mx-auto" />
                    <p className="text-lg font-semibold text-foreground">
                      Arraste o PDF aqui
                    </p>
                    <p className="text-sm text-muted">ou clique para selecionar</p>
                    <p className="text-xs text-muted">Suporte a qualquer livro de regras em PDF</p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={startImport}
                  disabled={status === 'uploading'}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {status === 'uploading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Iniciar Importação</>
                  )}
                </motion.button>
              )}

              {/* Info box */}
              <div className="glass rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm text-muted space-y-1">
                  <p className="font-semibold text-foreground">Como funciona a extração?</p>
                  <p>Detectamos <strong>origens</strong>, <strong>perícias</strong>, <strong>rituais/magias</strong>, <strong>armas</strong> e <strong>condições</strong> a partir de padrões de texto em português e inglês.</p>
                  <p>Quanto mais estruturado o PDF, melhor o resultado. PDFs escaneados sem OCR podem não funcionar.</p>
                </div>
              </div>
            </motion.div>
          ) : status === 'processing' ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="glass rounded-2xl p-8 space-y-6">
                <div className="text-center space-y-2">
                  <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                  <h2 className="text-xl font-semibold text-foreground">Processando PDF…</h2>
                  <p className="text-muted">Isso pode levar até 2 minutos dependendo do tamanho do arquivo.</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Progresso</span>
                    <span className="text-foreground font-medium">{job?.progress ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      animate={{ width: `${job?.progress ?? 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step.done ? 'bg-green-500/20 text-green-400' : 'bg-surface text-muted'}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className={`text-sm ${step.done ? 'text-foreground' : 'text-muted'}`}>
                        {step.label}
                      </span>
                      {step.done && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : status === 'done' ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Sistema Importado!</h2>
                <p className="text-muted">O sistema foi criado com sucesso e está disponível para uso.</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => router.push('/systems')}
                  className="btn-primary flex items-center gap-2"
                >
                  Ver Sistemas <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setStatus('idle'); setJob(null); setSelectedFile(null) }}
                  className="btn-secondary"
                >
                  Importar Outro
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Falha na Importação</h2>
                <p className="text-muted">{job?.error ?? 'Ocorreu um erro inesperado. Verifique o arquivo e tente novamente.'}</p>
              </div>
              <button
                onClick={() => { setStatus('idle'); setJob(null); setSelectedFile(null) }}
                className="btn-primary"
              >
                Tentar Novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
