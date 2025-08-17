import { useEffect, useState } from 'react';
import { db } from './config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function App() {
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
    <div className="container">
      <div className="card">
        <div className="logo">🏡</div>
        <h1 className="title">MyImoMate 3.0</h1>
        <div className="subtitle">CRM Imobiliário - Versão Fresh Start</div>
        
        <div className="status-box">
          <div className="status-label">Status da Conexão:</div>
          <div className={`status-text ${isLoading ? 'status-loading' : connectionStatus.includes('✅') ? 'status-success' : 'status-error'}`}>
            {connectionStatus}
          </div>
        </div>

        <div className="grid">
          <div className="grid-item">
            <div className="grid-label">Framework</div>
            <div>React + Vite</div>
          </div>
          <div className="grid-item">
            <div className="grid-label">Database</div>
            <div>Firebase</div>
          </div>
          <div className="grid-item">
            <div className="grid-label">Styling</div>
            <div>CSS Normal</div>
          </div>
          <div className="grid-item">
            <div className="grid-label">Status</div>
            <div className="status-ready">🟢 Pronto</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;