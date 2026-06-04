import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../utils/api'
import {
  Package, Users, ShoppingCart, DollarSign,
  AlertTriangle, ArrowRight, TrendingDown
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card h-28 bg-ink-700" />
        ))}
      </div>
    )
  }

  if (!stats) return <p className="text-ink-400">Failed to load dashboard.</p>

  const statCards = [
    { label: 'Total Products', value: stats.total_products, icon: Package, color: 'text-jade', bg: 'bg-jade/10' },
    { label: 'Total Customers', value: stats.total_customers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    {
      label: 'Total Revenue',
      value: `$${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign, color: 'text-amber', bg: 'bg-amber/10'
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-white">{value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low stock alert */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-amber" />
              <h2 className="font-display font-semibold text-white text-sm">Low Stock Alert</h2>
            </div>
            <Link to="/products" className="text-xs text-jade hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {stats.low_stock_products.length === 0 ? (
            <p className="text-sm text-ink-400 py-4 text-center">All products are well-stocked ✓</p>
          ) : (
            <div className="space-y-2">
              {stats.low_stock_products.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-ink-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink-100">{p.name}</p>
                    <p className="text-xs text-ink-400 font-mono">{p.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.quantity === 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                        Out of stock
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20 font-medium">
                        {p.quantity} left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-jade" />
              <h2 className="font-display font-semibold text-white text-sm">Recent Orders</h2>
            </div>
            <Link to="/orders" className="text-xs text-jade hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {stats.recent_orders.length === 0 ? (
            <p className="text-sm text-ink-400 py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recent_orders.map(o => (
                <Link
                  key={o.id}
                  to={`/orders/${o.id}`}
                  className="flex items-center justify-between py-2 border-b border-ink-700 last:border-0 hover:opacity-80 transition-opacity"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-100">
                      #{o.id.toString().padStart(4, '0')} · {o.customer?.full_name}
                    </p>
                    <p className="text-xs text-ink-400">
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-jade">${o.total_amount.toFixed(2)}</p>
                    <span className={`badge-${o.status}`}>{o.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
