// src/pages/configurations/ConfigurationsPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ Sistema completo de configurações e preferências
// ✅ Interface profissional com gestão de settings

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton, ThemedInput } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CogIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta
const CompactMetricCard = ({ title, value, trend, icon: Icon, color, onClick }) => {
  const { theme, isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark() ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600',
    green: isDark() ? 'from-green-600 to-green-700' : 'from-green-500 to-green-600',
    yellow: isDark() ? 'from-yellow-600 to-yellow-700' : 'from-yellow-500 to-yellow-600',
    purple: isDark() ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600',
    red: isDark() ? 'from-red-600 to-red-700' : 'from-red-500 to-red-600'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-r ${colorClasses[color]} p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs opacity-75 mt-1">{trend}</p>
          )}
        </div>
        <Icon className="h-8 w-8 text-white opacity-80" />
      </div>
    </div>
  );
};

const ConfigurationsPage = () => {
  // Estados locais
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados de configuração
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '+351 912 345 678',
    company: 'Silva Imóveis',
    nif: '123456789',
    address: 'Rua da Liberdade, 123',
    city: 'Lisboa',
    postalCode: '1250-096',
    bio: 'Consultor imobiliário especializado em propriedades de luxo'
  });

  const [notifications, setNotifications] = useState({
    email: {
      newLeads: true,
      taskReminders: true,
      visitScheduled: true,
      dealUpdates: true,
      weeklyReport: false
    },
    push: {
      newLeads: true,
      taskReminders: true,
      visitScheduled: false,
      dealUpdates: true,
      weeklyReport: false
    },
    sms: {
      newLeads: false,
      taskReminders: true,
      visitScheduled: true,
      dealUpdates: false,
      weeklyReport: false
    }
  });

  const [preferences, setPreferences] = useState({
    language: 'pt',
    timezone: 'Europe/Lisbon',
    dateFormat: 'dd/mm/yyyy',
    currency: 'EUR',
    startPage: 'dashboard',
    itemsPerPage: 25,
    autoSave: true,
    darkMode: false
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '2025-06-15',
    sessionTimeout: 480, // minutos
    loginNotifications: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Hooks
  const navigate = useNavigate();
  const { theme, isDark, currentTheme, changeTheme } = useTheme();
  const { currentUser } = useAuth();

  // 🔧 HANDLERS
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFeedbackMessage('Perfil atualizado com sucesso!');
      setFeedbackType('success');
    } catch (error) {
      setFeedbackMessage('Erro ao atualizar perfil: ' + error.message);
      setFeedbackType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeedbackMessage('Notificações atualizadas com sucesso!');
      setFeedbackType('success');
    } catch (error) {
      setFeedbackMessage('Erro ao atualizar notificações: ' + error.message);
      setFeedbackType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeedbackMessage('Preferências atualizadas com sucesso!');
      setFeedbackType('success');
    } catch (error) {
      setFeedbackMessage('Erro ao atualizar preferências: ' + error.message);
      setFeedbackType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedbackMessage('As senhas não coincidem');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setFeedbackMessage('A senha deve ter pelo menos 8 caracteres');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFeedbackMessage('Senha alterada com sucesso!');
      setFeedbackType('success');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setFeedbackMessage('Erro ao alterar senha: ' + error.message);
      setFeedbackType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
      setFeedbackMessage(security.twoFactorEnabled ? 
        'Autenticação de dois fatores desabilitada' : 
        'Autenticação de dois fatores habilitada'
      );
      setFeedbackType('success');
    } catch (error) {
      setFeedbackMessage('Erro ao alterar configuração de segurança');
      setFeedbackType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackMessage(''), 3000);
    }
  };

  // Estatísticas das configurações
  const configStats = {
    profileComplete: Math.round((Object.values(profileData).filter(v => v && v.trim() !== '').length / Object.keys(profileData).length) * 100),
    notificationsActive: Object.values(notifications).reduce((acc, type) => 
      acc + Object.values(type).filter(Boolean).length, 0
    ),
    securityScore: (security.twoFactorEnabled ? 25 : 0) + 
                   (security.loginNotifications ? 25 : 0) + 
                   (security.sessionTimeout <= 480 ? 25 : 0) + 25, // base score
    lastActivity: 'Hoje às 11:30'
  };

  // Tabs de navegação
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: UserCircleIcon },
    { id: 'notifications', label: 'Notificações', icon: BellIcon },
    { id: 'preferences', label: 'Preferências', icon: CogIcon },
    { id: 'security', label: 'Segurança', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Aparência', icon: PaintBrushIcon }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🎨 SIDEBAR REUTILIZÁVEL */}
      <Sidebar />

      {/* 📱 CONTEÚDO PRINCIPAL */}
      <div className="flex-1 ml-64"> {/* ml-64 para compensar sidebar fixa */}
        <ThemedContainer className="p-6">
          {/* 📊 HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h1>
              <p className="text-gray-600">Gerencie suas preferências e configurações da conta</p>
            </div>

            <div className="flex space-x-3">
              <ThemedButton
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="flex items-center"
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Alterar Senha
              </ThemedButton>
            </div>
          </div>

          {/* FEEDBACK MESSAGES */}
          {feedbackMessage && (
            <div className={`p-4 rounded-lg mb-6 ${
              feedbackType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {feedbackMessage}
            </div>
          )}

          {/* 📊 MÉTRICAS COMPACTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CompactMetricCard
              title="Perfil Completo"
              value={`${configStats.profileComplete}%`}
              trend="Informações preenchidas"
              icon={UserCircleIcon}
              color="blue"
              onClick={() => setActiveTab('profile')}
            />
            
            <CompactMetricCard
              title="Notificações"
              value={configStats.notificationsActive}
              trend="Tipos ativos"
              icon={BellIcon}
              color="green"
              onClick={() => setActiveTab('notifications')}
            />
            
            <CompactMetricCard
              title="Segurança"
              value={`${configStats.securityScore}%`}
              trend="Score de proteção"
              icon={ShieldCheckIcon}
              color="purple"
              onClick={() => setActiveTab('security')}
            />
            
            <CompactMetricCard
              title="Última Atividade"
              value="Hoje"
              trend="11:30"
              icon={GlobeAltIcon}
              color="yellow"
              onClick={() => setActiveTab('preferences')}
            />
          </div>

          {/* 🏷️ TABS DE NAVEGAÇÃO */}
          <ThemedCard className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </ThemedCard>

          {/* 📊 CONTEÚDO DAS TABS */}
          {activeTab === 'profile' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Informações do Perfil</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ThemedInput
                    label="Nome Completo"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                  
                  <ThemedInput
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                  
                  <ThemedInput
                    label="Telefone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                  
                  <ThemedInput
                    label="Empresa"
                    value={profileData.company}
                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  />
                  
                  <ThemedInput
                    label="NIF"
                    value={profileData.nif}
                    onChange={(e) => setProfileData({...profileData, nif: e.target.value})}
                  />
                  
                  <ThemedInput
                    label="Código Postal"
                    value={profileData.postalCode}
                    onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                  />
                  
                  <div className="md:col-span-2">
                    <ThemedInput
                      label="Morada"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    />
                  </div>
                  
                  <ThemedInput
                    label="Cidade"
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  />
                  
                  <div className="md:col-span-2">
                    <ThemedInput
                      label="Biografia"
                      type="textarea"
                      rows="3"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Descreva sua experiência e especialidades..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <ThemedButton
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Salvar Perfil
                      </>
                    )}
                  </ThemedButton>
                </div>
              </div>
            </ThemedCard>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Notificações por Email */}
              <ThemedCard>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold">Notificações por Email</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotifications(prev => ({
                              ...prev,
                              email: { ...prev.email, [key]: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </ThemedCard>

              {/* Notificações Push */}
              <ThemedCard>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <BellIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold">Notificações Push</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotifications(prev => ({
                              ...prev,
                              push: { ...prev.push, [key]: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </ThemedCard>

              <div className="flex justify-end">
                <ThemedButton
                  onClick={handleSaveNotifications}
                  disabled={loading}
                >
                  Salvar Notificações
                </ThemedButton>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Preferências Gerais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pt">Português</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Data</label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dd/mm/yyyy">DD/MM/AAAA</option>
                      <option value="mm/dd/yyyy">MM/DD/AAAA</option>
                      <option value="yyyy-mm-dd">AAAA-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar ($)</option>
                      <option value="GBP">Libra (£)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Página Inicial</label>
                    <select
                      value={preferences.startPage}
                      onChange={(e) => setPreferences({...preferences, startPage: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dashboard">Dashboard</option>
                      <option value="leads">Leads</option>
                      <option value="calendar">Calendário</option>
                      <option value="tasks">Tarefas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Itens por Página</label>
                    <select
                      value={preferences.itemsPerPage}
                      onChange={(e) => setPreferences({...preferences, itemsPerPage: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Salvamento Automático</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={(e) => setPreferences({...preferences, autoSave: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <ThemedButton
                    onClick={handleSavePreferences}
                    disabled={loading}
                  >
                    Salvar Preferências
                  </ThemedButton>
                </div>
              </div>
            </ThemedCard>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Configurações de Segurança */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Configurações de Segurança</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                        <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                      </div>
                      <ThemedButton
                        onClick={handleToggle2FA}
                        variant={security.twoFactorEnabled ? "outline" : "primary"}
                        disabled={loading}
                      >
                        {security.twoFactorEnabled ? 'Desabilitar' : 'Habilitar'}
                      </ThemedButton>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Timeout de Sessão</h4>
                        <p className="text-sm text-gray-500">Tempo limite de inatividade</p>
                      </div>
                      <select
                        value={security.sessionTimeout}
                        onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={60}>1 hora</option>
                        <option value={240}>4 horas</option>
                        <option value={480}>8 horas</option>
                        <option value={1440}>24 horas</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notificações de Login</h4>
                        <p className="text-sm text-gray-500">Receber notificações de novos logins</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.loginNotifications}
                          onChange={(e) => setSecurity({...security, loginNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </ThemedCard>

              {/* Informações de Segurança */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Informações de Segurança</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Última alteração de senha:</span>
                      <span className="text-sm font-medium">{new Date(security.lastPasswordChange).toLocaleDateString('pt-PT')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status da conta:</span>
                      <span className="text-sm font-medium text-green-600">Ativa e Segura</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Score de segurança:</span>
                      <span className="text-sm font-medium">{configStats.securityScore}%</span>
                    </div>
                  </div>
                </div>
              </ThemedCard>
            </div>
          )}

          {activeTab === 'appearance' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Aparência e Temas</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Tema Atual: {currentTheme}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['light', 'dark', 'blue', 'green', 'purple', 'red'].map((themeName) => (
                        <button
                          key={themeName}
                          onClick={() => changeTheme(themeName)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            currentTheme === themeName
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium capitalize">{themeName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {themeName === 'light' && 'Tema claro padrão'}
                            {themeName === 'dark' && 'Tema escuro elegante'}
                            {themeName === 'blue' && 'Azul profissional'}
                            {themeName === 'green' && 'Verde natural'}
                            {themeName === 'purple' && 'Roxo criativo'}
                            {themeName === 'red' && 'Vermelho dinâmico'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t">
                    <p className="text-sm text-gray-500">
                      O tema será aplicado imediatamente e salvo nas suas preferências.
                    </p>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {/* MODAL DE ALTERAÇÃO DE SENHA */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Alterar Senha</h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      minLength="8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      minLength="8"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <ThemedButton
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      Cancelar
                    </ThemedButton>
                    <ThemedButton
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Alterando...' : 'Alterar Senha'}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </div>
          )}

        </ThemedContainer>
      </div>
    </div>
  );
};

export default ConfigurationsPage;