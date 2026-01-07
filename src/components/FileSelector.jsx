import { useState, useEffect } from 'react'
import './FileSelector.css'

function FileSelector({ selectedFile, onFileChange }) {
  const [files, setFiles] = useState([])

  useEffect(() => {
    // 自动读取文件列表
    fetch('/data/file-list.json')
      .then(res => res.json())
      .then(data => {
        setFiles(data)
        // 如果当前没有选中文件，或者选中的文件不在列表中，自动选中最新的（第一个）
        if (data.length > 0 && (!selectedFile || !data.includes(selectedFile))) {
          onFileChange(data[0])
        }
      })
      .catch(err => {
        console.error('无法加载文件列表:', err)
        // 降级回退：如果加载失败，使用默认列表
        setFiles([
          'parallel_result_20260107.tsv',
          'parallel_result_20260105.tsv'
        ])
      })
  }, [])

  const formatFileName = (filename) => {
    if (!filename) return ''
    return filename
      .replace('parallel_result_', '')
      .replace('.tsv', '')
      .replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
  }

  return (
    <div className="file-selector">
      <label>选择日期文件：</label>
      <select 
        value={selectedFile || ''} 
        onChange={(e) => onFileChange(e.target.value)}
        className="file-select"
        disabled={files.length === 0}
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

