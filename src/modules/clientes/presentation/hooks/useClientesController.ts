import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import type {
  Cliente,
  CriarClienteInput,
} from '../../domain/entities/Cliente';
import type { ClienteController } from '../controllers/ClienteController';

export function useClientesController(controller: ClienteController) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(
    async (filtro = '') => {
      try {
        setLoading(true);
        setError(null);
        setClientes(await controller.listar(filtro));
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
      } finally {
        setLoading(false);
      }
    },
    [controller]
  );

  const criar = useCallback(
    async (input: CriarClienteInput) => {
      await controller.criar(input);
      await carregar();
    },
    [controller, carregar]
  );

  return {
    clientes,
    loading,
    error,
    carregar,
    criar,
  };
}
