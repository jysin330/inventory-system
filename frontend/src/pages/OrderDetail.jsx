import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../utils/api'
import { ArrowLeft, Package, User, Calendar, FileText } from 'lucide-react'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id).then(r => setOrder(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center text-ink-400 py-20">Loading…</div>
  if (!order) return <div className="text-center text-red-400 py-20">Order not found.</div>

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100 transition-colors">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="card">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Order #{order.id.toString().padStart(4, '0')}
            </h2>
            <p className="text-sm text-ink-400 mt-0.5">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className={`badge-${order.status} text-sm`}>{order.status}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-ink-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-ink-400 text-xs mb-2">
              <User size={12} /> Customer
            </div>
            <p className="font-medium text-white">{order.customer?.full_name}</p>
            <p className="text-sm text-ink-400">{order.customer?.email}</p>
            {order.customer?.phone && <p className="text-sm text-ink-400">{order.customer.phone}</p>}
          </div>
          <div className="bg-ink-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-ink-400 text-xs mb-2">
              <Calendar size={12} /> Details
            </div>
            <p className="text-sm text-ink-300">Order ID: <span className="font-mono text-jade">#{order.id}</span></p>
            <p className="text-sm text-ink-300 mt-1">Status: <span className="capitalize">{order.status}</span></p>
          </div>
        </div>

        {order.notes && (
          <div className="bg-ink-700/30 rounded-lg p-4 mb-6 flex gap-3">
            <FileText size={14} className="text-ink-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-ink-300">{order.notes}</p>
          </div>
        )}

        {/* Line items */}
        <div>
          <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Package size={12} /> Items
          </h3>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-ink-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{item.product?.name}</p>
                  <p className="text-xs text-ink-400 font-mono">{item.product?.sku} · {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                </div>
                <p className="font-semibold text-jade">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-ink-600 flex justify-between items-center">
          <span className="font-display font-semibold text-ink-200">Total Amount</span>
          <span className="font-display text-2xl font-bold text-jade">${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
