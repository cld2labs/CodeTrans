import { useEffect, useState } from 'react'
import { Code2, Sun, Moon, Zap, Wifi, WifiOff } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const PROVIDER_LABELS = {
  ollama: { label: 'Ollama · Local', icon: '🦙' },
  remote: { label: 'Remote API', icon: '⚡' },
}

export default function Header({ darkMode, onToggleDark }) {
  const [healthInfo, setHealthInfo] = useState(null)

  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(r => setHealthInfo(r.data))
      .catch(() => setHealthInfo(null))
  }, [])

  const provider = healthInfo?.inference_provider || 'remote'
  const providerMeta = PROVIDER_LABELS[provider] || PROVIDER_LABELS.remote
  const isConnected = healthInfo?.status === 'healthy'

  return (
    <header className="sticky top-0 z-50 border-b transition-colors duration-300 dark:bg-surface-900/90 dark:border-slate-700/50 bg-white/90 border-gray-200 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3.5 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 blur-md opacity-60 dark:opacity-80" />
              <div className="relative bg-gradient-to-br from-purple-600 to-cyan-500 p-2 rounded-xl">
                <Code2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight dark:text-white text-gray-900">
                Code<span className="bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">Trans</span>
              </h1>
              <p className="text-xs dark:text-slate-400 text-gray-500 leading-none">
                AI-powered code translation
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Provider / connection badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors duration-300 ${
              isConnected
                ? 'dark:bg-surface-800 dark:border-slate-700/50 bg-gray-100 border-gray-200'
                : 'dark:bg-red-900/20 dark:border-red-700/40 bg-red-50 border-red-200'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 dark:text-green-400 text-green-500" />
                  <span className="text-xs font-medium dark:text-slate-300 text-gray-600">
                    {providerMeta.icon} {providerMeta.label}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 dark:text-red-400 text-red-500" />
                  <span className="text-xs font-medium dark:text-red-300 text-red-600">
                    API offline
                  </span>
                </>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg transition-colors duration-200 dark:bg-surface-800 dark:border dark:border-slate-700/50 dark:hover:border-purple-500/50 dark:text-slate-300 bg-gray-100 border border-gray-200 hover:border-blue-300 text-gray-600"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
