import { useState, useMemo } from 'react'
import {
  BarChart2, PieChart, TrendingUp, TrendingDown,
  Calendar, Filter,
} from 'lucide-react'
import type { DashboardData } from '@/hooks/useDashboard'
import { formatPrice } from '@/lib/utils'

type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'horizontal'
type RangeType = '7d' | '30d' | '90d' | 'all'
type MetricType = 'revenue' | 'orders' | 'items'

interface Props { data: DashboardData }

// ─── Mini SVG Charts ──────────────────────────────────────────

function BarChartSVG({ bars, color = '#c9a96e' }: { bars: { label: string; value: number; sub?: string }[]; color?: string }) {
  const max = Math.max(...bars.map(b => b.value), 1)
  const W = 100, H = 70, pad = 4, bw = (W - pad * 2) / bars.length - 2

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-full">
      {bars.map((b, i) => {
        const bh  = Math.max((b.value / max) * H, b.value > 0 ? 2 : 0)
        const x   = pad + i * ((W - pad * 2) / bars.length) + 1
        const y   = H - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="1.5"
              fill={color} opacity={b.value === 0 ? 0.15 : 0.85} />
            <text x={x + bw / 2} y={H + 8} textAnchor="middle"
              fontSize="4" fill="#6b5a3a">{b.label}</text>
            {b.value > 0 && (
              <text x={x + bw / 2} y={y - 2} textAnchor="middle"
                fontSize="4" fill={color}>{b.sub ?? b.value}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function LineChartSVG({ points, color = '#c9a96e' }: { points: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...points.map(p => p.value), 1)
  const W = 100, H = 70, pad = 6

  const coords = points.map((p, i) => ({
    x: pad + (i / Math.max(points.length - 1, 1)) * (W - pad * 2),
    y: H - (p.value / max) * H + 4,
    ...p,
  }))

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaD = coords.length > 1
    ? `${pathD} L ${coords[coords.length-1].x} ${H + 4} L ${coords[0].x} ${H + 4} Z`
    : ''

  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full h-full">
      {areaD && <path d={areaD} fill={color} opacity="0.08" />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="2" fill={color} />
          <text x={c.x} y={H + 13} textAnchor="middle" fontSize="4" fill="#6b5a3a">{c.label}</text>
        </g>
      ))}
    </svg>
  )
}

function PieChartSVG({ slices, donut = false }: {
  slices: { label: string; value: number; color: string }[]; donut?: boolean
}) {
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1
  const cx = 50, cy = 50, r = 40, inner = donut ? 22 : 0
  let angle = -Math.PI / 2

  const arcs = slices.map(sl => {
    const sweep = (sl.value / total) * Math.PI * 2
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const lf = sweep > Math.PI ? 1 : 0
    const xi1 = cx + inner * Math.cos(angle - sweep)
    const yi1 = cy + inner * Math.sin(angle - sweep)
    const xi2 = cx + inner * Math.cos(angle)
    const yi2 = cy + inner * Math.sin(angle)
    const path = donut
      ? `M ${x1} ${y1} A ${r} ${r} 0 ${lf} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${lf} 0 ${xi1} ${yi1} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${lf} 1 ${x2} ${y2} Z`
    return { ...sl, path, pct: ((sl.value / total) * 100).toFixed(1) }
  })

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} opacity="0.9" />)}
      {donut && <text x={cx} y={cy + 3} textAnchor="middle" fontSize="8" fill="#c9a96e" fontWeight="bold">{slices.length}</text>}
    </svg>
  )
}

