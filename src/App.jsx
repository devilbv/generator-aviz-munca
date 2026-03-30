import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import HistoryPage from '@/pages/HistoryPage'
import PricingPage from '@/pages/PricingPage'
import BillingSuccessPage from '@/pages/BillingSuccessPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import RefundPage from '@/pages/RefundPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/billing/success"  element={<BillingSuccessPage />} />
          <Route path="/termeni"         element={<TermsPage />} />
          <Route path="/confidentialitate" element={<PrivacyPage />} />
          <Route path="/rambursare"      element={<RefundPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/"        element={<DashboardPage />} />
            <Route path="/istoric"  element={<HistoryPage />} />
            <Route path="/pricing"  element={<PricingPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
