# 🏢 MyImoMate 3.0 - CRM Imobiliário

## 📋 VISÃO GERAL DO PROJETO

### 🎯 Conceito
CRM especializado para o setor imobiliário com foco no ciclo completo: Lead → Cliente → Oportunidades → Negócios → Fecho

### 🚀 Fluxo Principal
```
ENTRADA → LEADS → CONVERSÃO RÁPIDA → CLIENTE → OPORTUNIDADES → DEALS → FECHO
```

### 🛠️ Stack Tecnológico
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore + Auth)
- **Routing:** React Router DOM
- **Integrações:** Google Drive, WhatsApp, Email

---

## 🗂️ ESTRUTURA DE NAVEGAÇÃO

### 1. **Dashboard de Planos** (Landing Page)
- Apresentação do CRM
- Planos de subscrição
- Call-to-action para registo

### 2. **Sistema de Autenticação**
- Login/Registo
- Recuperação password
- Gestão de sessão

### 3. **Dashboard Principal** (Após login)
- Resumo de atividade
- Métricas principais (funil de conversão)
- Tarefas pendentes
- Próximas reuniões/eventos

### 4. **Módulos Principais**
- 📋 **Leads** - Gestão de prospects (conversão rápida)
- 🤝 **Clientes** - Base de dados completa
- 🎯 **Oportunidades** - Roles por cliente
- 💼 **Negócios (Deals)** - Pipeline de vendas
- ✅ **Tarefas** - Gestão de atividades
- 📅 **Calendário** - Agenda e eventos

---

## 🎬 CENÁRIOS DO DIA-A-DIA

### **CENÁRIO 1: Cliente Comprador (Fluxo Principal)**
```
Chamada/Contacto → Dados Lead → Interesse Imóvel → Conversão Rápida → Agendamento Visita → Follow-up
```

**Fluxo detalhado:**
1. **Receção prospect** → dados básicos + interesse
2. **Qualificação express** → orçamento, financiamento
3. **Quer visita?** → conversão automática Lead→Cliente+Oportunidade
4. **Agendamento** → inserção manual dados imóvel + consultor
5. **Confirmação dupla** → cliente + consultor responsável
6. **Lembretes** → imediato + 6h antes
7. **Visita realizada** → feedback + próximos passos
8. **Follow-up** → proposta, CPCV, bancário, escritura

### **CENÁRIO 2: Cliente Vendedor (Captação)**
```
Contacto → Avaliação → CMI → Marketing → Visitas → Propostas → Fecho
```

### **CENÁRIO 3: Cliente Inquilino**
```
Procura → Seleção → Visitas → Candidatura → Aprovação → Contrato
```

### **CENÁRIO 4: Cliente Senhorio**
```
Mandato → Preparação → Marketing → Seleção Inquilino → Contrato
```

### **CENÁRIO 5: Cliente Investidor**
```
Estratégia → Análise → Aquisição → Execução (Fix&Flip/Buy&Hold/Buy&Rent)
```

---

## 📊 ESTRUTURA DE DADOS

### 🔍 1. LEADS (Ponto de Entrada)
```javascript
Lead {
  id: String,
  nome: String,
  telefone: String,
  email: String,
  origem: Enum ["Site", "Referência", "Cold Call", "Marketing", "Redes Sociais"],
  interesse_inicial: String,
  
  // ═══ INTERESSE IMOBILIÁRIO ═══
  tipo_interesse: Enum ["Comprar", "Vender", "Arrendar", "Investir"],
  detalhes_interesse: {
    tipo_imovel: String,
    localizacao: String,
    orcamento: Number,
    prazo: String
  },
  
  // ═══ QUALIFICAÇÃO EXPRESS ═══
  financiamento_aprovado: Boolean,
  quer_agendar_visita: Boolean,
  disponibilidade_visitas: String,
  
  status: Enum ["Novo", "Em Contacto", "Qualificado", "Convertido", "Perdido"],
  data_criacao: Date,
  proxima_acao: String,
  data_proxima_acao: Date,
  notas: Text,
  agente_responsavel: String,
  google_drive_folder: String
}
```

### 👤 2. CLIENTES (Dados Completos)
```javascript
Cliente {
  // ═══ IDENTIFICAÇÃO PRINCIPAL ═══
  id: String,
  lead_original_id: String, // null se criado direto
  nome: String,
  telefone: String,
  telefone_secundario: String,
  email: String,
  data_nascimento: Date,
  nif: String,
  cc: String,
  
  // ═══ MORADA ═══
  morada: {
    rua: String,
    numero: String,
    andar: String,
    codigo_postal: String,
    localidade: String,
    distrito: String,
    pais: String
  },
  
  // ═══ ESTADO CIVIL ═══
  estado_civil: Enum ["Solteiro", "Casado", "União de Facto", "Divorciado", "Viúvo"],
  comunhao_bens: Enum ["Comunhão Geral", "Comunhão Acquestos", "Separação de Bens"],
  
  // ═══ CÔNJUGE ═══
  conjuge: {
    cliente_id: String, // Link para outro cliente
    nome: String,
    telefone: String,
    nif: String,
    email: String,
    cc: String
  },
  
  // ═══ DADOS PROFISSIONAIS ═══
  profissao: String,
  empresa: String,
  cargo: String,
  
  // ═══ COMUNICAÇÃO ═══
  metodo_contacto_preferido: Enum ["Email", "Telefone", "WhatsApp", "SMS"],
  melhor_horario: String,
  linkedin: String,
  
  // ═══ GESTÃO ═══
  origem: String,
  agente_responsavel: String,
  data_registo: Date,
  status: Enum ["Ativo", "Inativo", "Blacklist"],
  tags: Array, // ["VIP", "Urgente", etc.]
  notas_gerais: Text,
  
  // ═══ GDPR ═══
  consentimento_marketing: Boolean,
  data_consentimento: Date,
  consentimento_partilha_dados: Boolean,
  
  // ═══ DOCUMENTOS ═══
  google_drive_folder: String
}
```

#### 🔍 **Verificação de Duplicados**
- Verificar por: **NIF**, **Email**, **Telefone**, **CC**
- Alertar se já existe antes de criar
- Opção de "Merge" se encontrar similar

### 💰 3. QUALIFICAÇÃO FINANCEIRA
```javascript
QualificacaoFinanceira {
  cliente_id: String,
  
  // ═══ RENDIMENTOS ═══
  rendimento_liquido_mensal: Number,
  tipo_rendimento: Enum ["Conta Outrem", "Trabalhador Independente", "Empresário", "Reformado", "Outros"],
  empresa_entidade: String,
  antiguidade_emprego: Number, // meses
  
  // ═══ SITUAÇÃO BANCÁRIA ═══
  banco_principal: String,
  tem_financiamentos: Boolean,
  valor_prestacoes_mensais: Number,
  
  // ═══ CAPACIDADE INVESTIMENTO ═══
  capacidade_investimento: Number,
  origem_fundos: String,
  liquidez_disponivel: Number,
  
  // ═══ AVALIAÇÃO ═══
  score_credito: Enum ["A", "B", "C", "D"],
  observacoes_financeiras: Text,
  data_ultima_atualizacao: Date
}
```

