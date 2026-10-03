import type { ContaReceber, DefinirContaDTO, BaixarContaDTO } from '../models/ContaReceber';

export interface IContaReceberRepository {
  listar(): Promise<ContaReceber[]>;
  definir(dados: DefinirContaDTO): Promise<void>;
  baixar(dados: BaixarContaDTO): Promise<void>;
}
