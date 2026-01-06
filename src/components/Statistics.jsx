import './Statistics.css'

function Statistics({ data }) {
  if (!data || data.length === 0) return null

  const stats = {
    total: data.length,
    avgScore: data.reduce((sum, item) => sum + item.final_score_penalized, 0) / data.length,
    maxScore: Math.max(...data.map(item => item.final_score_penalized)),
    minScore: Math.min(...data.map(item => item.final_score_penalized)),
    highScore: data.filter(item => item.final_score_penalized >= 7).length,
    mediumScore: data.filter(item => item.final_score_penalized >= 4 && item.final_score_penalized < 7).length,
    lowScore: data.filter(item => item.final_score_penalized < 4).length,
  }

  return (
    <div className="statistics">
      <div className="stat-card">
        <div className="stat-label">总记录数</div>
        <div className="stat-value">{stats.total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">平均得分</div>
        <div className="stat-value">{stats.avgScore.toFixed(2)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">最高得分</div>
        <div className="stat-value">{stats.maxScore.toFixed(2)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">最低得分</div>
        <div className="stat-value">{stats.minScore.toFixed(2)}</div>
      </div>
      <div className="stat-card high">
        <div className="stat-label">高分 (≥7)</div>
        <div className="stat-value">{stats.highScore}</div>
      </div>
      <div className="stat-card medium">
        <div className="stat-label">中分 (4-7)</div>
        <div className="stat-value">{stats.mediumScore}</div>
      </div>
      <div className="stat-card low">
        <div className="stat-label">低分 (&lt;4)</div>
        <div className="stat-value">{stats.lowScore}</div>
      </div>
    </div>
  )
}

export default Statistics