### 🎯 4. OPORTUNIDADES (ROLES)
Um cliente pode ter múltiplos roles simultaneamente:

```javascript
Oportunidade {
  id: String,
  cliente_id: String,
  tipo_role: Enum ["Comprador", "Vendedor", "Investidor", "Senhorio", "Inquilino"],
  status: Enum ["Ativa", "Suspensa", "Concluída", "Cancelada"],
  prioridade: Enum ["Alta", "Média", "Baixa"],
  data_criacao: Date,
  descricao: String,
  google_drive_folder: String,
  
  // ═══ QUALIFICAÇÃO ESPECÍFICA POR ROLE ═══
  qualificacao_especifica: {
    // Para COMPRADOR
    orcamento_maximo: Number,
    tipo_imovel_procurado: Array,
    localizacoes_preferidas: Array,
    prazo_compra: String,
    financiamento_aprovado: Boolean,
    
    // Para VENDEDOR  
    imoveis_para_venda: Array,
    expectativa_preco: Number,
    prazo_venda: String,
    motivo_venda: String,
    
    // Para INVESTIDOR
    estrategia_investimento: Array ["Fix&Flip", "Buy&Hold", "Buy&Rent"],
    budget_investimento: Number,
    experiencia_investimento: Enum ["Iniciante", "Intermediário", "Avançado"],
    
    // Para SENHORIO
    imoveis_arrendar: Array,
    tipo_inquilino_preferido: String,
    rendas_esperadas: Number,
    
    // Para INQUILINO
    orcamento_renda: Number,
    tipo_imovel_procurado: String,
    prazo_arrendamento: String,
    fiadores_disponiveis: Boolean
  }
}
```

### 🏠 5. VISITAS (Nova Entidade - Cenário Real)
```javascript
VisitaImovel {
  id: String,
  cliente_id: String,
  oportunidade_id: String,
  
  // ═══ DADOS DO IMÓVEL (INSERÇÃO MANUAL) ═══
  imovel: {
    referencia: String, // opcional
    link_imovel: String, // idealista, imovirtual, etc.
    morada: String,
    tipo: String,
    preco: Number,
    caracteristicas: Text, // campo livre
    observacoes: Text
  },
  
  // ═══ CONSULTOR RESPONSÁVEL (MANUAL) ═══
  consultor_imovel: {
    nome: String,
    telefone: String,
    email: String,
    agencia: String,
    percentagem_partilha: Number, // inserção manual
    condicoes_partilha: Text
  },
  
  // ═══ AGENDAMENTO ═══
  data_hora: DateTime,
  duracao_estimada: Number, // minutos
  status: Enum ["Agendada", "Confirmada", "Realizada", "Cancelada", "Reagendada"],
  
  // ═══ CONFIRMAÇÕES ═══
  confirmada_cliente: Boolean,
  confirmada_consultor_imovel: Boolean,
  data_confirmacao_cliente: Date,
  data_confirmacao_consultor: Date,
  
  // ═══ LEMBRETES (Imediato + 6h antes) ═══
  lembretes: {
    imediato: {
      enviado: Boolean,
      data_envio: Date,
      tipo: Array // ["Email", "WhatsApp"]
    },
    seis_horas_antes: {
      enviado: Boolean,
      data_envio: Date,
      tipo: Array
    }
  },
  
  // ═══ FEEDBACK PÓS-VISITA ═══
  feedback_cliente: {
    interessado: Boolean,
    nivel_interesse: Enum ["Alto", "Médio", "Baixo", "Sem interesse"],
    quer_proposta: Boolean,
    valor_proposta: Number,
    observacoes: Text,
    data_feedback: Date
  },
  
  // ═══ PRÓXIMOS PASSOS ═══
  proximos_passos: Enum ["Aguardar", "Fazer Proposta", "CPCV", "Aprovação Bancária", "Desistiu"],
  
  // ═══ INTEGRAÇÃO ═══
  tarefa_id: String, // tarefa associada
  evento_calendario_id: String,
  
  notas: Text,
  data_criacao: Date
}
```

### 💼 6. NEGÓCIOS (DEALS)
Cada oportunidade pode ter vários deals com fases específicas:

```javascript
Deal {
  id: String,
  oportunidade_id: String,
  titulo: String,
  tipo_negocio: String,
  valor_estimado: Number,
  valor_final: Number,
  
  // ═══ FASES ESPECÍFICAS POR TIPO ═══
  fases_possiveis: Array, // Dependendo do tipo de negócio
  fase_atual: String,
  percentagem_conclusao: Number,
  
  // ═══ DATAS ═══
  data_inicio: Date,
  data_estimada_fecho: Date,
  data_fecho_real: Date,
  
  // ═══ GESTÃO ═══
  status: Enum ["Em Andamento", "Concluído", "Cancelado", "Pausado"],
  agente_responsavel: String,
  comissao_prevista: Number,
  observacoes: Text,
  google_drive_folder: String
}
```

#### **Fases por Tipo de Deal:**

##### 🏠 **VENDEDOR**
1. Avaliação imóvel
2. CMI assinado
3. Fotos/vídeo realizados
4. Em divulgação
5. Visitas agendadas
6. Propostas recebidas
7. Negociação
8. Escritura/Fecho

##### 🔍 **COMPRADOR**
1. Briefing necessidades
2. Seleção imóveis
3. Visitas agendadas
4. Propostas enviadas
5. CPCV assinado
6. Financiamento aprovado
7. Escritura
8. Entrega chaves

##### 💰 **INVESTIDOR**
- **Fix & Flip:** Análise → Compra → Renovação → Venda
- **Buy to Hold:** Análise → Compra → Arrendamento → Gestão
- **Buy to Rent:** Análise → Compra → Preparação → Arrendamento

##### 🏘️ **SENHORIO**
1. Preparação imóvel
2. Definição renda
3. Divulgação
4. Visitas inquilinos
5. Seleção inquilino
6. Contrato arrendamento
7. Gestão corrente

##### 🏡 **INQUILINO**
1. Definição critérios
2. Pesquisa imóveis
3. Visitas
4. Candidatura
5. Aprovação
6. Contrato
7. Entrada imóvel

### 📋 7. FASES DE NEGÓCIO
```javascript
Fase {
  id: String,
  deal_id: String,
  nome_fase: String,
  ordem: Number,
  status: Enum ["Pendente", "Em Andamento", "Concluída", "Bloqueada"],
  data_inicio: Date,
  data_conclusao: Date,
  data_limite: Date,
  responsavel: String,
  documentos_necessarios: Array,
  documentos_anexados: Array,
  checklist: Array,
  notas: Text,
  proxima_acao: String
}
```

### 📞 8. INTERAÇÕES (Nova Entidade)
```javascript
Interacao {
  id: String,
  cliente_id: String,
  lead_id: String,
  deal_id: String,
  visita_id: String,
  
  tipo: Enum ["Chamada", "Email", "WhatsApp", "Reunião", "Visita", "Proposta"],
  assunto: String,
  descricao: Text,
  resultado: Enum ["Positivo", "Neutro", "Negativo", "Sem resposta"],
  
  // ═══ DATAS ═══
  data_interacao: Date,
  duracao: Number, // minutos
  
  // ═══ FOLLOW-UP ═══
  proxima_acao: String,
  data_proxima_acao: Date,
  lembrete_automatico: Boolean,
  
  // ═══ GESTÃO ═══
  agente_responsavel: String,
  canal_comunicacao: String,
  anexos: Array,
  
  notas: Text
}
```

