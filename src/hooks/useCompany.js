import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const EMPTY_COMPANY = {
  companyName: '',
  cui: '',
  registryNumber: '',
  companyAddress: '',
  administratorName: '',
  ajofmCertificateNumber1: '',
  ajofmCertificateNumber2: '',
  representativeName: '',
  representativeCNP: '',
  representativeAddress: '',
  representativeIdSeries: '',
  representativeIdNumber: '',
  representativeIdIssuedBy: '',
}

export function useCompany() {
  const { user } = useAuth()
  const [company, setCompany] = useState(EMPTY_COMPANY)
  const [savedCompanies, setSavedCompanies] = useState([])
  const [lookingUp, setLookingUp] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchSavedCompanies()
  }, [user])

  const fetchSavedCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (data) setSavedCompanies(data)
  }

  const updateField = (field, value) => setCompany(c => ({ ...c, [field]: value }))

  const loadSavedCompany = (savedId) => {
    const found = savedCompanies.find(c => c.id === savedId)
    if (found) {
      setCompany({
        companyName:             found.company_name || '',
        cui:                     found.cui || '',
        registryNumber:          found.registry_number || '',
        companyAddress:          found.company_address || '',
        administratorName:       found.administrator_name || '',
        ajofmCertificateNumber1: found.ajofm_certificate_number1 || '',
        ajofmCertificateNumber2: found.ajofm_certificate_number2 || '',
        representativeName:      found.representative_name || '',
        representativeCNP:       found.representative_cnp || '',
        representativeAddress:   found.representative_address || '',
        representativeIdSeries:  found.representative_id_series || '',
        representativeIdNumber:  found.representative_id_number || '',
        representativeIdIssuedBy: found.representative_id_issued_by || '',
      })
      toast.success('Datele firmei și reprezentantului au fost completate anterior')
    }
  }

  const lookupCUI = async () => {
    if (!company.cui) { toast.error('Introduceți CUI-ul'); return }
    setLookingUp(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data, error } = await supabase.functions.invoke('check-company', {
        body: { cui: company.cui },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (error) throw error
      if (data) {
        setCompany(c => ({
          ...c,
          companyName:    data.denumire || c.companyName,
          companyAddress: data.adresa   || c.companyAddress,
          registryNumber: data.nrOrdineRC || c.registryNumber,
        }))
        toast.success('Datele firmei au fost importate cu succes din ONRC')
      }
    } catch (err) {
      toast.error('Eroare la căutare ONRC: ' + (err.message || 'necunoscută'))
    } finally {
      setLookingUp(false)
    }
  }

  const saveCompany = async () => {
    if (!company.companyName || !company.cui) {
      toast.error('Vă rugăm să completați câmpurile obligatorii (Denumire firmă, CUI).')
      return
    }
    setSaving(true)
    try {
      const payload = {
        user_id:                    user.id,
        company_name:               company.companyName,
        cui:                        company.cui,
        registry_number:            company.registryNumber,
        company_address:            company.companyAddress,
        administrator_name:         company.administratorName,
        ajofm_certificate_number1:  company.ajofmCertificateNumber1,
        ajofm_certificate_number2:  company.ajofmCertificateNumber2,
        representative_name:        company.representativeName,
        representative_cnp:         company.representativeCNP,
        representative_address:     company.representativeAddress,
        representative_id_series:   company.representativeIdSeries,
        representative_id_number:   company.representativeIdNumber,
        representative_id_issued_by: company.representativeIdIssuedBy,
        updated_at:                 new Date().toISOString(),
      }
      const existing = savedCompanies.find(c => c.cui === company.cui)
      if (existing) {
        await supabase.from('companies').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('companies').insert(payload)
      }
      await fetchSavedCompanies()
      toast.success('Datele vor fi încărcate automat următoarea dată când accesați platforma')
    } catch (err) {
      toast.error('Eroare la salvare: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteCompany = async (id) => {
    try {
      await supabase.from('companies').delete().eq('id', id)
      setSavedCompanies(prev => prev.filter(c => c.id !== id))
      toast.success('Firma a fost ștearsă')
    } catch (err) {
      toast.error('Eroare la ștergere: ' + err.message)
    }
  }

  return { company, updateField, savedCompanies, loadSavedCompany, lookupCUI, lookingUp, saveCompany, saving, deleteCompany }
}
