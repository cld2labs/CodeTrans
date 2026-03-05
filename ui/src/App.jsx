import { useState, useEffect } from 'react'
import CodeTranslator from './components/CodeTranslator'
import PDFUploader from './components/PDFUploader'
import Header from './components/Header'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [translationStatus, setTranslationStatus] = useState('idle')
  const [sourceLanguage, setSourceLanguage] = useState('python')
  const [targetLanguage, setTargetLanguage] = useState('java')
  const [pdfExtractedCode, setPdfExtractedCode] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleTranslationStart = () => setTranslationStatus('translating')
  const handleTranslationSuccess = () => {
    setTranslationStatus('success')
    setTimeout(() => setTranslationStatus('idle'), 4000)
  }
  const handleTranslationError = () => {
    setTranslationStatus('error')
    setTimeout(() => setTranslationStatus('idle'), 4000)
  }
  const handlePDFUploadSuccess = (extractedCode) => {
    setPdfExtractedCode(extractedCode)
    setIsUploading(false)
  }
  const handlePDFUploadStart = () => setIsUploading(true)

  return (
    <div className="min-h-screen transition-colors duration-300 dark:bg-surface-950 bg-gray-50">
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <CodeTranslator
          onTranslationStart={handleTranslationStart}
          onTranslationSuccess={handleTranslationSuccess}
          onTranslationError={handleTranslationError}
          translationStatus={translationStatus}
          isUploading={isUploading}
          pdfExtractedCode={pdfExtractedCode}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceLanguageChange={setSourceLanguage}
          onTargetLanguageChange={setTargetLanguage}
        />

        <div className="mt-4">
          <PDFUploader
            onUploadSuccess={handlePDFUploadSuccess}
            onUploadStart={handlePDFUploadStart}
          />
        </div>
      </main>
    </div>
  )
}

export default App