### ✅ 9. TAREFAS
```javascript
Tarefa {
  id: String,
  titulo: String,
  descricao: Text,
  tipo: Enum ["Chamada", "Email", "Reunião", "Documento", "Follow-up", "Visita", "Outros"],
  prioridade: Enum ["Alta", "Média", "Baixa"],
  status: Enum ["Pendente", "Em Andamento", "Concluída", "Cancelada"],
  
  // ═══ RELACIONAMENTOS ═══
  cliente_id: String,
  lead_id: String,
  deal_id: String,
  visita_id: String, // NEW
  
  // ═══ DATAS ═══
  data_criacao: Date,
  data_vencimento: Date,
  data_conclusao: Date,
  
  // ═══ GESTÃO ═══
  agente_responsavel: String,
  agente_criador: String,
  tempo_estimado: Number, // minutos
  tempo_real: Number,
  
  // ═══ RECORRÊNCIA ═══
  recorrente: Boolean,
  frequencia: String,
  
  // ═══ LEMBRETES AUTOMÁTICOS ═══
  lembrete_automatico: Boolean,
  tipo_lembrete: Array, // ["Email", "WhatsApp", "SMS"]
  
  notas: Text
}
```

### 📅 10. CALENDÁRIO
```javascript
Evento {
  id: String,
  titulo: String,
  descricao: Text,
  tipo: Enum ["Reunião", "Visita", "Chamada", "Deadline", "Follow-up"],
  
  // ═══ DATAS ═══
  data_inicio: DateTime,
  data_fim: DateTime,
  dia_completo: Boolean,
  
  // ═══ RELACIONAMENTOS ═══
  cliente_id: String,
  lead_id: String,
  deal_id: String,
  tarefa_id: String,
  visita_id: String, // NEW
  
  // ═══ PARTICIPANTES ═══
  participantes: Array,
  local: String,
  link_reuniao: String,
  
  // ═══ GESTÃO ═══
  agente_responsavel: String,
  status: Enum ["Agendado", "Confirmado", "Realizado", "Cancelado"],
  lembretes: Array,
  
  notas: Text
}
```

### 📝 11. TEMPLATES (Nova Entidade)
```javascript
Template {
  id: String,
  nome: String,
  categoria: String,
  tipo: Enum ["Email", "WhatsApp", "SMS", "Contrato"],
  assunto: String,
  conteudo: Text,
  
  // ═══ VARIÁVEIS DINÂMICAS ═══
  variaveis: Array, // {nome}, {imovel}, {data_visita}, etc.
  
  // ═══ CONTEXTO DE USO ═══
  cenario: Enum [
    "visita_lembrete_imediato",
    "visita_lembrete_6h",
    "feedback_pos_visita",
    "follow_up_lead",
    "confirmacao_visita"
  ],
  
  // ═══ GESTÃO ═══
  ativo: Boolean,
  agente_criador: String,
  data_criacao: Date,
  data_atualizacao: Date
}
```

### 📈 12. LEMBRETES AUTOMÁTICOS
```javascript
Lembrete {
  id: String,
  tipo: Enum ["Email", "WhatsApp", "SMS"],
  destinatario: String,
  assunto: String,
  mensagem: Text,
  
  // ═══ AGENDAMENTO ═══
  data_envio: DateTime,
  enviado: Boolean,
  tentativas: Number,
  
  // ═══ RELACIONAMENTOS ═══
  cliente_id: String,
  visita_id: String,
  tarefa_id: String,
  template_id: String,
  
  // ═══ STATUS ═══
  status: Enum ["Agendado", "Enviado", "Entregue", "Lido", "Erro"],
  erro_mensagem: String,
  
  data_criacao: Date
}
```

---

## 🔗 INTEGRAÇÕES

### **Google Drive**
- **Pasta por Lead** - Documentos de qualificação
- **Pasta por Cliente** - Documentos pessoais, financeiros
- **Pasta por Oportunidade** - Documentos específicos do role
- **Pasta por Deal** - Contratos, propostas, documentação legal
- **Pasta por Visita** - Documentos específicos do imóvel

### **WhatsApp Business API**
- Lembretes automáticos
- Notificações de visitas
- Follow-up personalizado

### **Email (SMTP)**
- Templates personalizados
- Lembretes automáticos
- Relatórios periódicos

### **Google Calendar** (Futuro)
- Sincronização eventos
- Lembretes nativos

---

## 📱 FUNCIONALIDADES PRINCIPAIS

### **Dashboard Analítico**
- Funil de conversão (Lead → Cliente → Deal → Fecho)
- Métricas de performance por agente
- Gráficos de vendas/comissões
- Tarefas pendentes por prioridade
- Próximas visitas/eventos

### **Conversão Rápida de Leads**
- Interface otimizada para chamadas
- Conversão instantânea Lead→Cliente
- Agendamento de visitas integrado
- Qualificação express

### **Sistema de Visitas**
- Inserção manual de dados de imóveis
- Gestão de consultores e partilhas
- Confirmação dupla automática
- Lembretes automáticos (imediato + 6h)
- Feedback estruturado pós-visita

### **Gestão de Follow-up**
- Templates personalizáveis
- Lembretes automáticos multi-canal
- Histórico completo de interações
- Próximas ações sugeridas

### **Relatórios**
- Relatório de leads por origem
- Performance por agente
- Pipeline de negócios por fase
- Análise de conversão por canal
- Eficácia de visitas

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### **Fase 1 - Base (4 semanas)**
1. ✅ Dashboard de Planos
2. ✅ Sistema de Autenticação
3. ✅ Dashboard Principal
4. ✅ Layout base e navegação

### **Fase 2 - Core CRM (6 semanas)**
5. 📋 Módulo Leads (com conversão rápida)
6. 🤝 Módulo Clientes (com verificação duplicados)
7. 🏠 Sistema de Visitas (inserção manual)
8. 📞 Sistema de Interações
9. 📝 Templates básicos

### **Fase 3 - Automatização (4 semanas)**
10. 🎯 Módulo Oportunidades
11. ⏰ Lembretes automáticos (Email + WhatsApp)
12. ✅ Sistema de Tarefas avançado
13. 📅 Calendário integrado

### **Fase 4 - Pipeline de Vendas (4 semanas)**
14. 💼 Módulo Deals com fases
15. 📊 Dashboard analítico avançado
16. 📁 Integração Google Drive
17. 📱 Otimização mobile

### **Fase 5 - Otimização (2 semanas)**
18. 📈 Relatórios avançados
19. 🤖 Automação de workflows
20. 🔔 Notificações push
21. 🎨 UX/UI refinamento

---

