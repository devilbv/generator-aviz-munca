import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CompanyForm from '@/components/company/CompanyForm'
import EmployeeTable from '@/components/employees/EmployeeTable'
import DocumentGenerator from '@/components/documents/DocumentGenerator'
import { useCompany } from '@/hooks/useCompany'
import { useEmployees } from '@/hooks/useEmployees'
import { Building2, Users, FileDown } from 'lucide-react'

export default function DashboardPage() {
  const companyHook  = useCompany()
  const employeeHook = useEmployees()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Generator Dosare Aviz de Muncă</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Completați datele firmei, importați angajații și generați documentele necesare.
        </p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span>1. Firmă</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="h-4 w-4" />
            <span>2. Angajați</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-2">
            <FileDown className="h-4 w-4" />
            <span>3. Generare</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Date Firmă și Reprezentant</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyForm {...companyHook} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Import și Gestionare Angajați</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeTable
                employees={employeeHook.employees}
                addRow={employeeHook.addRow}
                deleteRow={employeeHook.deleteRow}
                updateRow={employeeHook.updateRow}
                importFromCSV={employeeHook.importFromCSV}
                importFromOCR={employeeHook.importFromOCR}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generare Documente</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentGenerator
                company={companyHook.company}
                employees={employeeHook.employees}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
