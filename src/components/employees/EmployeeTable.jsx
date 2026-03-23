import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Upload, Camera, Download, Info, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { CSV_COLUMN_MAP } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { useEmployees } from '@/hooks/useEmployees'

const CSV_TEMPLATE_ROWS = [
  { 'Nume Complet': 'MISGANA FEREJE HUSSEN',    'Data Nașterii': '30.07.2000', 'Locul Nașterii': 'DOYO GENA',   'Nationalitate': 'Etiopia', 'Nr. Pașaport': 'EP8714091', 'Cod Țară': 'ETH', 'Data Emiterii': '05.01.2024', 'Data Expirării': '03.01.2029' },
  { 'Nume Complet': 'ABEL AFEWORK GEBREMEDHIN', 'Data Nașterii': '09.04.2003', 'Locul Nașterii': 'ADDIS ABABA', 'Nationalitate': 'Etiopia', 'Nr. Pașaport': 'EP7904007', 'Cod Țară': 'ETH', 'Data Emiterii': '22.03.2023', 'Data Expirării': '20.03.2028' },
  { 'Nume Complet': 'MIGBNEH BIZUNEH ZEGEYE',   'Data Nașterii': '21.11.1972', 'Locul Nașterii': 'TACH ARMACH', 'Nationalitate': 'Etiopia', 'Nr. Pașaport': 'EP6438193', 'Cod Țară': 'ETH', 'Data Emiterii': '14.04.2021', 'Data Expirării': '03.04.2026' },
  { 'Nume Complet': 'NEBIYU DAWIT TEFERA',      'Data Nașterii': '03.09.2002', 'Locul Nașterii': 'ADDIS ABABA', 'Nationalitate': 'Etiopia', 'Nr. Pașaport': 'EP9383009', 'Cod Țară': 'ETH', 'Data Emiterii': '21.10.2024', 'Data Expirării': '20.10.2029' },
  { 'Nume Complet': 'MISGANA GETAHUN ADNBO',    'Data Nașterii': '08.05.2000', 'Locul Nașterii': 'DOYOGENA',   'Nationalitate': 'Etiopia', 'Nr. Pașaport': 'EP7368411', 'Cod Țară': 'ETH', 'Data Emiterii': '31.08.2022', 'Data Expirării': '30.08.2027' },
]

const COLUMNS = [
  { key: 'employeeName',        label: 'Nume Complet',   required: true,  width: '160px' },
  { key: 'passportNumber',      label: 'Nr. Pașaport',   required: true,  width: '120px' },
  { key: 'passportCountryCode', label: 'Cod Țară',       required: false, width: '80px'  },
  { key: 'birthDate',           label: 'Data Nașterii',  required: false, width: '120px' },
  { key: 'birthPlace',          label: 'Loc Naștere',    required: false, width: '120px' },
  { key: 'citizenship',         label: 'Cetățenie',      required: false, width: '100px' },
  { key: 'passportIssueDate',   label: 'Data Emiterii',  required: false, width: '120px' },
  { key: 'passportExpiryDate',  label: 'Data Expirării', required: false, width: '120px' },
  { key: 'position',            label: 'Funcția',        required: false, width: '100px' },
  { key: 'corCode',             label: 'Cod COR',        required: false, width: '80px'  },
  { key: 'monthlySalary',       label: 'Salariu (RON)',  required: false, width: '100px' },
  { key: 'workLocation',        label: 'Loc Activitate', required: false, width: '120px' },
  { key: 'vacationDays',        label: 'Zile CO',        required: false, width: '80px'  },
]