## 📂 ESTRUTURA DE PASTAS

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Botões, inputs, modais
│   ├── forms/          # Formulários específicos
│   ├── layout/         # Header, sidebar, footer
│   ├── charts/         # Gráficos e dashboards
│   └── visits/         # Componentes de visitas
├── pages/              # Páginas principais
│   ├── auth/           # Login, registo
│   ├── dashboard/      # Dashboard principal
│   ├── leads/          # Gestão de leads
│   ├── clients/        # Gestão de clientes
│   ├── visits/         # Sistema de visitas
│   ├── opportunities/  # Oportunidades
│   ├── deals/          # Negócios
│   ├── tasks/          # Tarefas
│   ├── calendar/       # Calendário
│   └── templates/      # Gestão de templates
├── hooks/              # Custom hooks
│   ├── useLeads.js     # Hook para leads
│   ├── useClients.js   # Hook para clientes
│   ├── useVisits.js    # Hook para visitas
│   └── useReminders.js # Hook para lembretes
├── utils/              # Funções utilitárias
│   ├── validation.js   # Validações
│   ├── duplicates.js   # Verificação duplicados
│   └── notifications.js # Notificações
├── contexts/           # Contextos React
├── services/           # Serviços (Firebase, API)
│   ├── firebase.js     # Configuração Firebase
│   ├── whatsapp.js     # Integração WhatsApp
│   └── email.js        # Serviço de email
└── constants/          # Constantes e enums
    ├── leadStatus.js   # Status de leads
    ├── dealPhases.js   # Fases de deals
    └── templates.js    # Templates padrão
