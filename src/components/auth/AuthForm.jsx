import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, FileText } from 'lucide-react'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Eroare la autentificare')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(form.email, form.password)
      toast.success('Cont creat! Verifică emailul pentru confirmare.')
    } catch (err) {
      toast.error(err.message || 'Eroare la înregistrare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Generator Dosare</h1>
          <p className="mt-1 text-sm text-gray-600">Aviz de munca</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Autentificare</TabsTrigger>
                <TabsTrigger value="register">Înregistrare</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email-login">Email</Label>
                    <Input id="email-login" name="email" type="email" placeholder="exemplu@email.ro"
                      value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password-login">Parolă</Label>
                    <Input id="password-login" name="password" type="password" placeholder="••••••••"
                      value={form.password} onChange={handleChange} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Autentificare →'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email-reg">Email</Label>
                    <Input id="email-reg" name="email" type="email" placeholder="exemplu@email.ro"
                      value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password-reg">Parolă</Label>
                    <Input id="password-reg" name="password" type="password" placeholder="••••••••"
                      value={form.password} onChange={handleChange} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Creează cont →'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
