import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area, BarChart, Bar } from 'recharts'
import { Clock, TrendingUp, BarChart3, Activity, ChevronRight, PieChart, Landmark, Info, X, Calendar } from 'lucide-react'
import './TimeSeriesAnalysis.css'

function TimeSeriesAnalysis({ currentDayData = [], selectedDate = '' }) {
  const [industryData, setIndustryData] = useState([])
  const [segmentData, setSegmentData] = useState([])
  const [stockPrices, setStockPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // 建立所选日期的个股收益率映射
  const currentReturnsMap = useMemo(() => {
    const map = {}
    if (!selectedDate) return map
    
    Object.entries(stockPrices).forEach(([code, data]) => {
      const dayData = data.history.find(h => h.trade_date === selectedDate)
      if (dayData && dayData.pct_chg !== undefined) {
        map[code] = parseFloat(dayData.pct_chg)
      }
    })
    return map
  }, [stockPrices, selectedDate])

  // 按首次达标日期分组
  const groupedStocks = useMemo(() => {
    const groups = {}
    Object.entries(stockPrices).forEach(([code, data]) => {
      const date = data.first_hit_date
      if (!groups[date]) groups[date] = []
      groups[date].push({ code, ...data })
    })
    // 按日期排序
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }, [stockPrices])

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
        
        // 默认选中第一只股票
        const codes = Object.keys(stockJson)
        if (codes.length > 0) {
          setSelectedStock(codes[0])
        }
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

  // 获取排名前几的行业用于展示
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

  const selectedStockData = useMemo(() => {
    if (!selectedStock || !stockPrices[selectedStock]) return null
    const data = stockPrices[selectedStock]
    
    const firstHitIdx = data.history.findIndex(h => h.trade_date >= data.first_hit_date)
    const basePrice = firstHitIdx !== -1 ? data.history[firstHitIdx].close : data.history[0].close
    
    const history = data.history.map(h => ({
      ...h,
      normalized: parseFloat((h.close / basePrice * 100).toFixed(2)),
      date: h.trade_date,
      displayDate: h.trade_date.substring(4)
    }))
    
    return { ...data, history }
  }, [selectedStock, stockPrices])

  const handleSelectStock = (code) => {
    setSelectedStock(code)
    setShowModal(true)
  }

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

        {/* 3. 高分个股追踪 */}
        <section className="ts-section full-width">
          <div className="section-header-row">
            <h3>
              <Activity size={18} />
              高分个股 (≥80分) 追踪池
            </h3>
            <span className="hint-text">按首次入选日期排列，向右滑动查看历史记录，点击卡片查看详情</span>
          </div>
          
          <div className="kanban-container">
            {groupedStocks.map(([date, stocks]) => (
              <div key={date} className="kanban-column">
                <div className="kanban-date-header">
                  <Calendar size={14} />
                  <span>{date}</span>
                  <span className="count-badge">{stocks.length}</span>
                </div>
                <div className="kanban-cards">
                  {stocks.map(stock => {
                    // 获取首次入选当天的收益率
                    const hitDayData = stock.history.find(h => h.trade_date === stock.first_hit_date)
                    const hitDayReturn = hitDayData ? parseFloat(hitDayData.pct_chg) : undefined
                    const returnClass = hitDayReturn > 0 ? 'pos-return' : hitDayReturn < 0 ? 'neg-return' : ''
                    
                    return (
                      <div 
                        key={stock.code} 
                        className={`kanban-card ${returnClass} ${selectedStock === stock.code ? 'active' : ''}`}
                        onClick={() => handleSelectStock(stock.code)}
                      >
                        <div className="kanban-card-top">
                          <span className="stock-name">{stock.name}</span>
                          {hitDayReturn !== undefined && (
                            <span className={`return-tag ${hitDayReturn >= 0 ? 'pos' : 'neg'}`}>
                              {hitDayReturn > 0 ? '+' : ''}{hitDayReturn.toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <div className="stock-code">{stock.code}</div>
                        <div className="stock-industry">{stock.industry}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 详情模态框 */}
      {showModal && selectedStockData && (
        <div className="ts-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ts-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={24} />
            </button>
            
            <div className="modal-header">
              <div className="modal-title">
                <h2>{selectedStockData.name} <span className="modal-code">{selectedStock}</span></h2>
                <div className="modal-meta">
                  <span className="industry-tag">{selectedStockData.industry}</span>
                  <span className="hit-badge">首次触达: {selectedStockData.first_hit_date}</span>
                </div>
              </div>
              
              <div className="market-metrics-grid">
                <div className="metric-box">
                  <div className="metric-label">当前PE</div>
                  <div className="metric-value">{selectedStockData.history.slice(-1)[0]?.pe?.toFixed(2) || '-'}</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">当前PB</div>
                  <div className="metric-value">{selectedStockData.history.slice(-1)[0]?.pb?.toFixed(2) || '-'}</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">总市值</div>
                  <div className="metric-value">{(selectedStockData.history.slice(-1)[0]?.total_mv / 10000).toFixed(2)}亿</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">成交额</div>
                  <div className="metric-value">{(selectedStockData.history.slice(-1)[0]?.amount / 100).toFixed(0)}万</div>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="chart-wrapper main-chart">
                <div className="chart-title">价格走势 (以得分日价格为100)</div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={selectedStockData.history}>
                    <defs>
                      <linearGradient id="modalColorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="displayDate" style={{ fontSize: '11px' }} />
                    <YAxis domain={['auto', 'auto']} style={{ fontSize: '11px' }} />
                    <Tooltip />
                    <ReferenceLine x={selectedStockData.first_hit_date.substring(4)} stroke="#ef4444" strokeWidth={2} label={{ position: 'top', value: '得分≥80', fill: '#ef4444', fontSize: 11 }} />
                    <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="normalized" stroke="#6366f1" fillOpacity={1} fill="url(#modalColorPrice)" name="归一化价格" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-wrapper vol-chart">
                <div className="chart-title">成交量变化</div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={selectedStockData.history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="displayDate" style={{ fontSize: '11px' }} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="vol" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeSeriesAnalysis
