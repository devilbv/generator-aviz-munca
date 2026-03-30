import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Building2, X } from 'lucide-react'

export default function BillingDetailsModal({ onConfirm, onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ billing_company: '', billing_cif: '', billing_address: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('user_profiles')
        .select('billing_company, billing_cif, billing_address')
        .eq('id', user.id)
        .single()
      if (data) {
        setForm({
          billing_company: data.billing_company || '',
          billing_cif:     data.billing_cif     || '',
          billing_address: data.billing_address  || '',
        })
      }
      setFetching(false)
    }
    load()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.billing_company.trim() || !form.billing_cif.trim() || !form.billing_address.trim()) {
      toast.error('Completați toate câmpurile.')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('user_profiles')
      .update(form)
      .eq('id', user.id)
    if (error) {
      toast.error('Eroare la salvare.')
      setLoading(false)
      return
    }
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Date facturare</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {fetching ? (
          <div className="py-8 text-center text-sm text-gray-400">Se încarcă...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Denumire firmă *</label>
              <input
                type="text"
                value={form.billing_company}
                onChange={e => setForm(f => ({ ...f, billing_company: e.target.value }))}
                placeholder="Ex: SC Web Digital SRL"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CIF / CUI *</label>
              <input
                type="text"
                value={form.billing_cif}
                onChange={e => setForm(f => ({ ...f, billing_cif: e.target.value }))}
                placeholder="Ex: RO12345678"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresă sediu *</label>
              <input
                type="text"
                value={form.billing_address}
                onChange={e => setForm(f => ({ ...f, billing_address: e.target.value }))}
                placeholder="Ex: Str. Exemplu nr. 1, București"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <p className="text-xs text-gray-400">Aceste date vor fi folosite pentru emiterea facturii.</p>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Anulează</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Se salvează...' : 'Continuă la plată'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
