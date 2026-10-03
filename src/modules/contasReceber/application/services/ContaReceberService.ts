import { formatDateForDatabase, parseDateBR, formatDateOnlyBR } from '../../../../core/formatters/date';
import type { DefinirContaDTO, BaixarContaDTO } from '../../domain/models/ContaReceber';
import type { IContaReceberRepository } from '../../domain/repositories/IContaReceberRepository';

export class ContaReceberService {
  constructor(private readonly repository: IContaReceberRepository) {}
  listar() { return this.repository.listar(); }

  private validar(dados: DefinirContaDTO, obrigatorio = false) {
    if (!Number.isInteger(dados.id) || dados.id <= 0) throw new Error('Conta inválida.');
    if ((obrigatorio || dados.dataVencimento) &&
        (!dados.dataVencimento || parseDateBR(formatDateOnlyBR(dados.dataVencimento)) !== dados.dataVencimento)) {
      throw new Error('Informe uma data prevista válida.');
    }
    if (obrigatorio && !dados.formaPagamento.trim()) throw new Error('Informe o meio de pagamento.');
    if (dados.formaPagamento.trim().length > 80) throw new Error('O meio de pagamento deve ter até 80 caracteres.');
  }

  definir(dados: DefinirContaDTO) {
    this.validar(dados);
    return this.repository.definir({ ...dados, formaPagamento: dados.formaPagamento.trim() });
  }

  baixar(dados: BaixarContaDTO) {
    this.validar(dados, true);
    if (!dados.dataPagamento || parseDateBR(formatDateOnlyBR(dados.dataPagamento)) !== dados.dataPagamento || dados.dataPagamento > formatDateForDatabase(new Date())) {
      throw new Error('Informe uma data de recebimento válida, até hoje.');
    }
    return this.repository.baixar({ ...dados, formaPagamento: dados.formaPagamento.trim() });
  }
}
