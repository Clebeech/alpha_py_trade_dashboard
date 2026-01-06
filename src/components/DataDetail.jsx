import ReactMarkdown from 'react-markdown'
import './DataDetail.css'

function DataDetail({ item, onClose }) {
  if (!item) return null

  const getScoreColor = (score) => {
    if (score >= 7) return '#10b981'
    if (score >= 4) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="data-detail">
      <div className="detail-header">
        <h2>详细信息</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="detail-content">
        {/* 股票信息 */}
        <section className="detail-section">
          <h3 className="section-title">股票信息</h3>
          <div className="stock-info">
            <div className="info-row">
              <span className="info-label">股票名称：</span>
              <span className="info-value">{item.identified_stock_names || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">股票代码：</span>
              <span className="info-value code">{item.identified_stock_codes || '-'}</span>
            </div>
          </div>
        </section>

        {/* 得分信息 */}
        <section className="detail-section">
          <h3 className="section-title">得分详情</h3>
          <div className="scores-grid">
            <div className="score-item">
              <span className="score-label">最终得分（惩罚后）</span>
              <span className="score-value" style={{ color: getScoreColor(item.final_score_penalized) }}>
                {item.final_score_penalized.toFixed(2)}
              </span>
            </div>
            <div className="score-item">
              <span className="score-label">最终得分（原始）</span>
              <span className="score-value">{item.final_score.toFixed(2)}</span>
            </div>
            <div className="score-item">
              <span className="score-label">基本面得分</span>
              <span className="score-value">{item.score_fundamental.toFixed(2)}</span>
            </div>
            <div className="score-item">
              <span className="score-label">短期得分</span>
              <span className="score-value">{item.score_short.toFixed(2)}</span>
            </div>
            <div className="score-item">
              <span className="score-label">中期得分</span>
              <span className="score-value">{item.score_medium.toFixed(2)}</span>
            </div>
            <div className="score-item">
              <span className="score-label">长期得分</span>
              <span className="score-value">{item.score_long.toFixed(2)}</span>
            </div>
            <div className="score-item">
              <span className="score-label">总惩罚</span>
              <span className="score-value">{item.penalty_total || 0}</span>
            </div>
          </div>
        </section>

        {/* 纪要信息 */}
        <section className="detail-section">
          <h3 className="section-title">当日纪要</h3>
          <div className="content-box">
            <div className="content-meta">
              <span><strong>标题：</strong>{item.TITLE || '-'}</span>
              <span><strong>日期：</strong>{item.CMNT_DATE || '-'}</span>
            </div>
            <div className="content-text">
              {item.CONTENT || '无内容'}
            </div>
          </div>
        </section>

        {/* 思考过程 - Enhanced Map */}
        <section className="detail-section">
          <h3 className="section-title">分析图谱（Enhanced Map）</h3>
          <div className="markdown-box">
            {item.enhanced_map ? (
              <ReactMarkdown>{item.enhanced_map}</ReactMarkdown>
            ) : (
              <div className="empty-content">无分析图谱</div>
            )}
          </div>
        </section>

        {/* 思考过程 - Reasoning Content */}
        <section className="detail-section">
          <h3 className="section-title">推理过程（Reasoning Content）</h3>
          <div className="content-box">
            {item.reasoning_content ? (
              <div className="content-text">{item.reasoning_content}</div>
            ) : (
              <div className="empty-content">无推理内容</div>
            )}
          </div>
        </section>

        {/* 其他信息 */}
        <section className="detail-section">
          <h3 className="section-title">其他信息</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">驱动类别：</span>
              <span className="info-value">{item.drive_category || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">目标类型：</span>
              <span className="info-value">{item.target_type || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">原因：</span>
              <span className="info-value">{item.reason || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">数据类型：</span>
              <span className="info-value">{item.data_type || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">团队：</span>
              <span className="info-value">{item.TEAM_CNAME || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">机构：</span>
              <span className="info-value">{item.INST_CNAME || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">置信度：</span>
              <span className="info-value">{item.confidence || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">需要分析：</span>
              <span className="info-value">{item.need_analysis || '-'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DataDetail

