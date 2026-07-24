import { BusinessRuleError } from '../../../../core/errors';
import type { VendaDetalhada } from '../../domain/models/Venda';

export class ValidarOperacaoVendaService {
  validarCancelamento(venda: VendaDetalhada): void {
    if (venda.status !== 'CONCLUIDA') {
      throw new BusinessRuleError(
        'Somente vendas concluídas podem ser canceladas.'
      );
    }

    if (venda.estoque_baixado !== 1) {
      throw new BusinessRuleError(
        'A venda não possui baixa de estoque registrada.'
      );
    }

    if (venda.estoque_estornado === 1) {
      throw new BusinessRuleError(
        'O estoque desta venda já foi devolvido.'
      );
    }
  }
}