function HBarChartSVG({ bars, color = '#c9a96e' }: { bars: { label: string; value: number; sub?: string }[] }) {
  const max = Math.max(...bars.map(b => b.value), 1)
  const rowH = 14, W = 100, labelW = 30, barAreaW = W - labelW - 14

  return (
    <svg viewBox={`0 0 ${W} ${bars.length * rowH + 4}`} className="w-full h-full">
      {bars.map((b, i) => {
        const bw = (b.value / max) * barAreaW
        const y  = i * rowH + 2
        return (
          <g key={i}>
            <text x={labelW - 2} y={y + 9} textAnchor="end" fontSize="4.5" fill="#8a7055"
              className="truncate">{b.label.slice(0, 14)}{b.label.length > 14 ? '…' : ''}</text>
            <rect x={labelW} y={y + 2} width={Math.max(bw, 1)} height={8} rx="2"
              fill={color} opacity={b.value === 0 ? 0.15 : 0.8} />
            {b.value > 0 && (
              <text x={labelW + bw + 2} y={y + 9} fontSize="4.5" fill={color}>
                {b.sub ?? b.value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Colour palette ───────────────────────────────────────────
const PALETTE = ['#c9a96e','#e8c87a','#a07840','#f0d090','#7a5c30','#d4b878','#b89050','#e0c060']

// ─── Main ─────────────────────────────────────────────────────
export function SalesAnalytics({ data }: Props) {
  const [range,   setRange]   = useState<RangeType>('7d')
  const [chart1,  setChart1]  = useState<ChartType>('bar')
  const [chart2,  setChart2]  = useState<ChartType>('horizontal')
  const [chart3,  setChart3]  = useState<ChartType>('donut')
  const [metric,  setMetric]  = useState<MetricType>('revenue')

  const { orders } = data

  // ── Filter orders by range ────────────────────────────────
  const filteredOrders = useMemo(() => {
    const now  = Date.now()
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : Infinity
    return orders.filter(o => (now - new Date(o.created_at).getTime()) / 86400000 <= days)
  }, [orders, range])

  // ── Daily series ──────────────────────────────────────────
  const dailySeries = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 14 : 14
    const map: Record<string, { revenue: number; orders: number; items: number }> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      map[key] = { revenue: 0, orders: 0, items: 0 }
    }
    filteredOrders.forEach(o => {
      const key = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (map[key]) {
        map[key].revenue += Number(o.total)
        map[key].orders  += 1
        map[key].items   += o.items.reduce((s, i) => s + i.quantity, 0)
      }
    })
    return Object.entries(map).map(([date, v]) => ({ label: date.split(' ')[1] ?? date, ...v }))
  }, [filteredOrders, range])

  // ── Item sales in range ───────────────────────────────────
  const rangeItemSales = useMemo(() => {
    const map: Record<string, { qty: number; revenue: number }> = {}
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        if (!map[item.name]) map[item.name] = { qty: 0, revenue: 0 }
        map[item.name].qty     += item.quantity
        map[item.name].revenue += item.price * item.quantity
      })
    })
    return Object.entries(map).map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue).slice(0, 8)
  }, [filteredOrders])

  // ── Category breakdown ────────────────────────────────────
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        // try to get category from item name heuristic
        map[item.name] = (map[item.name] ?? 0) + item.quantity
      })
    })
    return Object.entries(map).slice(0, 6).map(([name, qty], i) => ({
      label: name.slice(0, 12), value: qty, color: PALETTE[i % PALETTE.length],
    }))
  }, [filteredOrders])

  // ── KPIs ──────────────────────────────────────────────────
  const totalRev  = filteredOrders.reduce((s, o) => s + Number(o.total), 0)
  const totalOrd  = filteredOrders.length
  const totalItems = filteredOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0)
  const avgOrder  = totalOrd ? totalRev / totalOrd : 0

  // Compare with previous period
  const prevOrders = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : Infinity
    return orders.filter(o => {
      const age = (Date.now() - new Date(o.created_at).getTime()) / 86400000
      return age > days && age <= days * 2
    })
  }, [orders, range])
  const prevRev = prevOrders.reduce((s, o) => s + Number(o.total), 0)
  const revDiff = prevRev ? ((totalRev - prevRev) / prevRev) * 100 : null

  // ── Chart series for metric ───────────────────────────────
  const series = dailySeries.map(d => ({
    label: d.label,
    value: metric === 'revenue' ? d.revenue : metric === 'orders' ? d.orders : d.items,
    sub: metric === 'revenue' ? (d.revenue > 0 ? formatPrice(d.revenue).replace('৳','').slice(0,5) : '') : String(metric === 'orders' ? d.orders : d.items),
  }))

  const itemBars = rangeItemSales.map(i => ({
    label: i.name.split(' ')[0],
    value: metric === 'revenue' ? i.revenue : i.qty,
    sub: metric === 'revenue' ? formatPrice(i.revenue).replace('৳','').slice(0,5) : String(i.qty),
  }))

  const RANGE_OPTS: { id: RangeType; label: string }[] = [
    { id: '7d', label: '7 Days' }, { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }, { id: 'all', label: 'All Time' },
  ]
  const METRIC_OPTS: { id: MetricType; label: string }[] = [
    { id: 'revenue', label: 'Revenue' }, { id: 'orders', label: 'Orders' }, { id: 'items', label: 'Items Sold' },
  ]
  const CHART_OPTS: { id: ChartType; label: string }[] = [
    { id: 'bar', label: 'Bar' }, { id: 'line', label: 'Line' },
    { id: 'pie', label: 'Pie' }, { id: 'donut', label: 'Donut' }, { id: 'horizontal', label: 'H-Bar' },
  ]

  const renderChart = (type: ChartType, s: { label: string; value: number; sub?: string }[]) => {
    if (type === 'line')       return <LineChartSVG points={s} />
    if (type === 'pie')        return <PieChartSVG slices={s.slice(0,6).map((x,i) => ({ label: x.label, value: x.value, color: PALETTE[i] }))} />
    if (type === 'donut')      return <PieChartSVG slices={s.slice(0,6).map((x,i) => ({ label: x.label, value: x.value, color: PALETTE[i] }))} donut />
    if (type === 'horizontal') return <HBarChartSVG bars={s} />
    return <BarChartSVG bars={s} />
  }

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-50 border border-brand-900/30 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-brand-600" />
          <span className="text-brand-600 text-xs font-semibold">Range:</span>
          {RANGE_OPTS.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${range === r.id ? 'bg-brand-700/50 text-brand-200 border-brand-700/40' : 'border-brand-900/30 text-brand-700 hover:text-brand-400'}`}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-brand-600" />
          <span className="text-brand-600 text-xs font-semibold">Metric:</span>
          {METRIC_OPTS.map(m => (
            <button key={m.id} onClick={() => setMetric(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${metric === m.id ? 'bg-brand-700/50 text-brand-200 border-brand-700/40' : 'border-brand-900/30 text-brand-700 hover:text-brand-400'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Revenue',    value: formatPrice(totalRev),  diff: revDiff, icon: TrendingUp,  colour: 'text-green-400 bg-green-950/40 border-green-800/30' },
          { label: 'Orders',     value: totalOrd,               diff: null,    icon: BarChart2,   colour: 'text-brand-400 bg-brand-900/40 border-brand-800/30' },
          { label: 'Items Sold', value: totalItems,             diff: null,    icon: PieChart,    colour: 'text-purple-400 bg-purple-950/40 border-purple-800/30' },
          { label: 'Avg Order',  value: formatPrice(avgOrder),  diff: null,    icon: TrendingUp,  colour: 'text-blue-400 bg-blue-950/40 border-blue-800/30' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border p-4 flex items-center gap-3 ${k.colour}`}>
            <k.icon size={18} className="shrink-0" />
            <div className="min-w-0">
              <p className="font-mono font-bold text-brand-100 text-lg leading-tight">{k.value}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-brand-600 text-xs">{k.label}</p>
                {k.diff !== null && (
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${k.diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {k.diff >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {Math.abs(k.diff).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* Chart 1 — Daily trend */}
        <div className="bg-surface-50 border border-brand-900/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-display font-bold text-brand-300 text-sm flex items-center gap-2">
              <BarChart2 size={14} className="text-brand-500" />
              Daily {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
            </h3>
            <div className="flex gap-1">
              {CHART_OPTS.filter(c => c.id !== 'horizontal').map(c => (
                <button key={c.id} onClick={() => setChart1(c.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${chart1 === c.id ? 'bg-brand-700/50 text-brand-200 border-brand-700/40' : 'border-brand-900/30 text-brand-800 hover:text-brand-500'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-36">{renderChart(chart1, series)}</div>
        </div>

        {/* Chart 2 — Item comparison */}
        <div className="bg-surface-50 border border-brand-900/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-display font-bold text-brand-300 text-sm flex items-center gap-2">
              <TrendingUp size={14} className="text-green-400" />
              Top Items by {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </h3>
            <div className="flex gap-1">
              {CHART_OPTS.map(c => (
                <button key={c.id} onClick={() => setChart2(c.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${chart2 === c.id ? 'bg-brand-700/50 text-brand-200 border-brand-700/40' : 'border-brand-900/30 text-brand-800 hover:text-brand-500'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-36">{renderChart(chart2, itemBars)}</div>
        </div>

        {/* Chart 3 — Item share pie */}
        <div className="bg-surface-50 border border-brand-900/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-display font-bold text-brand-300 text-sm flex items-center gap-2">
              <PieChart size={14} className="text-purple-400" />
              Sales Distribution
            </h3>
            <div className="flex gap-1">
              {(['pie','donut','bar'] as ChartType[]).map(c => (
                <button key={c} onClick={() => setChart3(c)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${chart3 === c ? 'bg-brand-700/50 text-brand-200 border-brand-700/40' : 'border-brand-900/30 text-brand-800 hover:text-brand-500'}`}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-32 w-32 shrink-0">{renderChart(chart3, categoryData.map(c => ({ label: c.label, value: c.value, sub: String(c.value) })))}</div>
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-32">
              {categoryData.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-brand-500 text-xs truncate flex-1">{c.label}</span>
                  <span className="text-brand-400 text-xs font-mono">{c.value}</span>
                </div>
              ))}
              {!categoryData.length && <p className="text-brand-800 text-xs">No data</p>}
            </div>
          </div>
        </div>

        {/* Table — detailed breakdown */}
        <div className="bg-surface-50 border border-brand-900/30 rounded-xl p-5">
          <h3 className="font-display font-bold text-brand-300 text-sm mb-4 flex items-center gap-2">
            <Filter size={14} className="text-brand-500" /> Item Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-900/30">
                  <th className="text-left text-brand-600 pb-2 font-medium">#</th>
                  <th className="text-left text-brand-600 pb-2 font-medium">Item</th>
                  <th className="text-right text-brand-600 pb-2 font-medium">Qty</th>
                  <th className="text-right text-brand-600 pb-2 font-medium">Revenue</th>
                  <th className="text-right text-brand-600 pb-2 font-medium">Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/20">
                {rangeItemSales.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-brand-700 py-6">No sales in this period</td></tr>
                ) : rangeItemSales.map((item, i) => (
                  <tr key={item.name}>
                    <td className="py-1.5 text-brand-700">{i < 3 ? ['🥇','🥈','🥉'][i] : i+1}</td>
                    <td className="py-1.5 text-brand-300 max-w-[120px] truncate">{item.name}</td>
                    <td className="py-1.5 text-right font-mono text-brand-400">{item.qty}</td>
                    <td className="py-1.5 text-right font-mono text-green-400">{formatPrice(item.revenue)}</td>
                    <td className="py-1.5 text-right font-mono text-brand-600">{formatPrice(item.revenue / item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}