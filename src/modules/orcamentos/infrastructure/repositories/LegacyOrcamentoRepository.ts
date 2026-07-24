import {
  buscarDocumentoComercialPorId,
  calcularNecessidadesOrcamento,
  excluirDocumentoComercial,
  listarOrcamentos,
} from '../../../../database/database';
import type {
  NecessidadeOrcamento,
  Orcamento,
  OrcamentoDetalhado,
} from '../../domain/models/Orcamento';
import type { IOrcamentoRepository } from '../../domain/repositories/IOrcamentoRepository';

export class LegacyOrcamentoRepository
  implements IOrcamentoRepository
{
  listar(filtro = ''): Promise<Orcamento[]> {
    return listarOrcamentos(
      filtro,
      'created_at',
      'DESC'
    ) as Promise<Orcamento[]>;
  }

  buscarPorId(id: number): Promise<OrcamentoDetalhado | null> {
    return buscarDocumentoComercialPorId(
      id
    ) as Promise<OrcamentoDetalhado | null>;
  }

  calcularNecessidades(
    id: number
  ): Promise<NecessidadeOrcamento[]> {
    return calcularNecessidadesOrcamento(id);
  }

  excluir(id: number): Promise<void> {
    return excluirDocumentoComercial(id);
  }
}
