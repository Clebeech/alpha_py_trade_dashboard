import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area, BarChart, Bar } from 'recharts'
import { Clock, TrendingUp, BarChart3, Activity, ArrowLeft, Info, ExternalLink } from 'lucide-react'
import './TimeSeriesAnalysis.css'

function TimeSeriesAnalysis() {
  const [industryData, setIndustryData] = useState([])
  const [segmentData, setSegmentData] = useState([])
  const [stockPrices, setStockPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState(null)

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

  const formatVolume = (val) => {
    if (val >= 100000000) return (val / 100000000).toFixed(2) + '亿'
    if (val >= 10000) return (val / 10000).toFixed(2) + '万'
    return val
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>正在加载时序分析数据...</p>
      </div>
    )
  }

  // 渲染个股详情视图
  if (selectedStock) {
    const stockData = stockPrices[selectedStock]
    const history = stockData.history.map(h => ({
      ...h,
      date: h.trade_date,
      formattedDate: h.trade_date.substring(4)
    }))

    const latest = history[history.length - 1]

    return (
      <div className="timeseries-analysis">
        <div className="ts-header detail-header">
          <button className="back-btn" onClick={() => setSelectedStock(null)}>
            <ArrowLeft size={20} />
            <span>返回列表</span>
          </button>
          <div className="detail-title">
            <h2>{stockData.name} <span className="code-text">{selectedStock}</span></h2>
            <div className="first-hit-badge">首次触达 (≥80分): {stockData.first_hit_date}</div>
          </div>
        </div>

        {/* 关键数据卡片 */}
        <div className="latest-stats-grid">
          <div className="stat-card">
            <span className="stat-label">最新价</span>
            <span className="stat-value">{latest.close.toFixed(2)}</span>
            <span className={`stat-change ${latest.pct_chg >= 0 ? 'positive' : 'negative'}`}>
              {latest.pct_chg >= 0 ? '+' : ''}{latest.pct_chg.toFixed(2)}%
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">成交额</span>
            <span className="stat-value">{formatVolume(latest.amount * 1000)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">市盈率 (PE)</span>
            <span className="stat-value">{latest.pe?.toFixed(2) || '-'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">市净率 (PB)</span>
            <span className="stat-value">{latest.pb?.toFixed(2) || '-'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">开/高/低</span>
            <span className="stat-value small">
              {latest.open.toFixed(2)} / {latest.high.toFixed(2)} / {latest.low.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="ts-grid detail-grid">
          {/* 价格走势图 */}
          <section className="ts-section price-section">
            <h3 className="section-title">价格走势 (收盘价)</h3>
            <div className="chart-container stock-main-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="formattedDate" style={{ fontSize: '12px' }} />
                  <YAxis domain={['auto', 'auto']} style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <ReferenceLine x={stockData.first_hit_date.substring(4)} stroke="#ef4444" strokeWidth={2} label={{ position: 'top', value: '得分≥80', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="close" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" name="收盘价" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 成交量图 */}
          <section className="ts-section vol-section">
            <h3 className="section-title">成交量与换手率参考</h3>
            <div className="chart-container mini-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="formattedDate" hide />
                  <YAxis tickFormatter={formatVolume} style={{ fontSize: '11px' }} />
                  <Tooltip formatter={(val) => formatVolume(val)} />
                  <Bar dataKey="vol" fill="#cbd5e1" name="成交量" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 财务指标对比 */}
          <section className="ts-section pe-pb-section">
            <h3 className="section-title">估值变化 (PE/PB)</h3>
            <div className="chart-container mini-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="formattedDate" style={{ fontSize: '11px' }} />
                  <YAxis yAxisId="left" style={{ fontSize: '11px' }} name="PE" />
                  <YAxis yAxisId="right" orientation="right" style={{ fontSize: '11px' }} name="PB" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="pe" stroke="#6366f1" strokeWidth={2} dot={false} name="PE" />
                  <Line yAxisId="right" type="monotone" dataKey="pb" stroke="#ec4899" strokeWidth={2} dot={false} name="PB" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
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
            主要行业收益率趋势
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

        {/* 3. 80分以上个股追踪 - 卡片集视图 */}
        <section className="ts-section">
          <div className="section-header-flex">
            <h3>
              <Activity size={18} />
              高分个股 (≥80分) 跟踪池
            </h3>
            <span className="pool-count">已命中 {Object.keys(stockPrices).length} 只个股</span>
          </div>
          <div className="stock-card-grid">
            {Object.entries(stockPrices).map(([code, data]) => (
              <div key={code} className="stock-track-card-compact" onClick={() => setSelectedStock(code)}>
                <div className="card-top">
                  <span className="stock-name">{data.name}</span>
                  <span className="stock-code">{code}</span>
                </div>
                <div className="card-bottom">
                  <span className="hit-date-label">入选日期: {data.first_hit_date}</span>
                  <ExternalLink size={14} className="card-icon" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default TimeSeriesAnalysis

