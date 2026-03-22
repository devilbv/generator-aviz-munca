import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AuthForm from '@/components/auth/AuthForm'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (session) return <Navigate to="/" replace />

  return <AuthForm />
}
