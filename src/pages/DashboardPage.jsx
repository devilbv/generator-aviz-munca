import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CompanyForm from '@/components/company/CompanyForm'
import EmployeeTable from '@/components/employees/EmployeeTable'
import DocumentGenerator from '@/components/documents/DocumentGenerator'
import { useCompany } from '@/hooks/useCompany'
import { useEmployees } from '@/hooks/useEmployees'
import { Building2, Upload, FileText } from 'lucide-react'

export default function DashboardPage() {
  const companyHook  = useCompany()
  const employeeHook = useEmployees()
  const [activeTab, setActiveTab] = useState('company')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-white rounded-2xl shadow-sm border mb-6 p-1.5">
            <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
              <TabsTrigger
                value="company"
                className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Date Firmă</span>
                <span className="sm:hidden">Firmă</span>
              </TabsTrigger>
              <TabsTrigger
                value="employees"
                className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import CSV</span>
                <span className="sm:hidden">Angajați</span>
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Istoric Autorizații</span>
                <span className="sm:hidden">Generare</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="company">
            <CompanyForm {...companyHook} onContinue={() => setActiveTab('employees')} />
          </TabsContent>

          <TabsContent value="employees">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Import Angajați</h2>
                <p className="mt-1 text-sm text-gray-500">Importați angajații prin CSV, scanare pașapoarte sau adăugare manuală.</p>
              </div>
              <EmployeeTable
                employees={employeeHook.employees}
                addRow={employeeHook.addRow}
                deleteRow={employeeHook.deleteRow}
                updateRow={employeeHook.updateRow}
                importFromCSV={employeeHook.importFromCSV}
                importFromOCR={employeeHook.importFromOCR}
              />
              {employeeHook.employees.length > 0 && (
                <button
                  className="mt-6 w-full h-12 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
                  onClick={() => setActiveTab('generate')}
                >
                  Continuă la Generare Documente →
                </button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generate">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Generare Documente</h2>
                <p className="mt-1 text-sm text-gray-500">Generați documentele necesare pentru dosarul de Aviz de Muncă.</p>
              </div>
              <DocumentGenerator
                company={companyHook.company}
                employees={employeeHook.employees}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
