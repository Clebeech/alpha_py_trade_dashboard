import { useState } from 'react'
import Papa from 'papaparse'
import { FlaskConical } from 'lucide-react'
import FileUploader from './FileUploader'
import DataList from './DataList'
import DataDetail from './DataDetail'
import Statistics from './Statistics'
import './TestAnalysis.css'

function TestAnalysis() {
  const [data, setData] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileLoad = (text, name) => {
    if (!text) {
      // 清除文件
      setData([])
      setSelectedItem(null)
      setFileName(null)
      return
    }

    setLoading(true)
    setFileName(name)

    try {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: text.includes('\t') ? '\t' : ',', // 自动检测分隔符
        complete: (results) => {
          const parsedData = results.data
            .map(item => ({
              ...item,
              final_score_penalized: parseFloat(item.final_score_penalized) || 0,
              score_fundamental: parseFloat(item.score_fundamental) || 0,
              score_short: parseFloat(item.score_short) || 0,
              score_medium: parseFloat(item.score_medium) || 0,
              score_long: parseFloat(item.score_long) || 0,
              final_score: parseFloat(item.final_score) || 0,
            }))
            .filter(item => 
              item.identified_stock_names && 
              item.identified_stock_names.trim() !== '' &&
              item.final_score_penalized > 0
            )
            .sort((a, b) => b.final_score_penalized - a.final_score_penalized)
          
          setData(parsedData)
          setLoading(false)
          
          // PC端自动选中第一项
          if (window.innerWidth > 1200 && parsedData.length > 0) {
            setSelectedItem(parsedData[0])
          } else {
            setSelectedItem(null)
          }
        },
        error: (error) => {
          console.error('解析错误:', error)
          alert('文件解析失败，请检查文件格式是否正确')
          setLoading(false)
        }
      })
    } catch (error) {
      console.error('处理文件错误:', error)
      alert('文件处理失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="test-analysis">
      <div className="test-header">
        <FlaskConical size={24} className="test-icon" />
        <div className="test-title">
          <h2>测试集分析</h2>
          <p>上传自定义 TSV/CSV 文件进行分析</p>
        </div>
      </div>

      <FileUploader onFileLoad={handleFileLoad} />

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>正在解析文件数据...</p>
        </div>
      ) : data.length > 0 ? (
        <>
          <div className="test-file-info">
            <span className="file-badge">{fileName}</span>
            <span className="data-count">共 {data.length} 条数据</span>
          </div>
          
          <Statistics data={data} />
          
          <div className="test-content">
            <DataList 
              data={data} 
              onSelectItem={setSelectedItem}
              selectedItem={selectedItem}
            />
            <DataDetail 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)}
            />
          </div>
        </>
      ) : fileName ? (
        <div className="empty-state">
          <p>文件已上传，但没有找到有效的数据记录</p>
          <p className="hint">请确保文件包含必需的列：identified_stock_names, final_score_penalized 等</p>
        </div>
      ) : null}
    </div>
  )
}

export default TestAnalysis