```

---

## 🗒️ NOTAS DE DESENVOLVIMENTO

### **Estado Atual (Janeiro 2025)**
- ✅ Projeto React + Vite configurado
- ✅ Firebase conectado e funcionando
- ✅ Tailwind CSS configurado
- ✅ React Router DOM instalado
- ✅ ESLint configurado

### **Próximos Passos Imediatos**
1. Implementar Dashboard de Planos
2. Criar sistema de autenticação
3. Desenvolver layout base
4. Implementar módulo de Leads com conversão rápida

### **Observações Importantes**
- **Verificação de duplicados obrigatória** na criação de clientes
- **Sistema de visitas** é o core do negócio (inserção manual)
- **Lembretes automáticos** são críticos (imediato + 6h antes)
- **Integração WhatsApp** é essencial para comunicação
- **Google Drive** para documentos de cada processo
- **GDPR compliance** obrigatório
- **Sistema não gere imóveis** - apenas referencia externos

### **Funcionalidades Críticas**
1. **Conversão rápida** Lead→Cliente durante chamada
2. **Agendamento de visitas** com dados manuais
3. **Sistema de partilhas** entre consultores
4. **Feedback pós-visita** estruturado
5. **Follow-up automático** multi-canal

---

**Última atualização:** Janeiro 2025  
**Versão:** 2.0 (Ajustado com cenários reais)
# 🏢 MyImoMate 3.0 - CRM Imobiliário

## 📋 VISÃO GERAL DO PROJETO

### 🎯 Conceito
CRM especializado para o setor imobiliário com foco no ciclo completo: Lead → Cliente → Oportunidades → Negócios → Fecho

### 🚀 Fluxo Principal
```
ENTRADA → LEADS → CONVERSÃO RÁPIDA → CLIENTE → OPORTUNIDADES → DEALS → FECHO
```

### 🛠️ Stack Tecnológico
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore + Auth)
- **Routing:** React Router DOM
- **Integrações:** Google Drive, WhatsApp, Email

---

## 🗂️ ESTRUTURA DE NAVEGAÇÃO

### 1. **Dashboard de Planos** (Landing Page)
- Apresentação do CRM
- Planos de subscrição
- Call-to-action para registo

### 2. **Sistema de Autenticação**
- Login/Registo
- Recuperação password
- Gestão de sessão

### 3. **Dashboard Principal** (Após login)
- Resumo de atividade
- Métricas principais (funil de conversão)
- Tarefas pendentes
- Próximas reuniões/eventos

### 4. **Módulos Principais**
- 📋 **Leads** - Gestão de prospects (conversão rápida)
- 🤝 **Clientes** - Base de dados completa
- 🎯 **Oportunidades** - Roles por cliente
- 💼 **Negócios (Deals)** - Pipeline de vendas
- ✅ **Tarefas** - Gestão de atividades
- 📅 **Calendário** - Agenda e eventos

---

## 🎬 CENÁRIOS DO DIA-A-DIA

### **CENÁRIO 1: Cliente Comprador (Fluxo Principal)**
```
Chamada/Contacto → Dados Lead → Interesse Imóvel → Conversão Rápida → Agendamento Visita → Follow-up
```

**Fluxo detalhado:**
1. **Receção prospect** → dados básicos + interesse
2. **Qualificação express** → orçamento, financiamento
3. **Quer visita?** → conversão automática Lead→Cliente+Oportunidade
4. **Agendamento** → inserção manual dados imóvel + consultor
5. **Confirmação dupla** → cliente + consultor responsável
6. **Lembretes** → imediato + 6h antes
7. **Visita realizada** → feedback + próximos passos
8. **Follow-up** → proposta, CPCV, bancário, escritura

### **CENÁRIO 2: Cliente Vendedor (Captação)**
```
Contacto → Avaliação → CMI → Marketing → Visitas → Propostas → Fecho
```

### **CENÁRIO 3: Cliente Inquilino**
```
Procura → Seleção → Visitas → Candidatura → Aprovação → Contrato
```

### **CENÁRIO 4: Cliente Senhorio**
```
Mandato → Preparação → Marketing → Seleção Inquilino → Contrato
```

### **CENÁRIO 5: Cliente Investidor**
```
Estratégia → Análise → Aquisição → Execução (Fix&Flip/Buy&Hold/Buy&Rent)
```

---

## 📊 ESTRUTURA DE DADOS

### 🔍 1. LEADS (Ponto de Entrada)
```javascript
Lead {
  id: String,
  nome: String,
  telefone: String,
  email: String,
  origem: Enum ["Site", "Referência", "Cold Call", "Marketing", "Redes Sociais"],
  interesse_inicial: String,
  
  // ═══ INTERESSE IMOBILIÁRIO ═══
  tipo_interesse: Enum ["Comprar", "Vender", "Arrendar", "Investir"],
  detalhes_interesse: {
    tipo_imovel: String,
    localizacao: String,
    orcamento: Number,
    prazo: String
  },
  
  // ═══ QUALIFICAÇÃO EXPRESS ═══
  financiamento_aprovado: Boolean,
  quer_agendar_visita: Boolean,
  disponibilidade_visitas: String,
  
  status: Enum ["Novo", "Em Contacto", "Qualificado", "Convertido", "Perdido"],
  data_criacao: Date,
  proxima_acao: String,
  data_proxima_acao: Date,
  notas: Text,
  agente_responsavel: String,
  google_drive_folder: String
}
```

### 👤 2. CLIENTES (Dados Completos)
```javascript
Cliente {
  // ═══ IDENTIFICAÇÃO PRINCIPAL ═══
  id: String,
  lead_original_id: String, // null se criado direto
  nome: String,
  telefone: String,
  telefone_secundario: String,
  email: String,
  data_nascimento: Date,
  nif: String,
  cc: String,
  
  // ═══ MORADA ═══
  morada: {
    rua: String,
    numero: String,
    andar: String,
    codigo_postal: String,
    localidade: String,
    distrito: String,
    pais: String
  },
  
  // ═══ ESTADO CIVIL ═══
  estado_civil: Enum ["Solteiro", "Casado", "União de Facto", "Divorciado", "Viúvo"],
  comunhao_bens: Enum ["Comunhão Geral", "Comunhão Acquestos", "Separação de Bens"],
  
  // ═══ CÔNJUGE ═══
  conjuge: {
    cliente_id: String, // Link para outro cliente
    nome: String,
    telefone: String,
    nif: String,
    email: String,
    cc: String
  },
  
  // ═══ DADOS PROFISSIONAIS ═══
  profissao: String,
  empresa: String,
  cargo: String,
  
  // ═══ COMUNICAÇÃO ═══
  metodo_contacto_preferido: Enum ["Email", "Telefone", "WhatsApp", "SMS"],
  melhor_horario: String,
  linkedin: String,
  
  // ═══ GESTÃO ═══
  origem: String,
  agente_responsavel: String,
  data_registo: Date,
  status: Enum ["Ativo", "Inativo", "Blacklist"],
  tags: Array, // ["VIP", "Urgente", etc.]
  notas_gerais: Text,
  
  // ═══ GDPR ═══
  consentimento_marketing: Boolean,
  data_consentimento: Date,
  consentimento_partilha_dados: Boolean,
  
  // ═══ DOCUMENTOS ═══
  google_drive_folder: String
}
```

#### 🔍 **Verificação de Duplicados**
- Verificar por: **NIF**, **Email**, **Telefone**, **CC**
- Alertar se já existe antes de criar
- Opção de "Merge" se encontrar similar

### 💰 3. QUALIFICAÇÃO FINANCEIRA
```javascript
QualificacaoFinanceira {
  cliente_id: String,
  
  // ═══ RENDIMENTOS ═══
  rendimento_liquido_mensal: Number,
  tipo_rendimento: Enum ["Conta Outrem", "Trabalhador Independente", "Empresário", "Reformado", "Outros"],
  empresa_entidade: String,
  antiguidade_emprego: Number, // meses
  
  // ═══ SITUAÇÃO BANCÁRIA ═══
  banco_principal: String,
  tem_financiamentos: Boolean,
  valor_prestacoes_mensais: Number,
  
  // ═══ CAPACIDADE INVESTIMENTO ═══
  capacidade_investimento: Number,
  origem_fundos: String,
  liquidez_disponivel: Number,
  
  // ═══ AVALIAÇÃO ═══
  score_credito: Enum ["A", "B", "C", "D"],
  observacoes_financeiras: Text,
  data_ultima_atualizacao: Date
}
```

### 🎯 4. OPORTUNIDADES (ROLES)
Um cliente pode ter múltiplos roles simultaneamente:

```javascript
Oportunidade {
  id: String,
  cliente_id: String,
  tipo_role: Enum ["Comprador", "Vendedor", "Investidor", "Senhorio", "Inquilino"],
  status: Enum ["Ativa", "Suspensa", "Concluída", "Cancelada"],
  prioridade: Enum ["Alta", "Média", "Baixa"],
  data_criacao: Date,
  descricao: String,
  google_drive_folder: String,
  
  // ═══ QUALIFICAÇÃO ESPECÍFICA POR ROLE ═══
  qualificacao_especifica: {
    // Para COMPRADOR
    orcamento_maximo: Number,
    tipo_imovel_procurado: Array,
    localizacoes_preferidas: Array,
    prazo_compra: String,
    financiamento_aprovado: Boolean,
    
    // Para VENDEDOR  
    imoveis_para_venda: Array,
    expectativa_preco: Number,
    prazo_venda: String,
    motivo_venda: String,
    
    // Para INVESTIDOR
    estrategia_investimento: Array ["Fix&Flip", "Buy&Hold", "Buy&Rent"],
    budget_investimento: Number,
    experiencia_investimento: Enum ["Iniciante", "Intermediário", "Avançado"],
    
    // Para SENHORIO
    imoveis_arrendar: Array,
    tipo_inquilino_preferido: String,
    rendas_esperadas: Number,
    
    // Para INQUILINO
    orcamento_renda: Number,
    tipo_imovel_procurado: String,
    prazo_arrendamento: String,
    fiadores_disponiveis: Boolean
  }
}
```

### 🏠 5. VISITAS (Nova Entidade - Cenário Real)
```javascript
VisitaImovel {
  id: String,
  cliente_id: String,
  oportunidade_id: String,
  
  // ═══ DADOS DO IMÓVEL (INSERÇÃO MANUAL) ═══
  imovel: {
    referencia: String, // opcional
    link_imovel: String, // idealista, imovirtual, etc.
    morada: String,
    tipo: String,
    preco: Number,
    caracteristicas: Text, // campo livre
    observacoes: Text
  },
  
  // ═══ CONSULTOR RESPONSÁVEL (MANUAL) ═══
  consultor_imovel: {
    nome: String,
    telefone: String,
    email: String,
    agencia: String,
    percentagem_partilha: Number, // inserção manual
    condicoes_partilha: Text
  },
  
  // ═══ AGENDAMENTO ═══
  data_hora: DateTime,
  duracao_estimada: Number, // minutos
  status: Enum ["Agendada", "Confirmada", "Realizada", "Cancelada", "Reagendada"],
  
  // ═══ CONFIRMAÇÕES ═══
  confirmada_cliente: Boolean,
  confirmada_consultor_imovel: Boolean,
  data_confirmacao_cliente: Date,
  data_confirmacao_consultor: Date,
  
  // ═══ LEMBRETES (Imediato + 6h antes) ═══
  lembretes: {
    imediato: {
      enviado: Boolean,
      data_envio: Date,
      tipo: Array // ["Email", "WhatsApp"]
    },
    seis_horas_antes: {
      enviado: Boolean,
      data_envio: Date,
      tipo: Array
    }
  },
  
  // ═══ FEEDBACK PÓS-VISITA ═══
  feedback_cliente: {
    interessado: Boolean,
    nivel_interesse: Enum ["Alto", "Médio", "Baixo", "Sem interesse"],
    quer_proposta: Boolean,
    valor_proposta: Number,
    observacoes: Text,
    data_feedback: Date
  },
  
  // ═══ PRÓXIMOS PASSOS ═══
  proximos_passos: Enum ["Aguardar", "Fazer Proposta", "CPCV", "Aprovação Bancária", "Desistiu"],
  
  // ═══ INTEGRAÇÃO ═══
  tarefa_id: String, // tarefa associada
  evento_calendario_id: String,
  
  notas: Text,
  data_criacao: Date
}
```

### 💼 6. NEGÓCIOS (DEALS)
Cada oportunidade pode ter vários deals com fases específicas:

```javascript
Deal {
  id: String,
  oportunidade_id: String,
  titulo: String,
  tipo_negocio: String,
  valor_estimado: Number,
  valor_final: Number,
  
  // ═══ FASES ESPECÍFICAS POR TIPO ═══
  fases_possiveis: Array, // Dependendo do tipo de negócio
  fase_atual: String,
  percentagem_conclusao: Number,
  
  // ═══ DATAS ═══
  data_inicio: Date,
  data_estimada_fecho: Date,
  data_fecho_real: Date,
  
  // ═══ GESTÃO ═══
  status: Enum ["Em Andamento", "Concluído", "Cancelado", "Pausado"],
  agente_responsavel: String,
  comissao_prevista: Number,
  observacoes: Text,
  google_drive_folder: String
}
```

#### **Fases por Tipo de Deal:**

##### 🏠 **VENDEDOR**
1. Avaliação imóvel
2. CMI assinado
3. Fotos/vídeo realizados
4. Em divulgação
5. Visitas agendadas
6. Propostas recebidas
7. Negociação
8. Escritura/Fecho

##### 🔍 **COMPRADOR**
1. Briefing necessidades
2. Seleção imóveis
3. Visitas agendadas
4. Propostas enviadas
5. CPCV assinado
6. Financiamento aprovado
7. Escritura
8. Entrega chaves

##### 💰 **INVESTIDOR**
- **Fix & Flip:** Análise → Compra → Renovação → Venda
- **Buy to Hold:** Análise → Compra → Arrendamento → Gestão
- **Buy to Rent:** Análise → Compra → Preparação → Arrendamento

##### 🏘️ **SENHORIO**
1. Preparação imóvel
2. Definição renda
3. Divulgação
4. Visitas inquilinos
5. Seleção inquilino
6. Contrato arrendamento
7. Gestão corrente

##### 🏡 **INQUILINO**
1. Definição critérios
2. Pesquisa imóveis
3. Visitas
4. Candidatura
5. Aprovação
6. Contrato
7. Entrada imóvel

### 📋 7. FASES DE NEGÓCIO
```javascript
Fase {
  id: String,
  deal_id: String,
  nome_fase: String,
  ordem: Number,
  status: Enum ["Pendente", "Em Andamento", "Concluída", "Bloqueada"],
  data_inicio: Date,
  data_conclusao: Date,
  data_limite: Date,
  responsavel: String,
  documentos_necessarios: Array,
  documentos_anexados: Array,
  checklist: Array,
  notas: Text,
  proxima_acao: String
}
```

### 📞 8. INTERAÇÕES (Nova Entidade)
```javascript
Interacao {
  id: String,
  cliente_id: String,
  lead_id: String,
  deal_id: String,
  visita_id: String,
  
  tipo: Enum ["Chamada", "Email", "WhatsApp", "Reunião", "Visita", "Proposta"],
  assunto: String,
  descricao: Text,
  resultado: Enum ["Positivo", "Neutro", "Negativo", "Sem resposta"],
  
  // ═══ DATAS ═══
  data_interacao: Date,
  duracao: Number, // minutos
  
  // ═══ FOLLOW-UP ═══
  proxima_acao: String,
  data_proxima_acao: Date,
  lembrete_automatico: Boolean,
  
  // ═══ GESTÃO ═══
  agente_responsavel: String,
  canal_comunicacao: String,
  anexos: Array,
  
  notas: Text
}
```

### ✅ 9. TAREFAS
```javascript
Tarefa {
  id: String,
  titulo: String,
  descricao: Text,
  tipo: Enum ["Chamada", "Email", "Reunião", "Documento", "Follow-up", "Visita", "Outros"],
  prioridade: Enum ["Alta", "Média", "Baixa"],
  status: Enum ["Pendente", "Em Andamento", "Concluída", "Cancelada"],
  
  // ═══ RELACIONAMENTOS ═══
  cliente_id: String,
  lead_id: String,
  deal_id: String,
  visita_id: String, // NEW
  
  // ═══ DATAS ═══
  data_criacao: Date,
  data_vencimento: Date,
  data_conclusao: Date,
  
  // ═══ GESTÃO ═══
  agente_responsavel: String,
  agente_criador: String,
  tempo_estimado: Number, // minutos
  tempo_real: Number,
  
  // ═══ RECORRÊNCIA ═══
  recorrente: Boolean,
  frequencia: String,
  
  // ═══ LEMBRETES AUTOMÁTICOS ═══
  lembrete_automatico: Boolean,
  tipo_lembrete: Array, // ["Email", "WhatsApp", "SMS"]
  
  notas: Text
}
```

### 📅 10. CALENDÁRIO
```javascript
Evento {
  id: String,
  titulo: String,
  descricao: Text,
  tipo: Enum ["Reunião", "Visita", "Chamada", "Deadline", "Follow-up"],
  
  // ═══ DATAS ═══
  data_inicio: DateTime,
  data_fim: DateTime,
  dia_completo: Boolean,
  
  // ═══ RELACIONAMENTOS ═══
  cliente_id: String,
  lead_id: String,
  deal_id: String,
  tarefa_id: String,
  visita_id: String, // NEW
  
  // ═══ PARTICIPANTES ═══
  participantes: Array,
  local: String,
  link_reuniao: String,
  
  // ═══ GESTÃO ═══
  agente_responsavel: String,
  status: Enum ["Agendado", "Confirmado", "Realizado", "Cancelado"],
  lembretes: Array,
  
  notas: Text
}
```

### 📝 11. TEMPLATES (Nova Entidade)
```javascript
Template {
  id: String,
  nome: String,
  categoria: String,
  tipo: Enum ["Email", "WhatsApp", "SMS", "Contrato"],
  assunto: String,
  conteudo: Text,
  
  // ═══ VARIÁVEIS DINÂMICAS ═══
  variaveis: Array, // {nome}, {imovel}, {data_visita}, etc.
  
  // ═══ CONTEXTO DE USO ═══
  cenario: Enum [
    "visita_lembrete_imediato",
    "visita_lembrete_6h",
    "feedback_pos_visita",
    "follow_up_lead",
    "confirmacao_visita"
  ],
  
  // ═══ GESTÃO ═══
  ativo: Boolean,
  agente_criador: String,
  data_criacao: Date,
  data_atualizacao: Date
}
```

### 📈 12. LEMBRETES AUTOMÁTICOS
```javascript
Lembrete {
  id: String,
  tipo: Enum ["Email", "WhatsApp", "SMS"],
  destinatario: String,
  assunto: String,
  mensagem: Text,
  
  // ═══ AGENDAMENTO ═══
  data_envio: DateTime,
  enviado: Boolean,
  tentativas: Number,
  
  // ═══ RELACIONAMENTOS ═══
  cliente_id: String,
  visita_id: String,
  tarefa_id: String,
  template_id: String,
  
  // ═══ STATUS ═══
  status: Enum ["Agendado", "Enviado", "Entregue", "Lido", "Erro"],
  erro_mensagem: String,
  
  data_criacao: Date
}
```

---

## 🔗 INTEGRAÇÕES

### **Google Drive**
- **Pasta por Lead** - Documentos de qualificação
- **Pasta por Cliente** - Documentos pessoais, financeiros
- **Pasta por Oportunidade** - Documentos específicos do role
- **Pasta por Deal** - Contratos, propostas, documentação legal
- **Pasta por Visita** - Documentos específicos do imóvel

### **WhatsApp Business API**
- Lembretes automáticos
- Notificações de visitas
- Follow-up personalizado

### **Email (SMTP)**
- Templates personalizados
- Lembretes automáticos
- Relatórios periódicos

### **Google Calendar** (Futuro)
- Sincronização eventos
- Lembretes nativos

---

## 📱 FUNCIONALIDADES PRINCIPAIS

### **Dashboard Analítico**
- Funil de conversão (Lead → Cliente → Deal → Fecho)
- Métricas de performance por agente
- Gráficos de vendas/comissões
- Tarefas pendentes por prioridade
- Próximas visitas/eventos

### **Conversão Rápida de Leads**
- Interface otimizada para chamadas
- Conversão instantânea Lead→Cliente
- Agendamento de visitas integrado
- Qualificação express

### **Sistema de Visitas**
- Inserção manual de dados de imóveis
- Gestão de consultores e partilhas
- Confirmação dupla automática
- Lembretes automáticos (imediato + 6h)
- Feedback estruturado pós-visita

### **Gestão de Follow-up**
- Templates personalizáveis
- Lembretes automáticos multi-canal
- Histórico completo de interações
- Próximas ações sugeridas

### **Relatórios**
- Relatório de leads por origem
- Performance por agente
- Pipeline de negócios por fase
- Análise de conversão por canal
- Eficácia de visitas

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### **Fase 1 - Base (4 semanas)**
1. ✅ Dashboard de Planos
2. ✅ Sistema de Autenticação
3. ✅ Dashboard Principal
4. ✅ Layout base e navegação

### **Fase 2 - Core CRM (6 semanas)**
5. 📋 Módulo Leads (com conversão rápida)
6. 🤝 Módulo Clientes (com verificação duplicados)
7. 🏠 Sistema de Visitas (inserção manual)
8. 📞 Sistema de Interações
9. 📝 Templates básicos

### **Fase 3 - Automatização (4 semanas)**
10. 🎯 Módulo Oportunidades
11. ⏰ Lembretes automáticos (Email + WhatsApp)
12. ✅ Sistema de Tarefas avançado
13. 📅 Calendário integrado

### **Fase 4 - Pipeline de Vendas (4 semanas)**
14. 💼 Módulo Deals com fases
15. 📊 Dashboard analítico avançado
16. 📁 Integração Google Drive
17. 📱 Otimização mobile

### **Fase 5 - Otimização (2 semanas)**
18. 📈 Relatórios avançados
19. 🤖 Automação de workflows
20. 🔔 Notificações push
21. 🎨 UX/UI refinamento

---

## 📂 ESTRUTURA DE PASTAS

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Botões, inputs, modais
│   ├── forms/          # Formulários específicos
│   ├── layout/         # Header, sidebar, footer
│   ├── charts/         # Gráficos e dashboards
│   └── visits/         # Componentes de visitas
├── pages/              # Páginas principais
│   ├── auth/           # Login, registo
│   ├── dashboard/      # Dashboard principal
│   ├── leads/          # Gestão de leads
│   ├── clients/        # Gestão de clientes
│   ├── visits/         # Sistema de visitas
│   ├── opportunities/  # Oportunidades
│   ├── deals/          # Negócios
│   ├── tasks/          # Tarefas
│   ├── calendar/       # Calendário
│   └── templates/      # Gestão de templates
├── hooks/              # Custom hooks
│   ├── useLeads.js     # Hook para leads
│   ├── useClients.js   # Hook para clientes
│   ├── useVisits.js    # Hook para visitas
│   └── useReminders.js # Hook para lembretes
├── utils/              # Funções utilitárias
│   ├── validation.js   # Validações
│   ├── duplicates.js   # Verificação duplicados
│   └── notifications.js # Notificações
├── contexts/           # Contextos React
├── services/           # Serviços (Firebase, API)
│   ├── firebase.js     # Configuração Firebase
│   ├── whatsapp.js     # Integração WhatsApp
│   └── email.js        # Serviço de email
└── constants/          # Constantes e enums
    ├── leadStatus.js   # Status de leads
    ├── dealPhases.js   # Fases de deals
    └── templates.js    # Templates padrão
```

