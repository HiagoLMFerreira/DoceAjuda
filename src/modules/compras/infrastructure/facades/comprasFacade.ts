export type {
  CompraDatabase,
  CompraDetalhada,
  DirecaoOrdenacao,
  OrdenarCompraPor,
  ProdutoEstoque,
} from '../../../../database/database';

import type {
  DirecaoOrdenacao,
  NovaCompra,
  OrdenarCompraPor,
} from '../../domain/models/Compra';
import { compraController } from '../../di/comprasContainer';

export const listarCompras = (
  filtro = '',
  ordenarPor: OrdenarCompraPor = 'data_compra',
  direcao: DirecaoOrdenacao = 'DESC'
) =>
  compraController.listar({
    termo: filtro,
    ordenarPor,
    direcao,
  });

export const buscarCompraPorId = (id: number) =>
  compraController.buscarPorId(id);

export const cadastrarCompra = (input: NovaCompra) =>
  compraController.cadastrar(input);

export const cancelarCompra = (id: number) =>
  compraController.cancelar(id);

export const excluirCompra = (id: number) =>
  compraController.excluir(id);

export const listarProdutos = () =>
  compraController.listarProdutos();
