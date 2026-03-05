import { useState } from 'react'
import { Upload, FileText, AlertCircle, FileUp, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function PDFUploader({ onUploadSuccess, onUploadStart }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [lastFile, setLastFile] = useState('')

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) handleFileUpload(file)
    e.target.value = ''
  }

  const handleFileUpload = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit.')
      return
    }

    setError('')
    setLastFile('')
    setIsUploading(true)
    onUploadStart()

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await axios.post(`${API_URL}/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setLastFile(file.name)
      onUploadSuccess(response.data.extracted_code)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.detail || 'Failed to extract code from PDF.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 dark:text-slate-400 text-gray-500" />
        <h3 className="text-sm font-semibold dark:text-slate-300 text-gray-700">Import from PDF</h3>
        <span className="text-xs dark:text-slate-600 text-gray-400 ml-1">optional</span>
      </div>

      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`block relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'dark:border-purple-500/70 dark:bg-purple-900/10 border-blue-400 bg-blue-50'
            : isUploading
              ? 'dark:border-slate-600 dark:bg-slate-800/30 border-gray-300 bg-gray-50'
              : 'dark:border-slate-700/50 dark:bg-slate-800/20 dark:hover:border-slate-500/70 border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" disabled={isUploading} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-6 h-6 border-2 dark:border-purple-500 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm dark:text-slate-400 text-gray-600">Extracting code from PDF...</p>
          </div>
        ) : lastFile ? (
          <div className="flex items-center justify-center gap-2 py-1">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <p className="text-sm font-medium dark:text-green-300 text-green-700">Extracted successfully</p>
              <p className="text-xs dark:text-slate-500 text-gray-400">{lastFile} · Click to upload another</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-1">
            <FileUp className={`w-6 h-6 flex-shrink-0 ${isDragging ? 'dark:text-purple-400 text-blue-500' : 'dark:text-slate-500 text-gray-400'}`} />
            <div className="text-left">
              <p className="text-sm dark:text-slate-300 text-gray-700">
                Drop PDF here or <span className="dark:text-purple-400 text-blue-600 font-medium">browse</span>
              </p>
              <p className="text-xs dark:text-slate-600 text-gray-400 mt-0.5">
                Max 10MB · Extracts code automatically
              </p>
            </div>
          </div>
        )}
      </label>

      {error && (
        <div className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-xl dark:bg-red-900/20 dark:border dark:border-red-700/40 dark:text-red-300 bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