---

## 🗒️ NOTAS DE DESENVOLVIMENTO

### **Estado Atual (Janeiro 2025)**
- ✅ Projeto React + Vite configurado
- ✅ Firebase conectado e funcionando
- ✅ Tailwind CSS configurado
- ✅ React Router DOM instalado
- ✅ ESLint configurado
- ✅ Landing Page criada e funcional
- ✅ Sistema de rotas implementado
- ✅ Estrutura de pastas organizada

### **Próximos Passos Imediatos**
1. Implementar Dashboard de Planos
2. Criar sistema de autenticação
3. Desenvolver layout base
4. Implementar módulo de Leads com conversão rápida

### **Observações Importantes**
- **Verificação de duplicados obrigatória** na criação de clientes
- **Sistema de visitas** é o core do negócio (inserção manual)
- **Lembretes automáticos** são críticos (imediato + 6h antes)
- **Integração WhatsApp** é essencial para comunicação
- **Google Drive** para documentos de cada processo
- **GDPR compliance** obrigatório
- **Sistema não gere imóveis** - apenas referencia externos

### **Funcionalidades Críticas**
1. **Conversão rápida** Lead→Cliente durante chamada
2. **Agendamento de visitas** com dados manuais
3. **Sistema de partilhas** entre consultores
4. **Feedback pós-visita** estruturado
5. **Follow-up automático** multi-canal

