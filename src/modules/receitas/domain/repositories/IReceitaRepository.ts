import type { AtualizarReceitaDTO, Receita, ReceitaDetalhada, SalvarReceitaDTO } from '../models/Receita';

export interface IReceitaRepository {
  listar(): Promise<Receita[]>;
  buscarDetalhada(id: number): Promise<ReceitaDetalhada | null>;
  criar(input: SalvarReceitaDTO): Promise<number>;
  atualizar(input: AtualizarReceitaDTO): Promise<void>;
  estaEmUso(id: number): Promise<boolean>;
  excluir(id: number): Promise<void>;
}
