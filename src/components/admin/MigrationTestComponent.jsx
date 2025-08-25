// src/components/admin/MigrationTestComponent.jsx
// COMPONENTE PARA TESTAR MIGRAÇÃO MULTI-TENANT
// ============================================
// Interface administrativa para executar e monitorizar migração
// Usar APENAS em ambiente de desenvolvimento/teste

import React, { useState } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  DocumentMagnifyingGlassIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { 
  executeMigration, 
  auditData, 
  validateMigration, 
  cleanupOldData 
} from '../../utils/migrationScript';

const MigrationTestComponent = () => {
  const [migrationStatus, setMigrationStatus] = useState('ready');
  const [migrationResults, setMigrationResults] = useState(null);
  const [auditResults, setAuditResults] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState('');

  // Adicionar log
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Executar auditoria
  const handleAudit = async () => {
    setMigrationStatus('auditing');
    setCurrentStep('Executando auditoria dos dados...');
    addLog('Iniciando auditoria dos dados existentes', 'info');

    try {
      const results = await auditData();
      setAuditResults(results);
      addLog('Auditoria concluída com sucesso', 'success');
      setMigrationStatus('audit-complete');
    } catch (error) {
      addLog(`Erro na auditoria: ${error.message}`, 'error');
      setMigrationStatus('error');
    } finally {
      setCurrentStep('');
    }
  };

  // Executar migração
  const handleMigration = async (dryRun = true) => {
    setMigrationStatus('migrating');
    setCurrentStep(`Executando migração (${dryRun ? 'DRY RUN' : 'REAL'})...`);
    addLog(`Iniciando migração - Modo: ${dryRun ? 'Simulação' : 'Execução real'}`, 'info');

    try {
      const results = await executeMigration();
      setMigrationResults(results);
      
      if (results.success) {
        addLog('Migração concluída com sucesso', 'success');
        setMigrationStatus('migration-complete');
      } else {
        addLog(`Migração falhou: ${results.error}`, 'error');
        setMigrationStatus('error');
      }
    } catch (error) {
      addLog(`Erro na migração: ${error.message}`, 'error');
      setMigrationStatus('error');
    } finally {
      setCurrentStep('');
    }
  };

  // Validar migração
  const handleValidation = async () => {
    setMigrationStatus('validating');
    setCurrentStep('Validando dados migrados...');
    addLog('Iniciando validação da migração', 'info');

    try {
      const results = await validateMigration();
      setValidationResults(results);
      addLog('Validação concluída', 'success');
      setMigrationStatus('validation-complete');
    } catch (error) {
      addLog(`Erro na validação: ${error.message}`, 'error');
      setMigrationStatus('error');
    } finally {
      setCurrentStep('');
    }
  };

  // Limpar dados antigos
  const handleCleanup = async () => {
    const confirmed = window.confirm(
      'ATENÇÃO: Esta operação eliminará PERMANENTEMENTE todos os dados antigos. ' +
      'Tem a certeza absoluta que quer continuar?'
    );

    if (!confirmed) {
      addLog('Limpeza cancelada pelo utilizador', 'info');
      return;
    }

    setMigrationStatus('cleaning');
    setCurrentStep('Eliminando dados antigos...');
    addLog('ATENÇÃO: Iniciando eliminação de dados antigos', 'warning');

    try {
      const results = await cleanupOldData();
      addLog('Limpeza concluída', 'success');
      setMigrationStatus('cleanup-complete');
    } catch (error) {
      addLog(`Erro na limpeza: ${error.message}`, 'error');
      setMigrationStatus('error');
    } finally {
      setCurrentStep('');
    }
  };

  // Reset do componente
  const handleReset = () => {
    setMigrationStatus('ready');
    setMigrationResults(null);
    setAuditResults(null);
    setValidationResults(null);
    setLogs([]);
    setCurrentStep('');
    addLog('Interface reiniciada', 'info');
  };

  // Componente de botão de ação
  const ActionButton = ({ onClick, icon: Icon, children, disabled, variant = 'primary', danger = false }) => {
    const baseClasses = "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    let variantClasses = "";
    if (danger) {
      variantClasses = "border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500";
    } else if (variant === 'secondary') {
      variantClasses = "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500";
    } else {
      variantClasses = "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    }

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses}`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {children}
      </button>
    );
  };

  // Componente de log
  const LogEntry = ({ log }) => {
    const typeColors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };

    return (
      <div className={`text-sm ${typeColors[log.type]}`}>
        <span className="text-gray-500">{log.timestamp}</span> - {log.message}
      </div>
    );
  };

  const isWorking = ['auditing', 'migrating', 'validating', 'cleaning'].includes(migrationStatus);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>AVISO:</strong> Este é um componente administrativo para migração multi-tenant. 
              Use apenas em ambiente de desenvolvimento/teste com backup da base de dados.
            </p>
          </div>
        </div>
      </div>

      {/* Status atual */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Status da Migração</h2>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            migrationStatus === 'ready' ? 'bg-gray-100 text-gray-800' :
            migrationStatus === 'error' ? 'bg-red-100 text-red-800' :
            isWorking ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {migrationStatus}
          </div>
          {currentStep && (
            <div className="text-sm text-gray-600">
              {currentStep}
            </div>
          )}
          {isWorking && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          )}
        </div>
      </div>

      {/* Ações principais */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ações de Migração</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Auditoria */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">1. Auditoria</h3>
            <p className="text-sm text-gray-600 mb-3">
              Analisar estrutura atual dos dados sem fazer alterações.
            </p>
            <ActionButton
              onClick={handleAudit}
              icon={DocumentMagnifyingGlassIcon}
              disabled={isWorking}
              variant="secondary"
            >
              Executar Auditoria
            </ActionButton>
          </div>

          {/* Migração DRY RUN */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">2. Migração (Simulação)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Simular migração sem fazer alterações reais.
            </p>
            <ActionButton
              onClick={() => handleMigration(true)}
              icon={PlayIcon}
              disabled={isWorking}
            >
              Simular Migração
            </ActionButton>
          </div>

          {/* Migração Real */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">3. Migração (Real)</h3>
            <p className="text-sm text-gray-600 mb-3">
              EXECUTAR migração real - altera dados permanentemente.
            </p>
            <ActionButton
              onClick={() => handleMigration(false)}
              icon={PlayIcon}
              disabled={isWorking}
              danger
            >
              Executar Migração
            </ActionButton>
          </div>

          {/* Validação */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">4. Validação</h3>
            <p className="text-sm text-gray-600 mb-3">
              Verificar integridade dos dados migrados.
            </p>
            <ActionButton
              onClick={handleValidation}
              icon={CheckCircleIcon}
              disabled={isWorking}
              variant="secondary"
            >
              Validar Migração
            </ActionButton>
          </div>

          {/* Limpeza */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">5. Limpeza</h3>
            <p className="text-sm text-gray-600 mb-3">
              ELIMINAR dados antigos (irreversível).
            </p>
            <ActionButton
              onClick={handleCleanup}
              icon={TrashIcon}
              disabled={isWorking}
              danger
            >
              Limpar Dados Antigos
            </ActionButton>
          </div>

          {/* Reset */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Reset</h3>
            <p className="text-sm text-gray-600 mb-3">
              Limpar interface e reiniciar.
            </p>
            <ActionButton
              onClick={handleReset}
              icon={ArrowPathIcon}
              disabled={isWorking}
              variant="secondary"
            >
              Reiniciar Interface
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {(migrationResults || auditResults || validationResults) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resultados</h2>
          
          {migrationResults && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Migração:</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(migrationResults, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {auditResults && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Auditoria:</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(auditResults, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {validationResults && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Validação:</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(validationResults, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Logs</h2>
          <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <LogEntry key={index} log={log} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationTestComponent;
