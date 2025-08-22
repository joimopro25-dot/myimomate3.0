// src/App.jsx - CORREÇÃO DE ROTA INCONSISTENTE
// 🔥 CORRIGINDO INCONSISTÊNCIA ENTRE SIDEBAR.JSX E APP.JSX
// ✅ Sidebar usa '/configurations' mas App.jsx usava '/settings'

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

// PÁGINAS PRINCIPAIS - TODAS IMPLEMENTADAS E FUNCIONAIS
import LeadsPage from './pages/leads/LeadsPage';
import ClientsPage from './pages/clients/ClientsPage';
import VisitsPage from './pages/visits/VisitsPage';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import DealsPage from './pages/deals/DealsPage';
import TasksPage from './pages/tasks/TasksPage';

// PÁGINAS SECUNDÁRIAS - TODAS IMPLEMENTADAS E FUNCIONAIS
import CalendarPage from './pages/calendar/CalendarPage';
import ReportsPage from './pages/reports/ReportsPage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';

// CONFIGURAÇÕES - IMPLEMENTADA E FUNCIONAL
import ConfigurationsPage from './pages/configurations/ConfigurationsPage';

// 🔥 PÁGINA DE SUPORTE - CRIAR COMPONENTE BÁSICO
const SupportPage = () => (
  <div className="flex min-h-screen bg-gray-50">
    {/* Sidebar será adicionada automaticamente pelo padrão das outras páginas */}
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Suporte</h1>
        <p className="text-lg text-gray-600 mb-8">Como podemos ajudar hoje?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">📚 FAQ</h3>
            <p className="text-gray-600">Perguntas frequentes sobre o MyImoMate</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">📞 Contacto</h3>
            <p className="text-gray-600">Fale diretamente com a nossa equipa</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">🎓 Tutoriais</h3>
            <p className="text-gray-600">Aprenda a usar todas as funcionalidades</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500">Sistema MyImoMate 3.0 - Suporte Premium</p>
        </div>
      </div>
    </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <ThemedText>A carregar...</ThemedText>
        </div>
      </ThemedContainer>
    );
  }
  
  if (!userProfile?.name || !userProfile?.company) {
    return <Navigate to="/create-profile" replace />;
  }
  
  return children;
};

// Firebase Connection Test
const FirebaseTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    try {
      // Teste de leitura
      const querySnapshot = await getDocs(collection(db, 'users'));
      
      // Teste de escrita
      await addDoc(collection(db, 'test'), {
        message: 'Firebase conectado com sucesso!',
        timestamp: new Date()
      });
      
      setTestResult({
        success: true,
        message: `Firebase conectado! ${querySnapshot.size} utilizadores encontrados.`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro: ${error.message}`
      });
    }
    setLoading(false);
  };

  return (
    <ThemedContainer className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <ThemedHeading level={1} className="text-2xl font-bold mb-4">
          Teste de Conexão Firebase
        </ThemedHeading>
        
        <button
          onClick={testFirebaseConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'A testar...' : 'Testar Conexão'}
        </button>
        
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>
    </ThemedContainer>
  );
};

// Main App Component
function MainApp() {
  return (
    <Router>
      <Routes>
        {/* === ROTAS PÚBLICAS === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/firebase-test" element={<FirebaseTest />} />

        {/* === ROTAS PROTEGIDAS (SEM ProfileGuard) === */}
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

        {/* === MÓDULOS PRINCIPAIS CRM (COM ProfileGuard) === */}
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
        {/* 🔥 CORRIGIDO: /settings → /configurations para coincidir com Sidebar.jsx */}
        <Route 
          path="/configurations" 
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
        
        {/* 🔥 CORRIGIDO: Suporte agora funciona */}
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