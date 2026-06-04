import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

const EMPTY_FORM = { name: '', sku: '', description: '', price: '', quantity: '', category: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    getProducts().then(r => setProducts(r.data)).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal('edit') }
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, description: p.description || '', price: p.price, quantity: p.quantity, category: p.category || '' })
    setEditing(p)
    setModal('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
    try {
      if (editing) {
        const { sku, ...updatePayload } = payload
        await updateProduct(editing.id, updatePayload)
        toast.success('Product updated')
      } else {
        await createProduct(payload)
        toast.success('Product created')
      }
      setModal(null)
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
      await deleteProduct(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-ink-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products found" description="Add your first product to get started." action={<button className="btn-primary" onClick={openCreate}><Plus size={15} />Add Product</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-700/50 border-b border-ink-600">
                <tr>
                  {['Name', 'SKU', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="table-head text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell font-medium text-white">{p.name}</td>
                    <td className="table-cell font-mono text-xs text-ink-300">{p.sku}</td>
                    <td className="table-cell text-ink-400">{p.category || '—'}</td>
                    <td className="table-cell text-jade font-semibold">${p.price.toFixed(2)}</td>
                    <td className="table-cell">
                      {p.quantity === 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Out of stock</span>
                      ) : p.quantity <= 10 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">{p.quantity} low</span>
                      ) : (
                        <span className="text-ink-200">{p.quantity}</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-ink-600 text-ink-300 hover:text-ink-100 transition-colors" onClick={() => openEdit(p)}>
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-ink-300 hover:text-red-400 transition-colors" onClick={() => setDeleteTarget(p)}>
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

      {/* Edit/Create Modal */}
      {modal === 'edit' && (
        <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Product Name *</label>
                <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="label">SKU *</label>
                <input className="input" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} disabled={!!editing} />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div>
                <label className="label">Price ($) *</label>
                <input className="input" type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div>
                <label className="label">Quantity *</label>
                <input className="input" type="number" min="0" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea className="input resize-none h-20" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
