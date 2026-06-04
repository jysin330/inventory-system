import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Users, Search, Mail, Phone } from 'lucide-react'
import { getCustomers, createCustomer, deleteCustomer } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

const EMPTY = { full_name: '', email: '', phone: '', address: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    getCustomers().then(r => setCustomers(r.data)).catch(() => toast.error('Failed to load customers')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createCustomer(form)
      toast.success('Customer added')
      setShowModal(false)
      setForm(EMPTY)
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
      await deleteCustomer(deleteTarget.id)
      toast.success('Customer deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setShowModal(true) }}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-ink-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description="Add your first customer to get started." action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={15} />Add Customer</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-700/50 border-b border-ink-600">
                <tr>
                  {['Name', 'Email', 'Phone', 'Address', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="table-head text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell font-medium text-white">{c.full_name}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-ink-300">
                        <Mail size={12} className="text-ink-500" />{c.email}
                      </span>
                    </td>
                    <td className="table-cell text-ink-400">
                      {c.phone ? <span className="flex items-center gap-1.5"><Phone size={12} className="text-ink-500" />{c.phone}</span> : '—'}
                    </td>
                    <td className="table-cell text-ink-400 max-w-[160px] truncate">{c.address || '—'}</td>
                    <td className="table-cell text-ink-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-ink-300 hover:text-red-400 transition-colors" onClick={() => setDeleteTarget(c)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Add Customer" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input resize-none h-16" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Customer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Delete "${deleteTarget.full_name}"? Their order history will also be affected.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
