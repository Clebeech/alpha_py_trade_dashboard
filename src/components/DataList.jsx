import { useState } from 'react'
import { ChevronRight, Award, TrendingUp } from 'lucide-react'
import './DataList.css'

function DataList({ data, onSelectItem, selectedItem }) {
  const [sortBy, setSortBy] = useState('score') // 'score' or 'return'
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)'
    if (score >= 70) return 'var(--warning)'
    return 'var(--danger)'
  }
  
  const getReturnColor = (returnVal) => {
    if (returnVal > 0) return 'var(--success)'
    if (returnVal < 0) return 'var(--danger)'
    return 'var(--text-secondary)'
  }
  
  // 排序数据
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'return') {
      const returnA = parseFloat(a.return)
      const returnB = parseFloat(b.return)
      // 将没有收益率的项排在后面
      if (isNaN(returnA)) return 1
      if (isNaN(returnB)) return -1
      return returnB - returnA
    }
    // 默认按评分排序（已经排好了，但为了保险起见）
    return b.final_score_penalized - a.final_score_penalized
  })

  return (
    <div className="data-list">
      <div className="list-header">
        <Award size={20} className="header-icon" />
        <div className="header-title">
          <h2>股票列表</h2>
          <div className="sort-selector">
            <button 
              className={`sort-btn ${sortBy === 'score' ? 'active' : ''}`}
              onClick={() => setSortBy('score')}
            >
              <Award size={16} />
              按评分
            </button>
            <button 
              className={`sort-btn ${sortBy === 'return' ? 'active' : ''}`}
              onClick={() => setSortBy('return')}
            >
              <TrendingUp size={16} />
              按收益率
            </button>
          </div>
        </div>
      </div>
      <div className="list-container">
        {sortedData.map((item, index) => {
          const returnVal = parseFloat(item.return)
          const hasReturn = !isNaN(returnVal)
          
          return (
            <div
              key={index}
              className={`list-item ${selectedItem === item ? 'selected' : ''}`}
              onClick={() => onSelectItem(item)}
            >
              <div className="item-main">
                <div className="item-rank-score">
                  <span className="rank-badge">#{index + 1}</span>
                  <div className="item-score" style={{ color: getScoreColor(item.final_score_penalized) }}>
                    {item.final_score_penalized.toFixed(1)}
                  </div>
                  {hasReturn && (
                    <div className="item-return" style={{ color: getReturnColor(returnVal) }}>
                      {returnVal > 0 ? '+' : ''}{returnVal.toFixed(2)}%
                    </div>
                  )}
                </div>
                
                <div className="item-info">
                  <div className="stock-title-row">
                    <span className="stock-names">{item.identified_stock_names || '未识别股票'}</span>
                    <span className="stock-codes">{item.identified_stock_codes}</span>
                  </div>
                  <div className="item-title">{item.TITLE}</div>
                  
                  <div className="item-metrics">
                    <span className="metric-tag">基本面: {item.score_fundamental.toFixed(1)}</span>
                    <span className="metric-tag">短期: {item.score_short.toFixed(1)}</span>
                    <span className="metric-tag">中期: {item.score_medium.toFixed(1)}</span>
                    <span className="metric-tag">长期: {item.score_long.toFixed(1)}</span>
                  </div>
                </div>
                
                <ChevronRight className="item-arrow" size={20} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DataList

