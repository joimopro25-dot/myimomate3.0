// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from './config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

//Gestão de Perfil
import CreateProfilePage from './pages/profile/CreateProfilePage';
import ProfilePage from './pages/profile/ProfilePage';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemedContainer } from './components/common/ThemedComponents';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
// Páginas dos Módulos Implementados
import LeadsPage from './pages/leads/LeadsPage';
import ClientsPage from './pages/clients/ClientsPage';
import VisitsPage from './pages/visits/VisitsPage';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import DealsPage from './pages/deals/DealsPage';
import TasksPage from './pages/tasks/TasksPage';

// Páginas ainda não implementadas (manter placeholders)
const CalendarPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Calendário</h1>
    <p className="text-gray-600">Calendário integrado em desenvolvimento...</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Configurações</h1>
    <p className="text-gray-600">Página de configurações em desenvolvimento...</p>
  </div>
);

const SupportPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Suporte</h1>
    <p className="text-gray-600">Centro de suporte em desenvolvimento...</p>
  </div>
);

const ProfilePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Perfil do Utilizador</h1>
    <p className="text-gray-600">Gestão de perfil em desenvolvimento...</p>
  </div>
);

const BillingPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Faturação</h1>
    <p className="text-gray-600">Gestão de faturação em desenvolvimento...</p>
  </div>
);


// Componente para páginas não encontradas
const NotFoundPage = () => (
  <ThemedContainer className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
      <p className="text-gray-600 mb-8">A página que procura não existe ou foi movida.</p>
      <div className="space-x-4">
        <a 
          href="/dashboard" 
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir para Dashboard
        </a>
        <a 
          href="/" 
          className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Página Inicial
        </a>
      </div>
    </div>
  </ThemedContainer>
);
// No componente ProtectedRoute, adicionar verificação de perfil completo:
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

  // Se não tem perfil completo, redirecionar para criação
  if (!userProfile?.stats?.profileCompleted) {
    return <Navigate to="/create-profile" replace />;
  }

  return children;
};

// Firebase connection test component (mantido para debug)
const FirebaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('🔄 Testando conexão Firebase...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Tentar adicionar documento teste
        const docRef = await addDoc(collection(db, 'connection_test'), {
          message: 'MyImoMate 3.0 conectado!',
          timestamp: new Date(),
          version: '3.0'
        });
        
        // Tentar ler documentos
        const querySnapshot = await getDocs(collection(db, 'connection_test'));
        
        setConnectionStatus(`✅ Firebase conectado com sucesso! (${querySnapshot.size} docs)`);
      } catch (error) {
        setConnectionStatus(`❌ Erro de conexão: ${error.message}`);
        console.error('Firebase Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    testFirebase();
  }, []);

  return (
    <ThemedContainer>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Connection Test</h1>
            <p className="text-gray-600 mb-6">MyImoMate 3.0 - Sistema de Temas + Auth</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-500 mb-2">Status da Conexão:</div>
              <div className={`font-medium ${
                isLoading ? 'text-blue-600' : 
                connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-medium text-blue-900">Framework</div>
                <div className="text-blue-700">React + Vite</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="font-medium text-green-900">Database</div>
                <div className="text-green-700">Firebase</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="font-medium text-purple-900">Auth</div>
                <div className="text-purple-700">Firebase Auth</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="font-medium text-yellow-900">Temas</div>
                <div className="text-yellow-700">6 Temas Ativos</div>
              </div>
            </div>

            <div className="space-y-3">
              <a 
                href="/" 
                className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏠 Ver Landing Page
              </a>
              <a 
                href="/login" 
                className="block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🔐 Testar Login
              </a>
              <a 
                href="/register" 
                className="block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📝 Testar Registo
              </a>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              🎨 Sistema completo: Temas + Auth + Dashboard + Rotas Protegidas
            </p>
          </div>
        </div>
      </div>
    </ThemedContainer>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Páginas Públicas */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Teste Firebase - Página de debug */}
              <Route path="/firebase-test" element={<FirebaseTest />} />
              
                {/* Rota para criação de perfil (para utilizadores sem perfil completo) */}
              <Route 
                path="/create-profile" 
                element={
                  <ProtectedRoute>
                    <CreateProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota para gestão de perfil (para utilizadores com perfil completo) */}
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
              
              {/* Proteger dashboard e outras rotas principais com ProfileGuard */}
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
              
              {/* Aplicar ProfileGuard a todas as rotas de módulos */}
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

              {/* Páginas Protegidas - Requerem Autenticação */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/leads" 
                element={
                  <ProtectedRoute>
                    <LeadsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute>
                    <ClientsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/visits" 
                element={
                  <ProtectedRoute>
                    <VisitsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/opportunities" 
                element={
                  <ProtectedRoute>
                    <OpportunitiesPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/deals" 
                element={
                  <ProtectedRoute>
                    <DealsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/support" 
                element={
                  <ProtectedRoute>
                    <SupportPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/billing" 
                element={
                  <ProtectedRoute>
                    <BillingPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">Relatórios e Analytics</h1>
                      <p className="text-gray-600">Sistema de relatórios em desenvolvimento...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/integrations" 
                element={
                  <ProtectedRoute>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">Integrações</h1>
                      <p className="text-gray-600">Gestão de integrações em desenvolvimento...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />

              {/* Rotas de Redirecionamento */}
              
              {/* Redirecionar /app para /dashboard */}
              <Route path="/app" element={<Navigate to="/dashboard" replace />} />
              
              {/* Redirecionar rotas antigas */}
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
              <Route path="/crm" element={<Navigate to="/dashboard" replace />} />
              
              {/* Subrotas futuras */}
              
              {/* Leads subrotas */}
              <Route path="/leads/new" element={
                <ProtectedRoute>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Novo Lead</h1>
                    <p className="text-gray-600">Formulário para novo lead em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Clients subrotas */}
              <Route path="/clients/new" element={
                <ProtectedRoute>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Novo Cliente</h1>
                    <p className="text-gray-600">Formulário para novo cliente em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Visits subrotas */}
              <Route path="/visits/schedule" element={
                <ProtectedRoute>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Agendar Visita</h1>
                    <p className="text-gray-600">Formulário de agendamento em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Deals subrotas */}
              <Route path="/deals/new" element={
                <ProtectedRoute>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Novo Negócio</h1>
                    <p className="text-gray-600">Formulário para novo negócio em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Tasks subrotas */}
              <Route path="/tasks/new" element={
                <ProtectedRoute>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Nova Tarefa</h1>
                    <p className="text-gray-600">Formulário para nova tarefa em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } />

              {/* Páginas de Erro e Legal */}
              
              {/* Páginas legais (futuras) */}
              <Route path="/terms" element={
                <ThemedContainer className="min-h-screen p-6">
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Termos e Condições</h1>
                    <p className="text-gray-600">Termos e condições em desenvolvimento...</p>
                  </div>
                </ThemedContainer>
              } />
              
              <Route path="/privacy" element={
                <ThemedContainer className="min-h-screen p-6">
                  <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
                    <p className="text-gray-600">Política de privacidade em desenvolvimento...</p>
                  </div>
                </ThemedContainer>
              } />

              {/* Página 404 - Deve ser a última rota */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;