---

**Última atualização:** Janeiro 2025  
**Versão:** 2.0 (Ajustado com cenários reais)# 🏢 MyImoMate 3.0 - CRM Imobiliário

## 📋 VISÃO GERAL DO PROJETO

### 🎯 Conceito
CRM especializado para o setor imobiliário com foco no ciclo completo: Lead → Cliente → Oportunidades → Negócios → Fecho

### 🚀 Fluxo Principal
```
ENTRADA → LEADS → CONVERSÃO RÁPIDA → CLIENTE → OPORTUNIDADES → DEALS → FECHO
```

### 🛠️ Stack Tecnológico
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore + Auth)
- **Routing:** React Router DOM
- **Sistema de Temas:** 6 Temas Personalizados (Corporate, Fun, Casual, Feminino, Masculino, Milionário)
- **Integrações:** Google Drive, WhatsApp, Email

---

## 🎨 SISTEMA DE TEMAS COMPLETO

### **✅ IMPLEMENTADO (Agosto 2025)**
O sistema de temas personalizados está 100% funcional com:

#### **6 Temas Disponíveis:**
1. **🏢 Corporate** - Azul marinho, profissional, Roboto
2. **🌈 Fun** - Cores vibrantes, playful, Poppins
3. **☕ Casual** - Tons terra, acolhedor, Merriweather
4. **💖 Feminino** - Rosa/roxo, elegante, Playfair Display
5. **⚡ Masculino** - Preto/laranja, forte, Oswald
6. **💎 Milionário** - Dourado/preto, luxuoso, Playfair Display

#### **Funcionalidades do Sistema:**
- ✅ Seletor de temas no header da landing page
- ✅ Persistência da escolha no localStorage
- ✅ Transições suaves entre temas
- ✅ Todos os componentes adaptativos (botões, cards, textos)
- ✅ Fontes do Google Fonts dinâmicas
- ✅ Paletas de cores personalizadas por tema
- ✅ Suporte para temas dark/light automático

