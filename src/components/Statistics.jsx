import { TrendingUp, BarChart3, Target, AlertCircle } from 'lucide-react'
import './Statistics.css'

function Statistics({ data }) {
  if (!data || data.length === 0) return null

  const stats = {
    total: data.length,
    avgScore: data.reduce((sum, item) => sum + item.final_score_penalized, 0) / data.length,
    maxScore: Math.max(...data.map(item => item.final_score_penalized)),
    minScore: Math.min(...data.map(item => item.final_score_penalized)),
    highScore: data.filter(item => item.final_score_penalized >= 80).length,
    mediumScore: data.filter(item => item.final_score_penalized >= 70 && item.final_score_penalized < 80).length,
    lowScore: data.filter(item => item.final_score_penalized < 70).length,
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
    </div>
  )
}

export default Statistics

