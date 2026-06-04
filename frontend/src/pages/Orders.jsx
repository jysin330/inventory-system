import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2, ShoppingCart, Eye } from 'lucide-react'
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    getOrders().then(r => setOrders(r.data)).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openModal = async () => {
    try {
      const [c, p] = await Promise.all([getCustomers(), getProducts()])
      setCustomers(c.data)
      setProducts(p.data)
      setCustomerId('')
      setNotes('')
      setItems([{ product_id: '', quantity: 1 }])
      setShowModal(true)
    } catch {
      toast.error('Failed to load form data')
    }
  }

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }])
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i, field, val) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: val }
    setItems(updated)
  }

  const orderTotal = items.reduce((sum, item) => {
    const p = products.find(p => p.id === parseInt(item.product_id))
    return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0)
  }, 0)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!customerId) return toast.error('Select a customer')
    if (items.some(i => !i.product_id)) return toast.error('Select a product for each item')
    setSaving(true)
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        notes,
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      })
      toast.success('Order created')
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteOrder(deleteTarget.id)
      toast.success('Order cancelled & stock restored')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex justify-end">
        <button className="btn-primary" onClick={openModal}>
          <Plus size={15} /> New Order
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-ink-400 text-sm">Loading…</div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders yet" description="Create your first order." action={<button className="btn-primary" onClick={openModal}><Plus size={15} />New Order</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-700/50 border-b border-ink-600">
                <tr>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="table-head text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="table-row">
                    <td className="table-cell font-mono text-xs text-jade">#{o.id.toString().padStart(4, '0')}</td>
                    <td className="table-cell font-medium text-white">{o.customer?.full_name}</td>
                    <td className="table-cell text-ink-300">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                    <td className="table-cell font-semibold text-jade">${o.total_amount.toFixed(2)}</td>
                    <td className="table-cell">
                      <span className={`badge-${o.status}`}>{o.status}</span>
                    </td>
                    <td className="table-cell text-ink-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Link to={`/orders/${o.id}`} className="p-1.5 rounded-lg hover:bg-ink-600 text-ink-300 hover:text-ink-100 transition-colors">
                          <Eye size={14} />
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-ink-300 hover:text-red-400 transition-colors" onClick={() => setDeleteTarget(o)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Create Order" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="label">Customer *</label>
              <select className="input" required value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select a customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Order Items *</label>
                <button type="button" className="text-xs text-jade hover:underline" onClick={addItem}>+ Add item</button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => {
                  const selectedProd = products.find(p => p.id === parseInt(item.product_id))
                  return (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <select className="input" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                          <option value="">Select product</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                              {p.name} ({p.sku}) — ${p.price} · {p.quantity} in stock
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          className="input"
                          type="number"
                          min="1"
                          max={selectedProd?.quantity}
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', e.target.value)}
                        />
                      </div>
                      {items.length > 1 && (
                        <button type="button" className="text-red-400 hover:text-red-300 p-2" onClick={() => removeItem(i)}>✕</button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {orderTotal > 0 && (
              <div className="bg-jade/5 border border-jade/20 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-ink-300">Estimated Total</span>
                <span className="font-display font-bold text-jade text-lg">${orderTotal.toFixed(2)}</span>
              </div>
            )}

            <div>
              <label className="label">Notes</label>
              <textarea className="input resize-none h-16" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional order notes…" />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Order'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Cancel order #${deleteTarget.id.toString().padStart(4, '0')}? Stock will be restored.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