#### **Arquivos Implementados:**
- `src/constants/themes.js` - Configuração completa dos 6 temas
- `src/contexts/ThemeContext.jsx` - Context com localStorage e gestão
- `src/components/common/ThemeSelector.jsx` - Seletor de temas
- `src/components/common/ThemedComponents.jsx` - Componentes adaptativos
- `src/App.jsx` - Integração com ThemeProvider
- `src/pages/landing/LandingPage.jsx` - Landing page totalmente temática

---

## 🗂️ ESTRUTURA DE NAVEGAÇÃO

### 1. **Landing Page** ✅ COMPLETA
- Apresentação do CRM com sistema de temas
- Seletor de temas funcional
- 6 seções completas (hero, features, pricing, testimonials, CTA, footer)
- Planos de subscrição
- Call-to-action para registo

### 2. **Sistema de Autenticação** 🔄 PRÓXIMO
- Login/Registo
- Recuperação password
- Gestão de sessão

### 3. **Dashboard Principal** (Após login)
- Resumo de atividade
- Métricas principais (funil de conversão)
- Tarefas pendentes
- Próximas reuniões/eventos

### 4. **Módulos Principais**
- 📋 **Leads** - Gestão de prospects (conversão rápida)
- 🤝 **Clientes** - Base de dados completa
- 🎯 **Oportunidades** - Roles por cliente
- 💼 **Negócios (Deals)** - Pipeline de vendas
- ✅ **Tarefas** - Gestão de atividades
- 📅 **Calendário** - Agenda e eventos

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### **Fase 1 - Base (COMPLETA ✅)**
1. ✅ Projeto React + Vite + Tailwind configurado
2. ✅ Firebase conectado e funcionando  
3. ✅ React Router DOM com rotas básicas
4. ✅ Landing Page criada e funcional
5. ✅ **Sistema de 6 Temas Implementado** (Agosto 2025)

### **Fase 2 - Autenticação (PRÓXIMA 🎯)**
6. 🔐 Sistema de autenticação Firebase
7. 📱 Páginas de Login/Registo com temas
8. 🔒 Proteção de rotas e sessões
9. 👤 Gestão de perfis de utilizador

### **Fase 3 - Core CRM (6 semanas)**
10. 📋 Módulo Leads (com conversão rápida)
11. 🤝 Módulo Clientes (com verificação duplicados)
12. 🏠 Sistema de Visitas (inserção manual)
13. 📞 Sistema de Interações
14. 📝 Templates básicos

### **Fase 4 - Automatização (4 semanas)**
15. 🎯 Módulo Oportunidades
16. ⏰ Lembretes automáticos (Email + WhatsApp)
17. ✅ Sistema de Tarefas avançado
18. 📅 Calendário integrado

### **Fase 5 - Pipeline de Vendas (4 semanas)**
19. 💼 Módulo Deals com fases
20. 📊 Dashboard analítico avançado
21. 📁 Integração Google Drive
22. 📱 Otimização mobile

### **Fase 6 - Otimização (2 semanas)**
23. 📈 Relatórios avançados
24. 🤖 Automação de workflows
25. 🔔 Notificações push
26. 🎨 UX/UI refinamento

---

## 📂 ESTRUTURA DE PASTAS ATUALIZADA

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Botões, inputs, modais, temas ✅
│   ├── forms/          # Formulários específicos
│   ├── layout/         # Header, sidebar, footer
│   ├── charts/         # Gráficos e dashboards
│   └── visits/         # Componentes de visitas
├── pages/              # Páginas principais
│   ├── landing/        # Landing Page ✅
│   ├── auth/           # Login, registo 🔄
│   ├── dashboard/      # Dashboard principal
│   ├── leads/          # Gestão de leads
│   ├── clients/        # Gestão de clientes
│   ├── visits/         # Sistema de visitas
│   ├── opportunities/  # Oportunidades
│   ├── deals/          # Negócios
│   ├── tasks/          # Tarefas
│   ├── calendar/       # Calendário
│   └── templates/      # Gestão de templates
├── hooks/              # Custom hooks
│   ├── useLeads.js     # Hook para leads
│   ├── useClients.js   # Hook para clientes
│   ├── useVisits.js    # Hook para visitas
│   └── useReminders.js # Hook para lembretes
├── utils/              # Funções utilitárias
│   ├── validation.js   # Validações
│   ├── duplicates.js   # Verificação duplicados
│   └── notifications.js # Notificações
├── contexts/           # Contextos React ✅
│   └── ThemeContext.jsx # Context de temas ✅
├── services/           # Serviços (Firebase, API)
│   ├── firebase.js     # Configuração Firebase ✅
│   ├── whatsapp.js     # Integração WhatsApp
│   └── email.js        # Serviço de email
├── constants/          # Constantes e enums ✅
│   └── themes.js       # 6 Temas configurados ✅
└── config/             # Configurações
    └── firebase.js     # Config Firebase ✅
```

---

## 🗒️ NOTAS DE DESENVOLVIMENTO

### **Estado Atual (Agosto 2025)**
- ✅ Projeto React + Vite configurado
- ✅ Firebase conectado e funcionando
- ✅ Tailwind CSS configurado
- ✅ React Router DOM instalado
- ✅ ESLint configurado
- ✅ Landing Page completa e funcional
- ✅ **Sistema de 6 Temas totalmente implementado**
- ✅ Seletor de temas funcional
- ✅ Componentes adaptativos criados
- ✅ Persistência localStorage funcionando

### **Próximos Passos Imediatos**
1. **🔐 Sistema de Autenticação Firebase**
   - Páginas de Login/Registo com design temático
   - Integração Firebase Auth
   - Proteção de rotas
   - Gestão de sessões

2. **📱 Dashboard Principal**
   - Layout base com temas
   - Navegação lateral
   - Métricas principais

3. **📋 Módulo de Leads**
   - Interface de captação
   - Sistema de conversão rápida
   - Integração com Firebase

### **Funcionalidades Críticas**
1. **Conversão rápida** Lead→Cliente durante chamada
2. **Agendamento de visitas** com dados manuais
3. **Sistema de partilhas** entre consultores
4. **Feedback pós-visita** estruturado
5. **Follow-up automático** multi-canal

### **Observações Importantes**
- **Sistema de temas** 100% funcional e escalável
- **Verificação de duplicados obrigatória** na criação de clientes
- **Sistema de visitas** é o core do negócio (inserção manual)
- **Lembretes automáticos** são críticos (imediato + 6h antes)
- **Integração WhatsApp** é essencial para comunicação
- **Google Drive** para documentos de cada processo
- **GDPR compliance** obrigatório
- **Sistema não gere imóveis** - apenas referencia externos

---

**Última atualização:** Agosto 2025  
**Versão:** 3.1 (Sistema de Temas Completo)

## 🚀 MARCOS IMPORTANTES

### **Agosto 2025**
- ✅ **Sistema de 6 Temas Implementado**
- ✅ **Landing Page Completa com Temas**
- ✅ **Arquitetura Escalável de Componentes**

### **Próximo Marco: Setembro 2025**
- 🎯 **Sistema de Autenticação Completo**
- 🎯 **Dashboard Principal Temático**
- 🎯 **Módulo de Leads Básico**