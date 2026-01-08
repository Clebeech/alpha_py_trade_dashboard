import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, ExternalLink, ShieldCheck, Brain, FileText, BarChart, TrendingUp, TrendingDown } from 'lucide-react'
import './DataDetail.css'

function DataDetail({ item, onClose }) {
  if (!item) return null

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
  
  const returnVal = parseFloat(item.return)
  const hasReturn = !isNaN(returnVal)

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`data-detail ${item ? 'active' : ''}`}>
      <div className="detail-header">
        <div className="header-title">
          <ShieldCheck className="title-icon" />
          <h2>分析详情报告</h2>
        </div>
        <div className="header-actions">
          <nav className="detail-nav">
            <button onClick={() => scrollToSection('section-scores')} title="评分分布"><BarChart size={16} /></button>
            <button onClick={() => scrollToSection('section-content')} title="当日纪要"><FileText size={16} /></button>
            <button onClick={() => scrollToSection('section-map')} title="基本面图谱"><ExternalLink size={16} /></button>
            <button onClick={() => scrollToSection('section-reasoning')} title="AI推理"><Brain size={16} /></button>
          </nav>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* 股票核心概览 */}
        <section className="detail-hero">
          <div className="hero-main">
            <h1 className="hero-name">{item.identified_stock_names || '未识别股票'}</h1>
            <span className="hero-code">{item.identified_stock_codes}</span>
          </div>
          <div className="hero-metrics">
            <div className="hero-score">
              <div className="score-main" style={{ color: getScoreColor(item.final_score_penalized) }}>
                <span className="score-val">{item.final_score_penalized.toFixed(1)}</span>
                <span className="score-label">最终得分</span>
              </div>
            </div>
            {hasReturn && (
              <div className="hero-return" style={{ color: getReturnColor(returnVal) }}>
                <div className="return-main">
                  {returnVal > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  <span className="return-val">{returnVal > 0 ? '+' : ''}{returnVal.toFixed(2)}%</span>
                </div>
                <span className="return-label">当日收益率</span>
              </div>
            )}
          </div>
        </section>

        {/* 评分维度网格 */}
        <section id="section-scores" className="detail-section">
          <div className="section-header">
            <BarChart size={18} />
            <h3>多维评分分布</h3>
          </div>
          <div className="scores-grid">
            {[
              { label: '基本面', val: item.score_fundamental },
              { label: '短期', val: item.score_short },
              { label: '中期', val: item.score_medium },
              { label: '长期', val: item.score_long }
            ].map(s => (
              <div key={s.label} className="score-mini-card">
                <span className="mini-label">{s.label}</span>
                <div className="mini-bar-bg">
                  <div className="mini-bar-fill" style={{ width: `${s.val}%`, backgroundColor: getScoreColor(s.val) }}></div>
                </div>
                <span className="mini-val">{s.val.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 当日纪要 */}
        <section id="section-content" className="detail-section">
          <div className="section-header">
            <FileText size={18} />
            <h3>当日纪要内容</h3>
          </div>
          <div className="content-card">
            <h4 className="content-title">{item.TITLE}</h4>
            <div className="content-body">
              {item.CONTENT}
            </div>
          </div>
        </section>

        {/* 分析图谱 */}
        <section id="section-map" className="detail-section">
          <div className="section-header">
            <ExternalLink size={18} />
            <h3>基本面图谱 (Enhanced Map)</h3>
          </div>
          <div className="markdown-viewer">
            {item.enhanced_map ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.enhanced_map}
              </ReactMarkdown>
            ) : (
              <div className="empty-state">暂无增强图谱数据</div>
            )}
          </div>
        </section>

        {/* 推理过程 */}
        <section id="section-reasoning" className="detail-section">
          <div className="section-header">
            <Brain size={18} />
            <h3>AI 推理思考过程</h3>
          </div>
          <div className="reasoning-card">
            {item.reasoning_content || '暂无推理过程记录'}
          </div>
        </section>

        {/* 标签元数据 */}
        <section className="detail-section">
          <div className="tags-container">
            {[
              { label: '驱动', val: item.drive_category },
              { label: '目标', val: item.target_type },
              { label: '机构', val: item.INST_CNAME },
              { label: '置信度', val: item.confidence }
            ].map(tag => tag.val && (
              <div key={tag.label} className="info-tag">
                <span className="tag-key">{tag.label}:</span>
                <span className="tag-val">{tag.val}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DataDetail

