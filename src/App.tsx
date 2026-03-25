import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Quotations from './pages/Quotations'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { ContactsProvider } from '@/stores/useContactsStore'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import UpdatePassword from './pages/UpdatePassword'
import AuditLog from './pages/AuditLog'
import { useEffect } from 'react'

const HashRouterHandler = () => {
  const navigate = useNavigate()
  useEffect(() => {
    if (
      window.location.hash.includes('type=invite') ||
      window.location.hash.includes('type=recovery')
    ) {
      setTimeout(() => {
        navigate('/update-password')
      }, 500)
    }
  }, [navigate])
  return null
}

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <HashRouterHandler />
    <TooltipProvider delayDuration={0}>
      <AuthProvider>
        <ContactsProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/audit" element={<AuditLog />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ContactsProvider>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
