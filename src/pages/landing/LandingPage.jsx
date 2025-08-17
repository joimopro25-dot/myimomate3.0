import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🏡</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MyImoMate 3.0
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Preços
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">
                Testemunhos
              </a>
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Entrar
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              O CRM que revoluciona
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                o seu negócio imobiliário
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Gerencie leads, clientes, visitas e negócios numa só plataforma. 
              Desde o primeiro contacto até ao fecho do negócio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Começar Teste Grátis
              </Link>
              <button className="text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200">
                Ver Demo
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Teste grátis 14 dias</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Setup em 5 minutos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo o que precisa num só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde a captação de leads até ao fecho de negócios, gerencie todo o seu pipeline imobiliário
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Gestão de Leads</h3>
              <p className="text-gray-600">
                Capture e converta leads rapidamente. Sistema de qualificação automática e follow-up inteligente.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Agendamento de Visitas</h3>
              <p className="text-gray-600">
                Agende visitas com confirmação dupla, lembretes automáticos e gestão de partilhas entre consultores.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Pipeline de Vendas</h3>
              <p className="text-gray-600">
                Acompanhe cada negócio desde a proposta até à escritura. Fases personalizáveis por tipo de cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para revolucionar o seu negócio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de consultores imobiliários que já aumentaram as suas vendas com o MyImoMate
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Começar Agora - É Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🏡</span>
              </div>
              <span className="text-xl font-bold">MyImoMate 3.0</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos de Serviço</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 MyImoMate 3.0. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;