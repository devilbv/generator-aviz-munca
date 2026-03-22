import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DOCUMENT_TYPES, WORK_PERMIT_STATUSES } from '@/lib/constants'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Search, Trash2, History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function HistoryPage() {
  const { user } = useAuth()
  const [permits, setPermits]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => { if (user) fetchPermits() }, [user])

  const fetchPermits = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('work_permits')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
    setPermits(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    const { error } = await supabase.from('work_permits').delete().eq('id', id)
    if (error) {
      toast.error('Eroare la ștergere')
    } else {
      setPermits(p => p.filter(x => x.id !== id))
      toast.success('Dosar șters')
    }
    setDeleting(null)
    setConfirmId(null)
  }

  const filtered = permits.filter(p => {
    const q = search.toLowerCase()
    const employees = p.employees || []
    return (
      employees.some(e =>
        (e.employeeName || '').toLowerCase().includes(q) ||
        (e.passportNumber || '').toLowerCase().includes(q)
      ) ||
      (p.company_snapshot?.companyName || '').toLowerCase().includes(q)
    )
  })

  const statusInfo = (status) => WORK_PERMIT_STATUSES[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" /> Istoric Dosare
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Lista tuturor dosarelor de Aviz de Muncă generate</p>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Caută după serie pașaport sau nume..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{permits.length === 0 ? 'Niciun dosar generat încă' : 'Niciun rezultat'}</p>
          <p className="text-sm mt-1">{permits.length === 0 ? 'Începe să generezi dosare pentru a le vedea aici' : 'Încearcă altă căutare'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(permit => {
            const employees = permit.employees || []
            const company   = permit.company_snapshot || {}
            const docs      = permit.document_types || []
            const status    = statusInfo(permit.status)
            const date      = permit.generated_at
              ? format(new Date(permit.generated_at), 'dd MMM yyyy, HH:mm', { locale: ro })
              : '—'

            return (
              <Card key={permit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold">{company.companyName || 'Firmă necunoscută'}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{date}</span>
                      </div>

                      {employees.map((emp, i) => (
                        <div key={i} className="flex flex-wrap gap-1 mb-1">
                          <span className="text-sm font-medium">{emp.employeeName}</span>
                          {emp.position && <Badge variant="secondary" className="text-xs">{emp.position}</Badge>}
                          {emp.citizenship && <Badge variant="outline" className="text-xs">{emp.citizenship}</Badge>}
                          {emp.monthlySalary && (
                            <Badge variant="outline" className="text-xs">
                              {Number(emp.monthlySalary).toLocaleString('ro-RO')} RON
                            </Badge>
                          )}
                          {emp.passportNumber && <Badge variant="outline" className="text-xs">{emp.passportNumber}</Badge>}
                        </div>
                      ))}

                      {docs.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {docs.map(d => {
                            const dt = DOCUMENT_TYPES.find(x => x.slug === d)
                            return <Badge key={d} variant="outline" className="text-xs">{dt?.label || d}</Badge>
                          })}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => setConfirmId(permit.id)}
                      disabled={deleting === permit.id}
                    >
                      {deleting === permit.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Șterge dosar</DialogTitle>
            <DialogDescription>Sigur doriți să ștergeți acest dosar? Acțiunea nu poate fi anulată.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmId(null)}>Anulează</Button>
            <Button variant="destructive" onClick={() => handleDelete(confirmId)} disabled={!!deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Șterge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