export default function EmployeeTable({ employees, addRow, deleteRow, updateRow, importFromCSV, importFromOCR }) {
  const [activeTab, setActiveTab] = useState('scan')
  const [ocrFiles, setOcrFiles]   = useState([])
  const [scanning, setScanning]   = useState(false)
  const csvRef = useRef()
  const ocrRef = useRef()

  const downloadTemplate = () => {
    const csv = Papa.unparse(CSV_TEMPLATE_ROWS)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'angajati_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const mapped = data.map(row => {
          const emp = {}
          Object.entries(CSV_COLUMN_MAP).forEach(([col, field]) => {
            if (row[col] !== undefined) emp[field] = row[col]
          })
          return emp
        }).filter(e => e.employeeName || e.passportNumber)
        importFromCSV(mapped)
        toast.success(`${mapped.length} angajați importați din CSV`)
      }
    })
    e.target.value = ''
  }

  const handleOCRSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 100) { toast.error('Maximum 100 fișiere simultan'); return }
    setOcrFiles(files)
    e.target.value = ''
  }

  const handleOCRScan = async () => {
    if (!ocrFiles.length) { toast.error('Selectați cel puțin un fișier'); return }
    setScanning(true)
    const id = toast.loading(`Se scanează ${ocrFiles.length} fișier(e)...`)
    let success = 0
    for (const file of ocrFiles) {
      try {
        const base64 = await fileToBase64(file)
        const { data: { session } } = await supabase.auth.getSession()
        const { data, error } = await supabase.functions.invoke('parse-passport', {
          body: { image: base64, filename: file.name, mimeType: file.type },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        })
        if (error) throw error
        importFromOCR(data)
        success++
      } catch {
        toast.error(`Eroare la scanarea: ${file.name}`)
      }
    }
    toast.dismiss(id)
    if (success) toast.success(`${success}/${ocrFiles.length} pașapoarte scanate`)
    setOcrFiles([])
    setScanning(false)
  }

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === 'scan' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Camera className="h-4 w-4" /> Scanare Pașapoarte
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === 'csv' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="h-4 w-4" /> Import CSV
        </button>
      </div>

      {/* Tab: Scanare Pașapoarte */}
      {activeTab === 'scan' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Camera className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Scanare Pașapoarte</h3>
            <p className="text-sm text-gray-500 mt-1">Încărcați poze sau PDF-uri cu pașapoartele angajaților pentru extragere automată</p>
          </div>

          <div
            className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={() => ocrRef.current.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">JPG, PNG, WebP sau PDF • Maximum 100 fișiere</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={e => { e.stopPropagation(); ocrRef.current.click() }}>
              <Upload className="h-4 w-4" />
              Selectează pașapoarte ({ocrFiles.length} selectate)
            </Button>
            <input ref={ocrRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleOCRSelect} />
          </div>

          {ocrFiles.length > 0 && (
            <Button className="w-full gap-2" onClick={handleOCRScan} disabled={scanning}>
              {scanning ? 'Se scanează...' : `Scanează ${ocrFiles.length} fișier(e) →`}
            </Button>
          )}

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" /> Cum funcționează:
            </p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Încărcați poze clare ale paginii principale a pașaportului</li>
              <li>AI-ul extrage automat: nume, data nașterii, loc naștere, cetățenie, nr. pașaport, date validitate</li>
              <li>Datele extrase se adaugă automat în tabelul de previzualizare</li>
              <li>Puteți edita datele înainte de import</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Import CSV */}
      {activeTab === 'csv' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Import CSV</h3>
            <p className="text-sm text-gray-500 mt-1">Importați datele angajaților dintr-un fișier CSV</p>
          </div>

          <div
            className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={() => csvRef.current.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Fișier CSV cu datele angajaților</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={e => { e.stopPropagation(); csvRef.current.click() }}>
              <Upload className="h-4 w-4" /> Selectează fișier CSV
            </Button>
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Descarcă template CSV
          </Button>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" /> Coloane acceptate:
            </p>
            <p className="text-xs text-blue-700">
              Nume Complet, Data Nașterii, Locul Nașterii, Nationalitate, Nr. Pașaport, Cod Țară, Data Emiterii, Data Expirării
            </p>
          </div>
        </div>
      )}

      {/* Tabel angajați */}
      {employees.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Angajați ({employees.length})</h3>
            <Button size="sm" variant="outline" onClick={addRow} className="gap-1">
              <UserPlus className="h-4 w-4" /> Adaugă manual
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-3 py-2 text-left font-medium text-gray-500 w-8">#</th>
                  {COLUMNS.map(c => (
                    <th key={c.key} className="px-2 py-2 text-left font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: c.width }}>
                      {c.label}{c.required && <span className="text-destructive ml-0.5">*</span>}
                    </th>
                  ))}
                  <th className="px-2 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-1 text-gray-400 text-xs">{idx + 1}</td>
                    {COLUMNS.map(c => (
                      <td key={c.key} className="px-1 py-1">
                        <Input
                          value={emp[c.key] || ''}
                          onChange={e => updateRow(emp.id, c.key, e.target.value)}
                          className={`h-8 text-xs ${c.required && !emp[c.key] ? 'border-destructive/50' : ''}`}
                          placeholder={c.required ? 'obligatoriu' : ''}
                        />
                      </td>
                    ))}
                    <td className="px-1 py-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteRow(emp.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {employees.length === 0 && (
        <div className="text-center py-4">
          <Button size="sm" variant="outline" onClick={addRow} className="gap-1">
            <UserPlus className="h-4 w-4" /> Adaugă angajat manual
          </Button>
        </div>
      )}
    </div>
  )
}
