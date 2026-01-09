import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Activity, Settings } from 'lucide-react'
import './ReturnAnalysis.css'

function ReturnAnalysis({ data }) {
  const [customMin, setCustomMin] = useState(70)
  const [customMax, setCustomMax] = useState(80)
  const [showCustom, setShowCustom] = useState(false)

  // 过滤有收益率的数据
  const dataWithReturn = useMemo(() => {
    return data.filter(item => 
      item.return !== undefined && 
      item.return !== null && 
      !isNaN(item.return)
    ).map(item => ({
      ...item,
      return: parseFloat(item.return),
      score: item.final_score_penalized
    }))
  }, [data])

  // 计算 Pearson 相关系数
  const calculatePearson = (x, y) => {
    if (x.length === 0 || x.length !== y.length) return 0
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  // 计算 Spearman 相关系数（基于排名）
  const calculateSpearman = (x, y) => {
    if (x.length === 0 || x.length !== y.length) return 0
    
    // 转换为排名
    const getRanks = (arr) => {
      const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val)
      const ranks = new Array(arr.length)
      sorted.forEach((item, rank) => {
        ranks[item.idx] = rank + 1
      })
      return ranks
    }
    
    const ranksX = getRanks(x)
    const ranksY = getRanks(y)
    
    return calculatePearson(ranksX, ranksY)
  }

  // 分档统计
  const getSegmentStats = (minScore, maxScore, label) => {
    const segment = dataWithReturn.filter(item => 
      item.score >= minScore && item.score < maxScore
    )
    const positive = segment.filter(item => item.return > 0).length
    const negative = segment.filter(item => item.return <= 0).length
    const avgReturn = segment.length > 0 
      ? segment.reduce((sum, item) => sum + item.return, 0) / segment.length 
      : 0
    const returns = segment.map(item => item.return)
    const maxReturn = returns.length > 0 ? Math.max(...returns) : 0
    const minReturn = returns.length > 0 ? Math.min(...returns) : 0
    
    return {
      label,
      minScore,
      maxScore,
      count: segment.length,
      positive,
      negative,
      positiveRate: segment.length > 0 ? (positive / segment.length * 100) : 0,
      avgReturn,
      maxReturn,
      minReturn
    }
  }

  const segments = [
    getSegmentStats(80, 101, '高分段 (≥80)'),
    getSegmentStats(70, 80, '中分段 (70-80)'),
    getSegmentStats(0, 70, '低分段 (<70)')
  ]

  const customSegment = showCustom ? getSegmentStats(customMin, customMax + 0.01, `自定义 (${customMin}-${customMax})`) : null

  // 整体统计
  const scores = dataWithReturn.map(item => item.score)
  const returns = dataWithReturn.map(item => item.return)
  const pearson = calculatePearson(scores, returns)
  const spearman = calculateSpearman(scores, returns)

  const overallStats = {
    total: dataWithReturn.length,
    avgReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
    positive: returns.filter(r => r > 0).length,
    negative: returns.filter(r => r <= 0).length,
    pearson,
    spearman
  }

  // 行业统计分析
  const industryStats = useMemo(() => {
    const industries = {}
    dataWithReturn.forEach(item => {
      const ind = item.industry || '未分类'
      if (!industries[ind]) {
        industries[ind] = {
          label: ind,
          count: 0,
          returns: [],
          scores: [],
          positive: 0
        }
      }
      industries[ind].count++
      industries[ind].returns.push(item.return)
      industries[ind].scores.push(item.score)
      if (item.return > 0) industries[ind].positive++
    })

    return Object.values(industries)
      .map(ind => {
        const avgReturn = ind.returns.reduce((a, b) => a + b, 0) / ind.count
        const pearsonInd = ind.count >= 3 ? calculatePearson(ind.scores, ind.returns) : 0
        return {
          ...ind,
          avgReturn,
          maxReturn: Math.max(...ind.returns),
          minReturn: Math.min(...ind.returns),
          positiveRate: (ind.positive / ind.count * 100),
          pearson: pearsonInd
        }
      })
      .sort((a, b) => b.avgReturn - a.avgReturn)
  }, [dataWithReturn])

  const getCorrelationStrength = (corr) => {
    const abs = Math.abs(corr)
    if (abs > 0.7) return '强相关'
    if (abs > 0.5) return '较强相关'
    if (abs > 0.3) return '中等相关'
    if (abs > 0.1) return '弱相关'
    return '极弱相关'
  }

  if (dataWithReturn.length === 0) {
    return (
      <div className="return-analysis">
        <div className="analysis-header">
          <Activity size={24} />
          <h2>收益率统计分析</h2>
        </div>
        <div className="empty-message">
          <p>暂无收益率数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="return-analysis">
      <div className="analysis-header">
        <Activity size={24} />
        <div>
          <h2>收益率统计分析</h2>
          <p className="header-subtitle">基于 {dataWithReturn.length} 条有效数据的深度分析</p>
        </div>
      </div>

      {/* 整体概览 */}
      <section className="analysis-section">
        <h3 className="section-title">
          <BarChart3 size={18} />
          整体概览
        </h3>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-label">样本数量</div>
            <div className="overview-value">{overallStats.total}</div>
          </div>
          <div className="overview-card">
            <div className="overview-label">平均收益率</div>
            <div className={`overview-value ${overallStats.avgReturn >= 0 ? 'positive' : 'negative'}`}>
              {overallStats.avgReturn >= 0 ? '+' : ''}{overallStats.avgReturn.toFixed(2)}%
            </div>
          </div>
          <div className="overview-card positive">
            <div className="overview-label">
              <TrendingUp size={16} />
              正收益
            </div>
            <div className="overview-value">{overallStats.positive}</div>
            <div className="overview-sublabel">{(overallStats.positive / overallStats.total * 100).toFixed(1)}%</div>
          </div>
          <div className="overview-card negative">
            <div className="overview-label">
              <TrendingDown size={16} />
              负收益
            </div>
            <div className="overview-value">{overallStats.negative}</div>
            <div className="overview-sublabel">{(overallStats.negative / overallStats.total * 100).toFixed(1)}%</div>
          </div>
        </div>
      </section>

      {/* 相关性分析 */}
      <section className="analysis-section">
        <h3 className="section-title">
          <Activity size={18} />
          相关性分析
        </h3>
        <div className="correlation-grid">
          <div className={`correlation-card ${Math.abs(pearson) > 0.3 ? 'strong' : ''}`}>
            <div className="correlation-header">
              <span className="correlation-name">Pearson 相关系数</span>
              <span className="correlation-badge">{getCorrelationStrength(pearson)}</span>
            </div>
            <div className="correlation-value">{pearson.toFixed(4)}</div>
            <div className="correlation-desc">线性相关性，衡量评分与收益的线性关系</div>
          </div>
          <div className={`correlation-card ${Math.abs(spearman) > 0.3 ? 'strong' : ''}`}>
            <div className="correlation-header">
              <span className="correlation-name">Spearman 相关系数</span>
              <span className="correlation-badge">{getCorrelationStrength(spearman)}</span>
            </div>
            <div className="correlation-value">{spearman.toFixed(4)}</div>
            <div className="correlation-desc">秩相关性，衡量评分排名与收益排名的关系</div>
          </div>
        </div>
      </section>

      {/* 分档统计 */}
      <section className="analysis-section">
        <h3 className="section-title">
          <BarChart3 size={18} />
          评分分档统计
        </h3>
        <div className="segments-table">
          <div className="table-header">
            <div className="col-label">评分区间</div>
            <div className="col-count">样本数</div>
            <div className="col-return">平均收益</div>
            <div className="col-range">收益区间</div>
            <div className="col-positive">正收益率</div>
            <div className="col-chart">正负分布</div>
          </div>
          {segments.map((seg, idx) => (
            <div key={idx} className="table-row">
              <div className="col-label">
                <span className="segment-label">{seg.label}</span>
              </div>
              <div className="col-count">{seg.count}</div>
              <div className="col-return">
                <span className={seg.avgReturn >= 0 ? 'positive' : 'negative'}>
                  {seg.avgReturn >= 0 ? '+' : ''}{seg.avgReturn.toFixed(2)}%
                </span>
              </div>
              <div className="col-range">
                <span className="range-text">
                  {seg.minReturn.toFixed(2)}% ~ {seg.maxReturn.toFixed(2)}%
                </span>
              </div>
              <div className="col-positive">
                <span className="positive-rate">{seg.positiveRate.toFixed(1)}%</span>
                <span className="positive-count">({seg.positive}/{seg.count})</span>
              </div>
              <div className="col-chart">
                <div className="mini-chart">
                  <div 
                    className="chart-bar positive" 
                    style={{ width: `${seg.positiveRate}%` }}
                    title={`正收益: ${seg.positive}`}
                  />
                  <div 
                    className="chart-bar negative" 
                    style={{ width: `${100 - seg.positiveRate}%` }}
                    title={`负收益: ${seg.negative}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 行业统计分析 */}
      <section className="analysis-section">
        <h3 className="section-title">
          <BarChart3 size={18} />
          行业统计分析
        </h3>
        <div className="segments-table">
          <div className="table-header">
            <div className="col-label">所属行业</div>
            <div className="col-count">样本数</div>
            <div className="col-return">平均收益</div>
            <div className="col-pearson">相关性(r)</div>
            <div className="col-positive">正收益率</div>
            <div className="col-chart">正负分布</div>
          </div>
          {industryStats.map((ind, idx) => (
            <div key={idx} className="table-row">
              <div className="col-label">
                <span className="segment-label">{ind.label}</span>
              </div>
              <div className="col-count">{ind.count}</div>
              <div className="col-return">
                <span className={ind.avgReturn >= 0 ? 'positive' : 'negative'}>
                  {ind.avgReturn >= 0 ? '+' : ''}{ind.avgReturn.toFixed(2)}%
                </span>
              </div>
              <div className="col-pearson">
                <span className={`pearson-val ${Math.abs(ind.pearson) > 0.3 ? 'strong' : ''}`}>
                  {ind.count >= 3 ? ind.pearson.toFixed(2) : '-'}
                </span>
              </div>
              <div className="col-positive">
                <span className="positive-rate">{ind.positiveRate.toFixed(1)}%</span>
                <span className="positive-count">({ind.positive}/{ind.count})</span>
              </div>
              <div className="col-chart">
                <div className="mini-chart">
                  <div 
                    className="chart-bar positive" 
                    style={{ width: `${ind.positiveRate}%` }}
                    title={`正收益: ${ind.positive}`}
                  />
                  <div 
                    className="chart-bar negative" 
                    style={{ width: `${100 - ind.positiveRate}%` }}
                    title={`负收益: ${ind.negative}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 自定义区间 */}
      <section className="analysis-section">
        <h3 className="section-title">
          <Settings size={18} />
          自定义区间分析
        </h3>
        <div className="custom-controls">
          <div className="input-group">
            <label>最低分</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={customMin}
              onChange={(e) => setCustomMin(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>最高分</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={customMax}
              onChange={(e) => setCustomMax(Number(e.target.value))}
            />
          </div>
          <button 
            className="analyze-btn"
            onClick={() => setShowCustom(true)}
          >
            分析
          </button>
        </div>

        {showCustom && customSegment && (
          <div className="custom-result">
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">样本数</span>
                <span className="result-value">{customSegment.count}</span>
              </div>
              <div className="result-item">
                <span className="result-label">平均收益</span>
                <span className={`result-value ${customSegment.avgReturn >= 0 ? 'positive' : 'negative'}`}>
                  {customSegment.avgReturn >= 0 ? '+' : ''}{customSegment.avgReturn.toFixed(2)}%
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">收益区间</span>
                <span className="result-value range">
                  {customSegment.minReturn.toFixed(2)}% ~ {customSegment.maxReturn.toFixed(2)}%
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">正收益率</span>
                <span className="result-value">
                  {customSegment.positiveRate.toFixed(1)}% ({customSegment.positive}/{customSegment.count})
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default ReturnAnalysis

