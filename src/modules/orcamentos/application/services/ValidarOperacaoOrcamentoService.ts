import { BusinessRuleError } from '../../../../core/errors';
import type { OrcamentoDetalhado } from '../../domain/models/Orcamento';

export class ValidarOperacaoOrcamentoService {
  validarEdicao(orcamento: OrcamentoDetalhado): void {
    if (orcamento.status !== 'PENDENTE') {
      throw new BusinessRuleError(
        'Somente orçamentos pendentes podem ser editados.'
      );
    }
  }

  validarConversao(orcamento: OrcamentoDetalhado): void {
    if (orcamento.status !== 'PENDENTE') {
      throw new BusinessRuleError(
        'Somente orçamentos pendentes podem ser transformados em venda.'
      );
    }
  }

  validarExclusao(orcamento: OrcamentoDetalhado): void {
    if (orcamento.status !== 'PENDENTE') {
      throw new BusinessRuleError(
        'Somente orçamentos pendentes podem ser excluídos.'
      );
    }
  }
}
