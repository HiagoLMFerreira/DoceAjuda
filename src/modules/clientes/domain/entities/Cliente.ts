export type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  totalCompras: number;
};

export type CriarClienteInput = {
  nome: string;
  telefone?: string;
  endereco?: string;
};

export type AtualizarClienteInput = CriarClienteInput;
