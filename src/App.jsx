// src/App.jsx - CORRIGIDO COM IMPORTS REAIS
// 🔥 SUBSTITUA TODO O CONTEÚDO DO SEU App.jsx ATUAL POR ESTE FICHEIRO
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from './config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  ThemedContainer, 
  ThemedHeading, 
  ThemedText 
} from './components/common/ThemedComponents';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages - Auth & Profile
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CreateProfilePage from './pages/profile/CreateProfilePage';
import ProfilePage from './pages/profile/ProfilePage';

// Pages - Main Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// ✅ PÁGINAS PRINCIPAIS - TODAS IMPLEMENTADAS E FUNCIONAIS
import LeadsPage from './pages/leads/LeadsPage';
import ClientsPage from './pages/clients/ClientsPage';
import VisitsPage from './pages/visits/VisitsPage';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import DealsPage from './pages/deals/DealsPage';
import TasksPage from './pages/tasks/TasksPage';

// ✅ PÁGINAS SECUNDÁRIAS - TODAS IMPLEMENTADAS E FUNCIONAIS
import CalendarPage from './pages/calendar/CalendarPage';
import ReportsPage from './pages/reports/ReportsPage'; // 🔥 IMPORT REAL
import IntegrationsPage from './pages/integrations/IntegrationsPage'; // 🔥 IMPORT REAL

// ✅ CONFIGURAÇÕES - IMPLEMENTADA E FUNCIONAL
import ConfigurationsPage from './pages/configurations/ConfigurationsPage'; // 🔥 IMPORT REAL

// Placeholder Components apenas para as que ainda não existem
const SupportPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Suporte</h1>
    <p className="text-gray-600">Centro de suporte em desenvolvimento...</p>
  </div>
);

const BillingPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Faturação</h1>
    <p className="text-gray-600">Gestão de faturação em desenvolvimento...</p>
  </div>
);

// Profile Guard - Protege rotas que requerem perfil completo
const ProfileGuard = ({ children }) => {
  const { userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <ThemedContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <ThemedHeading level={3} className="mb-2">Carregando perfil...</ThemedHeading>
          <ThemedText className="text-gray-600">Verificando dados do utilizador</ThemedText>
        </div>
      </ThemedContainer>
    );
  }

  // Verificar se perfil está completo de forma flexível
  const isProfileComplete = userProfile && (
    userProfile.profileCompleted === true ||
    (userProfile.name && userProfile.email)
  );

  if (!isProfileComplete) {
    return <Navigate to="/create-profile" replace />;
  }

  return children;
};

// Main App Function
function MainApp() {
  const [connectionStatus, setConnectionStatus] = useState('testing');

  // Teste de conexão Firebase
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        console.log('🔥 Testando conectividade Firebase...');
        await getDocs(collection(db, 'test'));
        setConnectionStatus('connected');
        console.log('✅ Firebase conectado com sucesso!');
      } catch (error) {
        console.error('❌ Erro de conectividade Firebase:', error);
        setConnectionStatus('error');
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <Router>
      <Routes>
        {/* === ROTAS PÚBLICAS === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* === ROTAS DE PERFIL (SEM ProfileGuard) === */}
        <Route 
          path="/create-profile" 
          element={
            <ProtectedRoute>
              <CreateProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <ProfilePage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />

        {/* === DASHBOARD PRINCIPAL (COM ProfileGuard) === */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <DashboardPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />

        {/* === MÓDULOS PRINCIPAIS (COM ProfileGuard) === */}
        <Route 
          path="/leads" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <LeadsPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <ClientsPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/visits" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <VisitsPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/opportunities" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <OpportunitiesPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/deals" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <DealsPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <TasksPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />

        {/* === MÓDULOS SECUNDÁRIOS (COM ProfileGuard) === */}
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <CalendarPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        {/* 🔥 COMPONENTES REAIS IMPLEMENTADOS */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <ReportsPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/integrations" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <IntegrationsPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />

        {/* === CONFIGURAÇÕES E GESTÃO === */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <ConfigurationsPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/billing" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <BillingPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/support" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <SupportPage />
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />

        {/* === SUBROTAS FUTURAS (Com ProfileGuard) === */}
        <Route 
          path="/leads/new" 
          element={
            <ProtectedRoute>
              <ProfileGuard>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Novo Lead</h1>
                  <p className="text-gray-600">Formulário para novo lead em desenvolvimento...</p>
                </div>
              </ProfileGuard>
            </ProtectedRoute>
          } 
        />

        {/* === ROTA DE FALLBACK === */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

// App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;