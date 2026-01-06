import './DataList.css'

function DataList({ data, onSelectItem, selectedItem }) {
  const getScoreColor = (score) => {
    if (score >= 7) return '#10b981'
    if (score >= 4) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="data-list">
      <h2>股票列表（按最终得分排序）</h2>
      <div className="list-container">
        {data.map((item, index) => (
          <div
            key={index}
            className={`list-item ${selectedItem === item ? 'selected' : ''}`}
            onClick={() => onSelectItem(item)}
          >
            <div className="item-header">
              <div className="item-rank">#{index + 1}</div>
              <div className="item-score" style={{ color: getScoreColor(item.final_score_penalized) }}>
                {item.final_score_penalized.toFixed(2)}
              </div>
            </div>
            
            <div className="item-stocks">
              <div className="stock-names">
                {item.identified_stock_names || '未识别股票'}
              </div>
              <div className="stock-codes">
                {item.identified_stock_codes || '-'}
              </div>
            </div>

            <div className="item-title">
              {item.TITLE || '无标题'}
            </div>

            <div className="item-meta">
              <span className="meta-item">
                <strong>日期：</strong>{item.CMNT_DATE || '-'}
              </span>
              <span className="meta-item">
                <strong>机构：</strong>{item.INST_CNAME || '-'}
              </span>
            </div>

            <div className="item-scores">
              <span className="score-badge">基本面: {item.score_fundamental.toFixed(1)}</span>
              <span className="score-badge">短期: {item.score_short.toFixed(1)}</span>
              <span className="score-badge">中期: {item.score_medium.toFixed(1)}</span>
              <span className="score-badge">长期: {item.score_long.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DataList

