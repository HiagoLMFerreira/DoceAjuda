export type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  total_compras: number;
};

export type CriarClienteDTO = {
  nome: string;
  telefone?: string;
  endereco?: string;
};

export type AtualizarClienteDTO = CriarClienteDTO & {
  id: number;
};

export type CampoOrdenacaoCliente = 'id' | 'nome' | 'total_compras';
export type DirecaoOrdenacaoCliente = 'ASC' | 'DESC';

export type FiltroClientes = {
  termo?: string;
  ordenarPor?: CampoOrdenacaoCliente;
  direcao?: DirecaoOrdenacaoCliente;
};
