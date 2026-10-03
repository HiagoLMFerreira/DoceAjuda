import type { ContaReceberService } from '../../application/services/ContaReceberService';
import type { DefinirContaDTO, BaixarContaDTO } from '../../domain/models/ContaReceber';

export class ContaReceberController {
  constructor(private readonly service: ContaReceberService) {}
  listar() { return this.service.listar(); }
  definir(dados: DefinirContaDTO) { return this.service.definir(dados); }
  baixar(dados: BaixarContaDTO) { return this.service.baixar(dados); }
}
