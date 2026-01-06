import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import DataList from './components/DataList'
import DataDetail from './components/DataDetail'
import Statistics from './components/Statistics'
import FileSelector from './components/FileSelector'
import './App.css'

function App() {
  const [data, setData] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedFile, setSelectedFile] = useState('parallel_result_20260105.tsv')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData(selectedFile)
  }, [selectedFile])

  const loadData = async (filename) => {
    setLoading(true)
    try {
      const response = await fetch(`/data/${filename}`)
      const text = await response.text()
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // 转换数据并排序
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
            .filter(item => item.identified_stock_names && item.identified_stock_names.trim() !== '')
            .sort((a, b) => b.final_score_penalized - a.final_score_penalized)
          
          setData(parsedData)
          setLoading(false)
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

  const handleFileChange = (filename) => {
    setSelectedFile(filename)
    setSelectedItem(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>交易数据看板</h1>
        <FileSelector 
          selectedFile={selectedFile} 
          onFileChange={handleFileChange}
        />
      </header>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <>
          <Statistics data={data} />
          
          <div className="app-content">
            <DataList 
              data={data} 
              onSelectItem={setSelectedItem}
              selectedItem={selectedItem}
            />
            {selectedItem && (
              <DataDetail 
                item={selectedItem} 
                onClose={() => setSelectedItem(null)}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App

