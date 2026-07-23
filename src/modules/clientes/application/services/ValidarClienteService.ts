import { ValidationError } from '../../../../core/errors';
import type {
  AtualizarClienteDTO,
  CriarClienteDTO,
} from '../../domain/models/Cliente';

type ClienteNormalizado = {
  nome: string;
  telefone: string;
  endereco: string;
};

export class ValidarClienteService {
  executar(
    cliente: CriarClienteDTO | AtualizarClienteDTO
  ): ClienteNormalizado {
    const nome = cliente.nome.trim();
    const telefone = cliente.telefone?.trim() ?? '';
    const endereco = cliente.endereco?.trim() ?? '';

    if (!nome) {
      throw new ValidationError('Informe o nome do cliente.');
    }

    return {
      nome,
      telefone,
      endereco,
    };
  }
}
