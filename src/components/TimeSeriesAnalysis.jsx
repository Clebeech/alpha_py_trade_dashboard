import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area, BarChart, Bar } from 'recharts'
import { Clock, TrendingUp, BarChart3, Activity, ChevronRight, PieChart, Landmark, Info } from 'lucide-react'
import './TimeSeriesAnalysis.css'

function TimeSeriesAnalysis({ currentDayData = [], selectedDate = '' }) {
  const [industryData, setIndustryData] = useState([])
  const [segmentData, setSegmentData] = useState([])
  const [stockPrices, setStockPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState(null)

  // 建立所选日期的个股收益率映射（从行情历史中提取，确保追踪池全覆盖）
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
    
    // 计算归一化历史和收益率历史
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
              高分个股 (≥80分) 价格走势跟踪
            </h3>
            <span className="hint-text">点击左侧列表查看个股详情与行情数据</span>
          </div>
          
          <div className="stock-tracking-layout">
            <div className="stock-selector-list">
              {Object.entries(stockPrices).map(([code, data]) => {
                const dailyReturn = currentReturnsMap[code]
                const returnClass = dailyReturn > 0 ? 'pos-return' : dailyReturn < 0 ? 'neg-return' : ''
                
                return (
                  <div 
                    key={code} 
                    className={`stock-mini-card ${selectedStock === code ? 'active' : ''} ${returnClass}`}
                    onClick={() => setSelectedStock(code)}
                  >
                    <div className="mini-card-info">
                      <div className="mini-card-name">{data.name}</div>
                      <div className="mini-card-code">
                        {code}
                        {dailyReturn !== undefined && (
                          <span className={`mini-return-tag ${dailyReturn >= 0 ? 'pos' : 'neg'}`}>
                            {dailyReturn > 0 ? '+' : ''}{dailyReturn.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="mini-card-arrow" />
                  </div>
                )
              })}
            </div>

            <div className="stock-detail-viewer">
              {selectedStockData ? (
                <>
                  <div className="detail-viewer-header">
                    <div className="header-main-info">
                      <h4>{selectedStockData.name} <span className="code-text">{selectedStock}</span></h4>
                      <div className="industry-tag">{selectedStockData.industry}</div>
                    </div>
                    <div className="hit-info">
                      首次得高分日期: <strong>{selectedStockData.first_hit_date}</strong>
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

                  <div className="detail-chart-container">
                    <div className="chart-wrapper">
                      <div className="chart-title">价格走势 (以得分日价格为100)</div>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={selectedStockData.history}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                          <XAxis 
                            dataKey="displayDate" 
                            style={{ fontSize: '11px' }}
                          />
                          <YAxis 
                            domain={['auto', 'auto']} 
                            style={{ fontSize: '11px' }}
                            tickFormatter={(val) => `${val}`}
                          />
                          <Tooltip />
                          <ReferenceLine x={selectedStockData.first_hit_date.substring(4)} stroke="#ef4444" strokeWidth={2} label={{ position: 'top', value: '得分≥80', fill: '#ef4444', fontSize: 11 }} />
                          <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" />
                          <Area 
                            type="monotone" 
                            dataKey="normalized" 
                            stroke="#6366f1" 
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            name="归一化价格"
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-wrapper">
                      <div className="chart-title">成交量变化</div>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={selectedStockData.history}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                          <XAxis 
                            dataKey="displayDate" 
                            style={{ fontSize: '11px' }}
                          />
                          <YAxis hide />
                          <Tooltip />
                          <Bar dataKey="vol" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-viewer">
                  <Activity size={48} opacity={0.1} />
                  <p>请选择股票查看走势</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TimeSeriesAnalysis
