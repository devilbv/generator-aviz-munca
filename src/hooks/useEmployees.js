import { useState } from 'react'
import { DEFAULT_EMPLOYEE, CSV_COLUMN_MAP } from '@/lib/constants'
import { toast } from 'sonner'
import Papa from 'papaparse'

let nextId = 1
const mkId = () => nextId++

const newEmployee = (overrides = {}) => ({
  ...DEFAULT_EMPLOYEE,
  id: mkId(),
  ...overrides,
})

export function useEmployees() {
  const [employees, setEmployees] = useState([newEmployee()])

  const addRow = () => setEmployees(e => [...e, newEmployee()])

  const deleteRow = (id) => setEmployees(e => e.filter(emp => emp.id !== id))

  const updateRow = (id, field, value) =>
    setEmployees(e => e.map(emp => emp.id === id ? { ...emp, [field]: value } : emp))

  const importFromCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) { toast.error('Eroare la parsarea CSV'); return }
        if (data.length > 100) { toast.error('Maximum 100 de angajați per import'); return }

        const mapped = data.map(row => {
          const emp = newEmployee()
          for (const [csvCol, field] of Object.entries(CSV_COLUMN_MAP)) {
            if (row[csvCol] !== undefined) emp[field] = row[csvCol]
          }
          return emp
        })

        const valid = mapped.filter(e => e.employeeName && e.passportNumber)
        if (valid.length < mapped.length) {
          toast.warning(`${mapped.length - valid.length} rând(uri) ignorate (lipsesc câmpuri obligatorii)`)
        }
        setEmployees(e => [...e, ...valid])
        toast.success(`${valid.length} angajați importați. Puteți edita datele înainte de import.`)
      },
    })
  }

  const importFromOCR = (ocrData) => {
    if (Array.isArray(ocrData)) {
      setEmployees(e => [...e, ...ocrData.map(d => newEmployee(d))])
    } else {
      setEmployees(e => [...e, newEmployee(ocrData)])
    }
  }

  const clearAll = () => setEmployees([newEmployee()])

  return { employees, addRow, deleteRow, updateRow, importFromCSV, importFromOCR, clearAll }
}
