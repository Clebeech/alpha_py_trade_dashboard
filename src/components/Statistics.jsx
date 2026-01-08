import { TrendingUp, BarChart3, Target, AlertCircle, TrendingDown, Activity } from 'lucide-react'
import './Statistics.css'

function Statistics({ data }) {
  if (!data || data.length === 0) return null

  // 计算收益率统计
  const dataWithReturn = data.filter(item => item.return !== undefined && item.return !== null && !isNaN(item.return))
  const returns = dataWithReturn.map(item => parseFloat(item.return))
  const scores = dataWithReturn.map(item => item.final_score_penalized)
  
  // 计算相关系数
  const calculateCorrelation = (x, y) => {
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
  
  const correlation = calculateCorrelation(scores, returns)
  
  const stats = {
    total: data.length,
    avgScore: data.reduce((sum, item) => sum + item.final_score_penalized, 0) / data.length,
    maxScore: Math.max(...data.map(item => item.final_score_penalized)),
    minScore: Math.min(...data.map(item => item.final_score_penalized)),
    highScore: data.filter(item => item.final_score_penalized >= 80).length,
    mediumScore: data.filter(item => item.final_score_penalized >= 70 && item.final_score_penalized < 80).length,
    lowScore: data.filter(item => item.final_score_penalized < 70).length,
    returnCount: dataWithReturn.length,
    avgReturn: returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0,
    maxReturn: returns.length > 0 ? Math.max(...returns) : 0,
    minReturn: returns.length > 0 ? Math.min(...returns) : 0,
    correlation: correlation,
  }

  return (
    <div className="statistics">
      <div className="stat-card main">
        <div className="stat-icon"><BarChart3 size={24} /></div>
        <div className="stat-info">
          <div className="stat-label">总有效记录数</div>
          <div className="stat-value">{stats.total}</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon"><TrendingUp size={24} /></div>
        <div className="stat-info">
          <div className="stat-label">平均得分</div>
          <div className="stat-value">{stats.avgScore.toFixed(2)}</div>
        </div>
      </div>
      <div className="stat-card high">
        <div className="stat-icon"><Target size={24} /></div>
        <div className="stat-info">
          <div className="stat-label">高分 (≥80)</div>
          <div className="stat-value">{stats.highScore}</div>
        </div>
      </div>
      <div className="stat-card medium">
        <div className="stat-icon"><Target size={24} /></div>
        <div className="stat-info">
          <div className="stat-label">中分 (70-80)</div>
          <div className="stat-value">{stats.mediumScore}</div>
        </div>
      </div>
      <div className="stat-card low">
        <div className="stat-icon"><AlertCircle size={24} /></div>
        <div className="stat-info">
          <div className="stat-label">低分 (&lt;70)</div>
          <div className="stat-value">{stats.lowScore}</div>
        </div>
      </div>
      {stats.returnCount > 0 && (
        <>
          <div className={`stat-card ${stats.avgReturn >= 0 ? 'return-red' : 'return-green'}`}>
            <div className="stat-icon">
              {stats.avgReturn >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div className="stat-info">
              <div className="stat-label">平均收益率</div>
              <div className="stat-value">{stats.avgReturn.toFixed(2)}%</div>
              <div className="stat-sublabel">{stats.returnCount} 条数据</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Activity size={24} /></div>
            <div className="stat-info">
              <div className="stat-label">收益率区间</div>
              <div className="stat-value stat-range">
                {stats.minReturn.toFixed(2)}% ~ {stats.maxReturn.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className={`stat-card correlation ${Math.abs(stats.correlation) > 0.3 ? 'strong' : ''}`}>
            <div className="stat-icon"><Activity size={24} /></div>
            <div className="stat-info">
              <div className="stat-label">评分-收益相关性</div>
              <div className="stat-value">{stats.correlation.toFixed(3)}</div>
              <div className="stat-sublabel">
                {Math.abs(stats.correlation) > 0.5 ? '强相关' : Math.abs(stats.correlation) > 0.3 ? '中等相关' : '弱相关'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Statistics

