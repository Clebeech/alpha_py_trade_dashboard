import { useState, useEffect } from 'react'
import './FileSelector.css'

function FileSelector({ selectedFile, onFileChange }) {
  const [files, setFiles] = useState([
    'parallel_result_20251230.tsv',
    'parallel_result_20260104.tsv',
    'parallel_result_20260105.tsv',
    'parallel_result_20260107.tsv'
  ])

  // 尝试自动检测文件（如果浏览器支持）
  useEffect(() => {
    // 可以在这里添加自动检测逻辑，但需要后端支持
    // 目前使用硬编码列表
  }, [])

  const formatFileName = (filename) => {
    return filename
      .replace('parallel_result_', '')
      .replace('.tsv', '')
      .replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
  }

  return (
    <div className="file-selector">
      <label>选择日期文件：</label>
      <select 
        value={selectedFile} 
        onChange={(e) => onFileChange(e.target.value)}
        className="file-select"
      >
        {files.map(file => (
          <option key={file} value={file}>
            {formatFileName(file)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FileSelector

