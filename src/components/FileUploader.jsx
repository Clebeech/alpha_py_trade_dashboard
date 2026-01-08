import { useState, useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import './FileUploader.css'

function FileUploader({ onFileLoad }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    // 验证文件类型
    if (!file.name.endsWith('.tsv') && !file.name.endsWith('.csv')) {
      alert('请上传 .tsv 或 .csv 格式的文件')
      return
    }

    setUploadedFile(file)

    // 读取文件内容
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      onFileLoad(text, file.name)
    }
    reader.onerror = () => {
      alert('文件读取失败，请重试')
    }
    reader.readAsText(file)
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileLoad(null, null)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="file-uploader">
      {!uploadedFile ? (
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload size={48} className="upload-icon" />
          <h3>拖拽文件到此处或点击上传</h3>
          <p>支持 .tsv 和 .csv 格式文件</p>
          <p className="upload-hint">文件应包含与标准数据文件相同的列结构</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".tsv,.csv"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="uploaded-file-info">
          <div className="file-icon-wrapper">
            <FileText size={32} className="file-icon" />
          </div>
          <div className="file-details">
            <h4>{uploadedFile.name}</h4>
            <p>{(uploadedFile.size / 1024).toFixed(2)} KB</p>
          </div>
          <button 
            className="clear-file-btn" 
            onClick={handleClearFile}
            title="清除文件"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUploader

