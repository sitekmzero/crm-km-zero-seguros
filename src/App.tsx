import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Quotations from './pages/Quotations'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Documents from './pages/Documents'
import Manual from './pages/Manual'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { ContactsProvider } from '@/stores/useContactsStore'
import { AuthProvider } from '@/hooks/use-auth'
import { NotificationProvider } from '@/hooks/use-notifications'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import UpdatePassword from './pages/UpdatePassword'
import AuditLog from './pages/AuditLog'
import Treinamento from './pages/Treinamento'
import TreinamentoModulo from './pages/TreinamentoModulo'
import TreinamentoRelatorio from './pages/TreinamentoRelatorio'
import TreinamentoPratica from './pages/TreinamentoPratica'
import TreinamentoFluxo from './pages/TreinamentoFluxo'
import Diagnostico from './pages/Diagnostico'
import { useEffect } from 'react'

const HashRouterHandler = () => {
  const navigate = useNavigate()
  useEffect(() => {
    if (
      window.location.hash.includes('type=invite') ||
      window.location.hash.includes('type=recovery')
    ) {
      setTimeout(() => navigate('/update-password'), 500)
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
        <NotificationProvider>
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
                <Route path="/documents" element={<Documents />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="/manual"
                  element={<Navigate to="/manual/inicio" replace />}
                />
                <Route path="/manual/:section" element={<Manual />} />
                <Route path="/audit" element={<AuditLog />} />
                <Route path="/treinamento" element={<Treinamento />} />
                <Route
                  path="/treinamento/modulo/:id"
                  element={<TreinamentoModulo />}
                />
                <Route
                  path="/treinamento/pratica/:id"
                  element={<TreinamentoPratica />}
                />
                <Route
                  path="/treinamento/fluxo/:id"
                  element={<TreinamentoFluxo />}
                />
                <Route
                  path="/treinamento/relatorio"
                  element={<TreinamentoRelatorio />}
                />
                {/* Redirects para rotas requeridas sem componentes isolados */}
                <Route
                  path="/treinamento/boas-praticas"
                  element={<Navigate to="/treinamento" replace />}
                />
                <Route
                  path="/treinamento/fluxos"
                  element={<Navigate to="/treinamento" replace />}
                />
                <Route
                  path="/treinamento/progresso"
                  element={<Navigate to="/treinamento/relatorio" replace />}
                />
                <Route
                  path="/treinamento/certificado"
                  element={<Navigate to="/treinamento" replace />}
                />
                <Route path="/diagnostico" element={<Diagnostico />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ContactsProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
