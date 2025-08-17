import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from './config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Pages
import LandingPage from './pages/landing/LandingPage';

// Temporary placeholder components (to be created later)
const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Login</h2>
        <p className="mt-2 text-gray-600">Página em desenvolvimento</p>
        <div className="mt-6">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← Voltar à página inicial
          </a>
        </div>
      </div>
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Registo</h2>
        <p className="mt-2 text-gray-600">Página em desenvolvimento</p>
        <div className="mt-6">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← Voltar à página inicial
          </a>
        </div>
      </div>
    </div>
  </div>
);

// Firebase connection test component (temporary)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🏡</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MyImoMate 3.0</h1>
          <p className="text-gray-600 mb-6">CRM Imobiliário - Versão Fresh Start</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-2">Status da Conexão:</div>
            <div className={`font-medium ${
              isLoading ? 'text-blue-600' : 
              connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="font-medium text-blue-900">Framework</div>
              <div className="text-blue-700">React + Vite</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="font-medium text-green-900">Database</div>
              <div className="text-green-700">Firebase</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="font-medium text-purple-900">Styling</div>
              <div className="text-purple-700">Tailwind CSS</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900">Status</div>
              <div className="text-green-600">🟢 Pronto</div>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Landing Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page - Página principal */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Páginas de autenticação */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Teste Firebase - página temporária */}
          <Route path="/firebase-test" element={<FirebaseTest />} />
          
          {/* Dashboard - futuro (redireciona para login por agora) */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          
          {/* Rota catch-all - redireciona para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;