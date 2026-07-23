import type { AtualizarReceitaDTO, SalvarReceitaDTO } from '../../domain/models/Receita';
import type { ListarReceitasService } from '../../application/services/ListarReceitasService';
import type { BuscarReceitaDetalhadaService } from '../../application/services/BuscarReceitaDetalhadaService';
import type { SalvarReceitaService } from '../../application/services/SalvarReceitaService';
import type { AtualizarReceitaService } from '../../application/services/AtualizarReceitaService';
import type { ExcluirReceitaService } from '../../application/services/ExcluirReceitaService';
import type { ListarProdutosParaReceitaService } from '../../application/services/ListarProdutosParaReceitaService';

export class ReceitaController {
  constructor(
    private readonly listarService: ListarReceitasService,
    private readonly buscarService: BuscarReceitaDetalhadaService,
    private readonly salvarService: SalvarReceitaService,
    private readonly atualizarService: AtualizarReceitaService,
    private readonly excluirService: ExcluirReceitaService,
    private readonly listarProdutosService: ListarProdutosParaReceitaService,
  ) {}

  listar() { return this.listarService.executar(); }
  buscarDetalhada(id: number) { return this.buscarService.executar(id); }
  salvar(input: SalvarReceitaDTO) { return this.salvarService.executar(input); }
  atualizar(input: AtualizarReceitaDTO) { return this.atualizarService.executar(input); }
  excluir(id: number) { return this.excluirService.executar(id); }
  listarProdutos() { return this.listarProdutosService.executar(); }
}
