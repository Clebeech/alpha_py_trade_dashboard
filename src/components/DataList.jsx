import { ChevronRight, Award } from 'lucide-react'
import './DataList.css'

function DataList({ data, onSelectItem, selectedItem }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)'
    if (score >= 70) return 'var(--warning)'
    return 'var(--danger)'
  }

  return (
    <div className="data-list">
      <div className="list-header">
        <Award size={20} className="header-icon" />
        <h2>股票列表（按评分排序）</h2>
      </div>
      <div className="list-container">
        {data.map((item, index) => (
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
        ))}
      </div>
    </div>
  )
}

export default DataList

