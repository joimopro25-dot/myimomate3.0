// src/pages/profile/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import useProfile, { SUBSCRIPTION_PLANS, PAYMENT_METHODS } from '../../hooks/useProfile';
import { 
  ThemedContainer, 
  ThemedButton, 
  ThemedCard, 
  ThemedHeading, 
  ThemedText,
  ThemedInput
} from '../../components/common/ThemedComponents';

const ProfilePage = () => {
  const { user, userProfile } = useAuth();
  const { theme, isDark } = useTheme();
  const { 
    updateProfile, 
    updateSubscriptionPlan, 
    paymentHistory, 
    checkUsageLimits,
    currentPlan,
    isSubscriptionActive,
    subscriptionEndDate,
    loading,
    updating,
    error 
  } = useProfile();

  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Inicializar dados do formulário
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        company: userProfile.company || '',
        phone: userProfile.phone || '',
        nif: userProfile.nif || '',
        role: userProfile.role || 'consultor',
        department: userProfile.department || '',
        licenseNumber: userProfile.licenseNumber || '',
        address: userProfile.address || {},
        settings: userProfile.settings || {}
      });
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setEditMode(false);
    }
  };

  const handlePlanUpgrade = async (newPlanId) => {
    const result = await updateSubscriptionPlan(newPlanId, {
      paymentMethod: PAYMENT_METHODS.CREDIT_CARD
    });
    
    if (result.success) {
      setShowUpgradeModal(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) date = date.toDate();
    return new Intl.DateTimeFormat('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <ThemedHeading level={2}>Informações Pessoais</ThemedHeading>
        <ThemedButton
          variant={editMode ? 'primary' : 'outline'}
          onClick={editMode ? handleUpdateProfile : () => setEditMode(true)}
          disabled={updating}
        >
          {editMode ? (updating ? 'Salvando...' : 'Salvar') : 'Editar'}
        </ThemedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nome Completo</label>
          {editMode ? (
            <ThemedInput
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          ) : (
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.name || 'Não informado'}
            </ThemedText>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <ThemedText className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600">
            {user?.email} (não editável)
          </ThemedText>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Telefone</label>
          {editMode ? (
            <ThemedInput
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          ) : (
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.phone || 'Não informado'}
            </ThemedText>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Empresa</label>
          {editMode ? (
            <ThemedInput
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            />
          ) : (
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.company || 'Não informado'}
            </ThemedText>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">NIF</label>
          {editMode ? (
            <ThemedInput
              value={formData.nif}
              onChange={(e) => setFormData(prev => ({ ...prev, nif: e.target.value }))}
            />
          ) : (
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.nif || 'Não informado'}
            </ThemedText>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Função</label>
          {editMode ? (
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark() ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="consultor">Consultor Imobiliário</option>
              <option value="mediador">Mediador Imobiliário</option>
              <option value="diretor">Diretor de Agência</option>
              <option value="coordenador">Coordenador</option>
              <option value="owner">Proprietário</option>
            </select>
          ) : (
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.role || 'Consultor'}
            </ThemedText>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <ThemedHeading level={3} className="mb-4">Morada</ThemedHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Rua</label>
            {editMode ? (
              <ThemedInput
                value={formData.address?.street || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, street: e.target.value }
                }))}
              />
            ) : (
              <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {userProfile?.address?.street || 'Não informado'}
              </ThemedText>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cidade</label>
            {editMode ? (
              <ThemedInput
                value={formData.address?.city || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
              />
            ) : (
              <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {userProfile?.address?.city || 'Não informado'}
              </ThemedText>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <ThemedHeading level={2}>Assinatura</ThemedHeading>
        <ThemedButton
          variant="primary"
          onClick={() => setShowUpgradeModal(true)}
        >
          Alterar Plano
        </ThemedButton>
      </div>

      {/* Informações da assinatura atual */}
      <ThemedCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ThemedHeading level={3} className="mb-4">Plano Atual</ThemedHeading>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Plano:</span>
                <span className="font-semibold">{currentPlan?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Preço:</span>
                <span className="font-semibold">€{currentPlan?.price || 0}/mês</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isSubscriptionActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isSubscriptionActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Próxima renovação:</span>
                <span>{formatDate(subscriptionEndDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Renovação automática:</span>
                <span>{userProfile?.subscription?.autoRenew ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>

          <div>
            <ThemedHeading level={3} className="mb-4">Utilização</ThemedHeading>
            <div className="space-y-4">
              {['leads', 'clients', 'visits', 'opportunities', 'deals'].map(feature => {
                const usage = checkUsageLimits(feature);
                return (
                  <div key={feature}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{feature}:</span>
                      <span className={getUsageColor(usage.percentage)}>
                        {usage.used}/{usage.limit === -1 ? '∞' : usage.limit}
                      </span>
                    </div>
                    {usage.limit !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            usage.percentage >= 90 ? 'bg-red-500' :
                            usage.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ThemedCard>

      {/* Funcionalidades do plano */}
      <ThemedCard className="p-6">
        <ThemedHeading level={3} className="mb-4">Funcionalidades Incluídas</ThemedHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {currentPlan?.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <ThemedHeading level={2}>Faturação e Pagamentos</ThemedHeading>

      {/* Informações de faturação */}
      <ThemedCard className="p-6">
        <ThemedHeading level={3} className="mb-4">Informações de Faturação</ThemedHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email de Faturação</label>
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.billing?.billingEmail || user?.email}
            </ThemedText>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.billing?.method === PAYMENT_METHODS.CREDIT_CARD ? 'Cartão de Crédito' :
               userProfile?.billing?.method === PAYMENT_METHODS.MBWAY ? 'MB WAY' :
               'Outro'}
              {userProfile?.billing?.lastFourDigits && ` •••• ${userProfile.billing.lastFourDigits}`}
            </ThemedText>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NIF/NIPC</label>
            <ThemedText className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {userProfile?.billing?.vatNumber || userProfile?.nif || 'Não informado'}
            </ThemedText>
          </div>
        </div>
      </ThemedCard>

      {/* Histórico de pagamentos */}
      <ThemedCard className="p-6">
        <ThemedHeading level={3} className="mb-4">Histórico de Pagamentos</ThemedHeading>
        
        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark() ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="text-left py-3 px-4">Descrição</th>
                  <th className="text-left py-3 px-4">Valor</th>
                  <th className="text-left py-3 px-4">Método</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className={`border-b ${isDark() ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-3 px-4">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {payment.description}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      €{payment.amount}
                    </td>
                    <td className="py-3 px-4">
                      {payment.method === PAYMENT_METHODS.CREDIT_CARD ? 'Cartão de Crédito' :
                       payment.method === PAYMENT_METHODS.MBWAY ? 'MB WAY' :
                       payment.method}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status === 'completed' ? 'Pago' :
                         payment.status === 'pending' ? 'Pendente' : 'Falhado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ThemedText className="text-center py-8 text-gray-500">
            Nenhum pagamento registado
          </ThemedText>
        )}
      </ThemedCard>
    </div>
  );

  const renderUpgradeModal = () => (
    showUpgradeModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <ThemedCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <ThemedHeading level={2}>Alterar Plano de Assinatura</ThemedHeading>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                <ThemedCard 
                  key={plan.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    userProfile?.subscription?.plan === plan.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : ''
                  } ${plan.popular ? 'border-2 border-blue-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full text-center mb-4">
                      Mais Popular
                    </div>
                  )}
                  
                  <div className="text-center">
                    <ThemedHeading level={3} className="mb-2">
                      {plan.name}
                    </ThemedHeading>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold">€{plan.price}</span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    
                    <ul className="space-y-2 text-sm text-left mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {userProfile?.subscription?.plan === plan.id ? (
                      <ThemedButton variant="outline" disabled>
                        Plano Atual
                      </ThemedButton>
                    ) : (
                      <ThemedButton 
                        onClick={() => handlePlanUpgrade(plan.id)}
                        disabled={updating}
                        className="w-full"
                      >
                        {updating ? 'Alterando...' : 'Selecionar'}
                      </ThemedButton>
                    )}
                  </div>
                </ThemedCard>
              ))}
            </div>
          </div>
        </ThemedCard>
      </div>
    )
  );

  return (
    <ThemedContainer className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <ThemedHeading level={1} className="mb-2">
            Gestão de Perfil
          </ThemedHeading>
          <ThemedText className="text-gray-600">
            Gerir informações pessoais, assinatura e configurações
          </ThemedText>
        </div>

        {/* Tabs de navegação */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', label: 'Perfil', icon: '👤' },
                { id: 'subscription', label: 'Assinatura', icon: '💳' },
                { id: 'billing', label: 'Faturação', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo das tabs */}
        <div>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'billing' && renderBillingTab()}
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}

        {/* Modal de upgrade */}
        {renderUpgradeModal()}
      </div>
    </ThemedContainer>
  );
};

export default ProfilePage;