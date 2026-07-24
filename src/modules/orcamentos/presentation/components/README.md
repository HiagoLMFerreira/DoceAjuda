# Componentes de Orçamentos

O JSX e o StyleSheet da tela original foram mantidos integralmente para evitar
qualquer alteração visual.

Os componentes candidatos à extração posterior são:

- OrcamentoList;
- OrcamentoDetailsModal;
- NecessidadesOrcamentoModal;
- OrcamentoActions;
- StatusOrcamentoBadge.

O formulário continua reutilizando `DocumentoComercialFormModal`, pois ele é
compartilhado por Orçamentos, Vendas e conversão de orçamento em venda.
Esse componente será migrado junto ao módulo `documentosComerciais`.
