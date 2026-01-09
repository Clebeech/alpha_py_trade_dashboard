import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { LayoutDashboard, BarChart3, Activity } from 'lucide-react'
import DataList from './components/DataList'
import DataDetail from './components/DataDetail'
import Statistics from './components/Statistics'
import FileSelector from './components/FileSelector'
import ReturnAnalysis from './components/ReturnAnalysis'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' or 'return'
  const [data, setData] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedFile, setSelectedFile] = useState('') // 初始为空，由 FileSelector 自动选中最新的
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedFile) {
      loadData(selectedFile)
    }
  }, [selectedFile])

  // 移动端适配：当选中项目时，禁用背景滚动
  useEffect(() => {
    if (window.innerWidth <= 1200) {
      document.body.style.overflow = selectedItem ? 'hidden' : 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [selectedItem])

  const loadData = async (filename) => {
    setLoading(true)
    try {
      const response = await fetch(`/data/${filename}`)
      const text = await response.text()
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
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
              return: item.return ? parseFloat(item.return) : undefined,
            }))
            .filter(item => 
              item.identified_stock_names && 
              item.identified_stock_names.trim() !== '' &&
              item.final_score_penalized > 0
            )
            .sort((a, b) => b.final_score_penalized - a.final_score_penalized)
          
          setData(parsedData)
          setLoading(false)
          // 移动端不自动选中，PC端自动选中
          if (window.innerWidth > 1200 && parsedData.length > 0) {
            setSelectedItem(parsedData[0])
          } else {
            setSelectedItem(null)
          }
        },
        error: (error) => {
          console.error('解析错误:', error)
          setLoading(false)
        }
      })
    } catch (error) {
      console.error('加载数据错误:', error)
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <LayoutDashboard className="logo-icon" size={28} />
          <h1>元神资本单公司策略交易看板</h1>
        </div>
        
        <div className="header-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={18} />
            <span>实时看板</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'return' ? 'active' : ''}`}
            onClick={() => setActiveTab('return')}
          >
            <Activity size={18} />
            <span>收益率分析</span>
          </button>
        </div>

        {(activeTab === 'dashboard' || activeTab === 'return') && (
        <FileSelector 
          selectedFile={selectedFile} 
          onFileChange={(file) => {
            setSelectedFile(file)
            setSelectedItem(null)
          }}
        />
        )}
      </header>

      {activeTab === 'dashboard' ? (
        loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>正在深度分析数据...</p>
          </div>
        ) : (
          <main>
            <Statistics data={data} />
            
            <div className="app-content">
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
          </main>
        )
      ) : (
        loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>正在分析收益率数据...</p>
          </div>
        ) : (
          <main>
            <ReturnAnalysis data={data} />
          </main>
        )
      )}
    </div>
  )
}

export default App

