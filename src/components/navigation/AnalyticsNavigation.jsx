// src/components/navigation/AnalyticsNavigation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon, BoltIcon } from '@heroicons/react/24/outline';

/**
 * Componente de navegação para Analytics e Automações
 * Pode ser inserido em qualquer página
 */
const AnalyticsNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Card Analytics */}
      <div 
        onClick={() => navigate('/analytics')}
        className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
      >
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg">
            <ChartBarIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Analytics & IA</h3>
            <p className="text-gray-600">Dashboard executivo com insights</p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-purple-600 font-medium">
          <span>Ir para Analytics</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Card Automações */}
      <div 
        onClick={() => navigate('/automations')}
        className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
      >
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg">
            <BoltIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Automações</h3>
            <p className="text-gray-600">Workflows inteligentes</p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-blue-600 font-medium">
          <span>Configurar Automações</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsNavigation;