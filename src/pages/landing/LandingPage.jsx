// src/pages/landing/LandingPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ThemedContainer, 
  ThemedButton, 
  ThemedCard, 
  ThemedHeading, 
  ThemedText,
  ThemedGradient,
  ThemedBadge
} from '../../components/common/ThemedComponents';
import ThemeSelector from '../../components/common/ThemeSelector';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, isDark, currentTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemedContainer background={false} className="min-h-screen">
      {/* Background com Gradiente Temático */}
      <ThemedGradient 
        type="secondary" 
        className={`min-h-screen ${
          isDark() ? 'from-gray-900 via-gray-800 to-black' : 'from-blue-50 to-indigo-100'
        }`}
      >
        {/* Header Navigation */}
        <header className={`
          fixed top-0 w-full z-50 transition-all duration-300 
          ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}
          ${isDark() && isScrolled ? 'bg-gray-900/95 border-b border-gray-700' : ''}
        `}>
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThemedGradient 
                  type="primary" 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white font-bold text-xl">🏡</span>
                </ThemedGradient>
                <ThemedHeading level={2} className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MyImoMate 3.0
                </ThemedHeading>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className={`transition-colors ${
                  isDark() ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Funcionalidades
                </a>
                <a href="#pricing" className={`transition-colors ${
                  isDark() ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Preços
                </a>
                <a href="#testimonials" className={`transition-colors ${
                  isDark() ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Testemunhos
                </a>
                <Link 
                  to="/login" 
                  className={`transition-colors ${
                    isDark() ? 'text-yellow-400 hover:text-yellow-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Entrar
                </Link>
                <ThemedButton variant="primary" size="sm">
                  <Link to="/register">Começar Grátis</Link>
                </ThemedButton>
                
                {/* Seletor de Temas */}
                <ThemeSelector compact={true} showLabel={false} />
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              {/* Badge do Tema Atual */}
              <div className="mb-6">
                <ThemedBadge variant="primary" size="md">
                  🎨 Tema {theme.name} Ativo
                </ThemedBadge>
              </div>

              <ThemedHeading level={1} className={`mb-6 leading-tight ${
                isDark() ? 'text-white' : 'text-gray-900'
              }`}>
                O CRM que revoluciona
                <ThemedGradient 
                  type="primary" 
                  className="bg-clip-text text-transparent block mt-2"
                >
                  o seu negócio imobiliário
                </ThemedGradient>
              </ThemedHeading>
              
              <ThemedText size="xl" className={`mb-8 leading-relaxed ${
                isDark() ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Gerencie leads, clientes, visitas e negócios numa só plataforma. 
                Desde o primeiro contacto até ao fecho do negócio.
              </ThemedText>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <ThemedButton variant="primary" size="lg">
                  <Link to="/register">Começar Teste Grátis</Link>
                </ThemedButton>
                <ThemedButton variant="secondary" size="lg">
                  Ver Demo
                </ThemedButton>
              </div>
              
              <div className={`flex items-center justify-center space-x-8 text-sm ${
                isDark() ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {[
                  'Teste grátis 14 dias',
                  'Sem compromisso', 
                  'Setup em 5 minutos'
                ].map((text, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`py-20 ${
          isDark() ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <ThemedHeading level={2} className={`mb-4 ${
                isDark() ? 'text-white' : 'text-gray-900'
              }`}>
                Tudo o que precisa num só lugar
              </ThemedHeading>
              <ThemedText size="xl" className={`max-w-2xl mx-auto ${
                isDark() ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Desde a captação de leads até ao fecho de negócios, gerencie todo o seu pipeline imobiliário
              </ThemedText>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📋',
                  title: 'Gestão de Leads',
                  description: 'Capture e converta leads rapidamente. Sistema de qualificação automática e follow-up inteligente.',
                },
                {
                  icon: '🏠', 
                  title: 'Agendamento de Visitas',
                  description: 'Agende visitas com confirmação dupla, lembretes automáticos e gestão de partilhas entre consultores.',
                },
                {
                  icon: '💼',
                  title: 'Pipeline de Vendas', 
                  description: 'Acompanhe cada negócio desde a proposta até à escritura. Fases personalizáveis por tipo de cliente.',
                }
              ].map((feature, index) => (
                <ThemedCard key={index} className="text-center hover:shadow-xl transition-shadow">
                  <ThemedGradient 
                    type="primary"
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                  </ThemedGradient>
                  <ThemedHeading level={3} className={`mb-4 ${
                    isDark() ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </ThemedHeading>
                  <ThemedText className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                    {feature.description}
                  </ThemedText>
                </ThemedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className={`py-20 ${
          isDark() ? 'bg-gray-900/50' : 'bg-gray-50'
        }`}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <ThemedHeading level={2} className={`mb-4 ${
                isDark() ? 'text-white' : 'text-gray-900'
              }`}>
                Planos que se adaptam ao seu negócio
              </ThemedHeading>
              <ThemedText size="xl" className={`max-w-2xl mx-auto ${
                isDark() ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Escolha o plano ideal para o tamanho da sua equipa e necessidades
              </ThemedText>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: '29€',
                  period: '/mês',
                  description: 'Perfeito para consultores independentes',
                  features: [
                    'Até 500 leads',
                    'Gestão de clientes ilimitada',
                    'Agendamento de visitas',
                    'Suporte por email',
                    'App mobile'
                  ],
                  popular: false
                },
                {
                  name: 'Professional',
                  price: '79€',
                  period: '/mês',
                  description: 'Ideal para equipas pequenas e médias',
                  features: [
                    'Leads ilimitados',
                    'Automação de workflows',
                    'Relatórios avançados',
                    'Integração WhatsApp',
                    'Suporte prioritário',
                    'Google Drive integrado'
                  ],
                  popular: true
                },
                {
                  name: 'Enterprise',
                  price: '149€',
                  period: '/mês',
                  description: 'Para grandes equipas e redes',
                  features: [
                    'Tudo do Professional',
                    'Multi-agências',
                    'API personalizada',
                    'Suporte 24/7',
                    'Treinamento dedicado',
                    'Customizações especiais'
                  ],
                  popular: false
                }
              ].map((plan, index) => (
                <ThemedCard 
                  key={index} 
                  className={`relative text-center ${
                    plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <ThemedBadge variant="primary" size="sm">
                        Mais Popular
                      </ThemedBadge>
                    </div>
                  )}
                  
                  <ThemedHeading level={3} className={`mb-2 ${
                    isDark() ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </ThemedHeading>
                  
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${
                      isDark() ? 'text-white' : 'text-gray-900'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg ${
                      isDark() ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {plan.period}
                    </span>
                  </div>
                  
                  <ThemedText className={`mb-6 ${
                    isDark() ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {plan.description}
                  </ThemedText>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <ThemedText size="sm" className={
                          isDark() ? 'text-gray-300' : 'text-gray-600'
                        }>
                          {feature}
                        </ThemedText>
                      </li>
                    ))}
                  </ul>
                  
                  <ThemedButton 
                    variant={plan.popular ? "primary" : "secondary"} 
                    size="lg" 
                    className="w-full"
                  >
                    <Link to="/register">Começar Agora</Link>
                  </ThemedButton>
                </ThemedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className={`py-20 ${
          isDark() ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <ThemedHeading level={2} className={`mb-4 ${
                isDark() ? 'text-white' : 'text-gray-900'
              }`}>
                O que dizem os nossos clientes
              </ThemedHeading>
              <ThemedText size="xl" className={`max-w-2xl mx-auto ${
                isDark() ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Consultores imobiliários que transformaram os seus resultados
              </ThemedText>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Maria Silva',
                  role: 'Consultora Imobiliária',
                  company: 'Silva & Associados',
                  testimonial: 'Aumentei as minhas vendas em 40% no primeiro trimestre. O sistema de follow-up automático é fantástico!',
                  rating: 5
                },
                {
                  name: 'João Santos',
                  role: 'Diretor Comercial',
                  company: 'Imobiliária Porto',
                  testimonial: 'A nossa equipa consegue agendar 3x mais visitas desde que começámos a usar o MyImoMate. Imprescindível!',
                  rating: 5
                },
                {
                  name: 'Ana Costa',
                  role: 'Mediadora Certificada',
                  company: 'Costa Properties',
                  testimonial: 'Finalmente um CRM feito por quem percebe do negócio imobiliário. Cada funcionalidade faz sentido!',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <ThemedCard key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <ThemedText className={`mb-6 italic ${
                    isDark() ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    "{testimonial.testimonial}"
                  </ThemedText>
                  
                  <div>
                    <ThemedHeading level={4} className={`mb-1 ${
                      isDark() ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.name}
                    </ThemedHeading>
                    <ThemedText size="sm" className={
                      isDark() ? 'text-gray-400' : 'text-gray-500'
                    }>
                      {testimonial.role}
                    </ThemedText>
                    <ThemedText size="sm" className={`font-medium ${
                      isDark() ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {testimonial.company}
                    </ThemedText>
                  </div>
                </ThemedCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <ThemedGradient type="primary" className="py-20">
          <div className="container mx-auto px-6 text-center">
            <ThemedHeading level={2} className="text-white mb-6">
              Pronto para revolucionar o seu negócio?
            </ThemedHeading>
            <ThemedText size="xl" className="text-white/90 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de consultores imobiliários que já aumentaram as suas vendas com o MyImoMate
            </ThemedText>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ThemedButton 
                variant="secondary" 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link to="/register">Começar Agora - É Grátis</Link>
              </ThemedButton>
              <ThemedButton 
                variant="accent"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600"
              >
                Agendar Demo
              </ThemedButton>
            </div>
          </div>
        </ThemedGradient>

        {/* Footer */}
        <footer className={`py-12 ${
          isDark() ? 'bg-black text-white' : 'bg-gray-900 text-white'
        }`}>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <ThemedGradient 
                  type="primary"
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white font-bold">🏡</span>
                </ThemedGradient>
                <ThemedHeading level={3} className="text-white">
                  MyImoMate 3.0
                </ThemedHeading>
              </div>
              
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
                <a href="#" className="hover:text-white transition-colors">Termos de Serviço</a>
                <a href="#" className="hover:text-white transition-colors">Contacto</a>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 MyImoMate 3.0. Todos os direitos reservados.</p>
              <p className="mt-2">🎨 Sistema de 6 Temas Ativo - Tema: {theme.name}</p>
            </div>
          </div>
        </footer>
      </ThemedGradient>
    </ThemedContainer>
  );
};

export default LandingPage;