import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Clock, TrendingUp, BarChart3, Activity } from 'lucide-react'
import './TimeSeriesAnalysis.css'

function TimeSeriesAnalysis() {
  const [industryData, setIndustryData] = useState([])
  const [segmentData, setSegmentData] = useState([])
  const [stockPrices, setStockPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indRes, segRes, stockRes] = await Promise.all([
          fetch('/data/industry_timeseries.json'),
          fetch('/data/segment_timeseries.json'),
          fetch('/data/high_score_stocks_prices.json')
        ])
        
        const indJson = await indRes.json()
        const segJson = await segRes.json()
        const stockJson = await stockRes.json()
        
        setIndustryData(indJson)
        setSegmentData(segJson)
        setStockPrices(stockJson)
      } catch (error) {
        console.error('加载时序数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 处理行业时序数据供 Recharts 使用
  const processedIndustryData = useMemo(() => {
    const dates = [...new Set(industryData.map(item => item.date))].sort()
    return dates.map(date => {
      const row = { date }
      industryData.filter(item => item.date === date).forEach(item => {
        row[item.industry] = item.return
      })
      return row
    })
  }, [industryData])

  // 处理分段时序数据
  const processedSegmentData = useMemo(() => {
    const dates = [...new Set(segmentData.map(item => item.date))].sort()
    return dates.map(date => {
      const row = { date }
      segmentData.filter(item => item.date === date).forEach(item => {
        row[item.segment] = item.return
      })
      return row
    })
  }, [segmentData])

  // 获取排名前几的行业用于展示（避免图表太乱）
  const topIndustries = useMemo(() => {
    const counts = {}
    industryData.forEach(item => {
      counts[item.industry] = (counts[item.industry] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(item => item[0])
  }, [industryData])

  const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316']

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>正在加载时序分析数据...</p>
      </div>
    )
  }

  return (
    <div className="timeseries-analysis">
      <div className="ts-header">
        <Clock size={24} color="var(--primary)" />
        <h2>时序分析报告</h2>
      </div>

      <div className="ts-grid">
        {/* 1. 行业收益率时序 */}
        <section className="ts-section">
          <h3>
            <TrendingUp size={18} />
            主要行业收益率趋势 (按文件日期)
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedIndustryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val.substring(4)} 
                  style={{ fontSize: '12px' }}
                />
                <YAxis unit="%" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                {topIndustries.map((ind, idx) => (
                  <Line 
                    key={ind} 
                    type="monotone" 
                    dataKey={ind} 
                    stroke={colors[idx % colors.length]} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 2. 分段收益率时序 */}
        <section className="ts-section">
          <h3>
            <BarChart3 size={18} />
            不同评分分段收益率表现
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedSegmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val.substring(4)} 
                  style={{ fontSize: '12px' }}
                />
                <YAxis unit="%" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="High (>=80)" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Mid (70-80)" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="Low (<70)" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. 80分以上个股追踪 */}
        <section className="ts-section">
          <h3>
            <Activity size={18} />
            高分个股 (≥80分) 价格走势跟踪
          </h3>
          <div className="stock-tracking-list">
            {Object.entries(stockPrices).map(([code, data]) => {
              // 归一化价格以便比较（以首次得分为基准100）
              const firstHitIdx = data.history.findIndex(h => h.trade_date >= data.first_hit_date)
              const basePrice = firstHitIdx !== -1 ? data.history[firstHitIdx].close : data.history[0].close
              
              const normalizedHistory = data.history.map(h => ({
                ...h,
                normalized: (h.close / basePrice * 100).toFixed(2),
                date: h.trade_date
              }))

              return (
                <div key={code} className="stock-track-card">
                  <div className="stock-track-header">
                    <div className="stock-name-code">
                      <h4>{data.name}</h4>
                      <span>{code}</span>
                    </div>
                    <div className="first-hit-badge">首次触达: {data.first_hit_date}</div>
                  </div>
                  <div className="chart-container" style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={normalizedHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(val) => val.substring(4)}
                          style={{ fontSize: '10px' }}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip />
                        <ReferenceLine x={data.first_hit_date} stroke="#ef4444" label={{ position: 'top', value: '得分≥80', fill: '#ef4444', fontSize: 10 }} />
                        <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" />
                        <Line 
                          type="monotone" 
                          dataKey="normalized" 
                          stroke="var(--primary)" 
                          strokeWidth={2} 
                          dot={false}
                          name="归一化价格"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default TimeSeriesAnalysis

