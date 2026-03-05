import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeftRight, Copy, Check, Loader2, Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react'
import axios from 'axios'

const LANGUAGES = ['java', 'c', 'cpp', 'python', 'rust', 'go']

const LANGUAGE_META = {
  java:   { label: 'Java',   color: 'text-orange-400', bg: 'dark:bg-orange-900/20 dark:border-orange-700/40 bg-orange-50 border-orange-200' },
  c:      { label: 'C',      color: 'text-blue-400',   bg: 'dark:bg-blue-900/20 dark:border-blue-700/40 bg-blue-50 border-blue-200' },
  cpp:    { label: 'C++',    color: 'text-sky-400',    bg: 'dark:bg-sky-900/20 dark:border-sky-700/40 bg-sky-50 border-sky-200' },
  python: { label: 'Python', color: 'text-yellow-400', bg: 'dark:bg-yellow-900/20 dark:border-yellow-700/40 bg-yellow-50 border-yellow-200' },
  rust:   { label: 'Rust',   color: 'text-red-400',    bg: 'dark:bg-red-900/20 dark:border-red-700/40 bg-red-50 border-red-200' },
  go:     { label: 'Go',     color: 'text-cyan-400',   bg: 'dark:bg-cyan-900/20 dark:border-cyan-700/40 bg-cyan-50 border-cyan-200' },
}

const MAX_CHARS = parseInt(import.meta.env.VITE_MAX_CODE_LENGTH || '8000')
const API_URL = import.meta.env.VITE_API_URL || '/api'

function StatusPill({ translationStatus, isUploading }) {
  if (isUploading) return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300 bg-blue-50 text-blue-600">
      <Loader2 className="w-3 h-3 animate-spin" /> Extracting PDF...
    </span>
  )
  if (translationStatus === 'translating') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium dark:bg-purple-900/30 dark:text-purple-300 bg-purple-50 text-purple-600">
      <Loader2 className="w-3 h-3 animate-spin" /> Translating...
    </span>
  )
  if (translationStatus === 'success') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium dark:bg-green-900/30 dark:text-green-300 bg-green-50 text-green-600">
      <CheckCircle2 className="w-3 h-3" /> Done
    </span>
  )
  if (translationStatus === 'error') return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium dark:bg-red-900/30 dark:text-red-300 bg-red-50 text-red-600">
      <XCircle className="w-3 h-3" /> Failed
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium dark:bg-slate-800 dark:text-slate-400 bg-gray-100 text-gray-500">
      <Clock className="w-3 h-3" /> Ready
    </span>
  )
}

function LanguageSelector({ value, onChange, label }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest dark:text-slate-500 text-gray-400">{label}</span>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map(lang => {
          const meta = LANGUAGE_META[lang]
          const isActive = value === lang
          return (
            <button
              key={lang}
              onClick={() => onChange(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${
                isActive
                  ? `${meta.bg} ${meta.color}`
                  : 'dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:border-slate-500 bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {meta.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CodeTranslator({
  onTranslationStart, onTranslationSuccess, onTranslationError,
  translationStatus, isUploading,
  pdfExtractedCode, sourceLanguage, targetLanguage,
  onSourceLanguageChange, onTargetLanguageChange
}) {
  const [sourceCode, setSourceCode] = useState('')
  const [translatedCode, setTranslatedCode] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (pdfExtractedCode) setSourceCode(pdfExtractedCode)
  }, [pdfExtractedCode])

  const handleSwapLanguages = () => {
    const prevSource = sourceLanguage
    const prevTarget = targetLanguage
    onSourceLanguageChange(prevTarget)
    onTargetLanguageChange(prevSource)
    if (translatedCode) {
      setSourceCode(translatedCode)
      setTranslatedCode('')
    }
  }

  const handleTranslate = async () => {
    if (!sourceCode.trim()) { setErrorMsg('Please enter some code to translate.'); return }
    if (sourceLanguage === targetLanguage) { setErrorMsg('Source and target languages must be different.'); return }
    if (sourceCode.length > MAX_CHARS) { setErrorMsg(`Code exceeds ${MAX_CHARS.toLocaleString()} character limit.`); return }

    setErrorMsg('')
    setIsTranslating(true)
    onTranslationStart()

    try {
      const response = await axios.post(`${API_URL}/translate`, {
        source_code: sourceCode,
        source_language: sourceLanguage,
        target_language: targetLanguage
      })
      setTranslatedCode(response.data.translated_code)
      onTranslationSuccess()
    } catch (error) {
      console.error('Translation error:', error)
      setErrorMsg(error.response?.data?.detail || 'Translation failed. Please check the backend connection.')
      onTranslationError()
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const charCount = sourceCode.length
  const overLimit = charCount > MAX_CHARS

  return (
    <div className="card p-5 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 dark:text-purple-400 text-blue-500" />
          <h2 className="text-base font-semibold dark:text-white text-gray-800">Translate Code</h2>
        </div>
        <StatusPill translationStatus={translationStatus} isUploading={isUploading} />
      </div>

      {/* Language selectors */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <LanguageSelector value={sourceLanguage} onChange={onSourceLanguageChange} label="Source" />

        {/* Swap button */}
        <button
          onClick={handleSwapLanguages}
          className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-150 dark:bg-slate-800 dark:border-slate-700/50 dark:hover:border-purple-500/60 dark:text-slate-400 dark:hover:text-purple-400 bg-gray-100 border-gray-200 hover:border-blue-300 text-gray-500 hover:text-blue-500 mt-5 md:mt-4 self-start"
          title="Swap languages"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <LanguageSelector value={targetLanguage} onChange={onTargetLanguageChange} label="Target" />
      </div>

      {/* Code panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${LANGUAGE_META[sourceLanguage].color}`}>
                {LANGUAGE_META[sourceLanguage].label}
              </span>
              <span className="text-xs dark:text-slate-600 text-gray-400">input</span>
            </div>
            <span className={`text-xs tabular-nums ${overLimit ? 'text-red-400 font-semibold' : 'dark:text-slate-600 text-gray-400'}`}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          <textarea
            value={sourceCode}
            onChange={(e) => { setSourceCode(e.target.value); setErrorMsg('') }}
            placeholder={`Paste your ${LANGUAGE_META[sourceLanguage].label} code here...`}
            className={`code-panel ${overLimit ? 'border-red-500/60 focus:border-red-500' : ''}`}
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${LANGUAGE_META[targetLanguage].color}`}>
                {LANGUAGE_META[targetLanguage].label}
              </span>
              <span className="text-xs dark:text-slate-600 text-gray-400">output</span>
            </div>
            {translatedCode && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs transition-colors dark:text-slate-400 dark:hover:text-cyan-400 text-gray-500 hover:text-blue-600"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy</>
                )}
              </button>
            )}
          </div>
          <textarea
            value={translatedCode}
            readOnly
            placeholder={isTranslating ? 'Translating...' : 'Translated code appears here...'}
            className={`code-panel dark:text-cyan-300 text-blue-900 cursor-default ${isTranslating ? 'dark:border-purple-500/30' : ''}`}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl dark:bg-red-900/20 dark:border dark:border-red-700/40 dark:text-red-300 bg-red-50 border border-red-200 text-red-700 text-sm">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Translate button */}
      <button
        onClick={handleTranslate}
        disabled={isTranslating || !sourceCode.trim() || overLimit}
        className="btn-primary glow-animate"
      >
        {isTranslating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</>
        ) : (
          <><ArrowRight className="w-4 h-4" /> Translate to {LANGUAGE_META[targetLanguage].label}</>
        )}
      </button>
    </div>
  )
}
