import { useCallback, useMemo, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import { clienteController } from '../../di/clientesContainer';
import type {
  CampoOrdenacaoCliente,
  Cliente,
  CriarClienteDTO,
  DirecaoOrdenacaoCliente,
} from '../../domain/models/Cliente';

type FormularioCliente = {
  nome: string;
  telefone: string;
  endereco: string;
};

const FORMULARIO_INICIAL: FormularioCliente = {
  nome: '',
  telefone: '',
  endereco: '',
};

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [situacao, setSituacao] =
    useState<'ATIVOS' | 'INATIVOS'>('ATIVOS');

  const [termoBusca, setTermoBusca] = useState('');
  const [campoOrdenacao, setCampoOrdenacao] =
    useState<CampoOrdenacaoCliente>('nome');
  const [direcaoOrdenacao, setDirecaoOrdenacao] =
    useState<DirecaoOrdenacaoCliente>('ASC');

  const [modalFormularioVisivel, setModalFormularioVisivel] = useState(false);
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null);
  const [clienteEditando, setClienteEditando] =
    useState<Cliente | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioCliente>(FORMULARIO_INICIAL);

  const carregarClientes = useCallback(async () => {
    try {
      setCarregando(true);

      const resultado = await clienteController.listar({
        termo: termoBusca,
        ordenarPor: campoOrdenacao,
        direcao: direcaoOrdenacao,
        situacao,
      });

      setClientes(resultado);
    } finally {
      setCarregando(false);
    }
  }, [termoBusca, campoOrdenacao, direcaoOrdenacao, situacao]);

  const abrirCadastro = useCallback(() => {
    setClienteEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setModalFormularioVisivel(true);
  }, []);

  const abrirDetalhes = useCallback((cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setModalDetalhesVisivel(true);
  }, []);

  const fecharDetalhes = useCallback(() => {
    setModalDetalhesVisivel(false);
    setClienteSelecionado(null);
  }, []);

  const abrirEdicao = useCallback((cliente: Cliente) => {
    setClienteEditando(cliente);
    setFormulario({
      nome: cliente.nome,
      telefone: cliente.telefone ?? '',
      endereco: cliente.endereco ?? '',
    });
    setModalDetalhesVisivel(false);
    setModalFormularioVisivel(true);
  }, []);

  const fecharFormulario = useCallback(() => {
    setModalFormularioVisivel(false);
    setClienteEditando(null);
    setFormulario(FORMULARIO_INICIAL);
  }, []);

  const alterarFormulario = useCallback(
    (campo: keyof FormularioCliente, valor: string) => {
      setFormulario((atual) => ({
        ...atual,
        [campo]: valor,
      }));
    },
    []
  );

  const salvarCliente = useCallback(async () => {
    try {
      setSalvando(true);

      const dados: CriarClienteDTO = {
        nome: formulario.nome,
        telefone: formulario.telefone,
        endereco: formulario.endereco,
      };

      if (clienteEditando) {
        await clienteController.atualizar({
          id: clienteEditando.id,
          ...dados,
        });
      } else {
        await clienteController.criar(dados);
      }

      fecharFormulario();
      await carregarClientes();
    } finally {
      setSalvando(false);
    }
  }, [
    formulario,
    clienteEditando,
    fecharFormulario,
    carregarClientes,
  ]);

  const alterarStatusCliente = useCallback(async () => {
    if (!clienteSelecionado) {
      return;
    }

    try {
      setAlterandoStatus(true);
      await clienteController.alterarStatus(
        clienteSelecionado.id,
        clienteSelecionado.ativo !== 1
      );
      fecharDetalhes();
      await carregarClientes();
    } finally {
      setAlterandoStatus(false);
    }
  }, [clienteSelecionado, fecharDetalhes, carregarClientes]);

  const ordenarClientes = useCallback(
    (campo: CampoOrdenacaoCliente) => {
      if (campo === campoOrdenacao) {
        setDirecaoOrdenacao((direcaoAtual) =>
          direcaoAtual === 'ASC' ? 'DESC' : 'ASC'
        );
        return;
      }

      setCampoOrdenacao(campo);
      setDirecaoOrdenacao('ASC');
    },
    [campoOrdenacao]
  );

  const indicadorOrdenacao = useCallback(
    (campo: CampoOrdenacaoCliente): string => {
      if (campoOrdenacao !== campo) {
        return '';
      }

      return direcaoOrdenacao === 'ASC' ? ' ▲' : ' ▼';
    },
    [campoOrdenacao, direcaoOrdenacao]
  );

  const mensagemErro = useCallback(
    (error: unknown, fallback: string) =>
      getErrorMessage(error, fallback),
    []
  );

  return useMemo(
    () => ({
      clientes,
      carregando,
      salvando,
      alterandoStatus,
      situacao,
      termoBusca,
      campoOrdenacao,
      direcaoOrdenacao,
      formulario,
      clienteSelecionado,
      clienteEditando,
      modalFormularioVisivel,
      modalDetalhesVisivel,
      setTermoBusca,
      setSituacao,
      carregarClientes,
      abrirCadastro,
      abrirDetalhes,
      fecharDetalhes,
      abrirEdicao,
      fecharFormulario,
      alterarFormulario,
      salvarCliente,
      alterarStatusCliente,
      ordenarClientes,
      indicadorOrdenacao,
      mensagemErro,
    }),
    [
      clientes,
      carregando,
      salvando,
      alterandoStatus,
      situacao,
      termoBusca,
      campoOrdenacao,
      direcaoOrdenacao,
      formulario,
      clienteSelecionado,
      clienteEditando,
      modalFormularioVisivel,
      modalDetalhesVisivel,
      carregarClientes,
      abrirCadastro,
      abrirDetalhes,
      fecharDetalhes,
      abrirEdicao,
      fecharFormulario,
      alterarFormulario,
      salvarCliente,
      alterarStatusCliente,
      ordenarClientes,
      indicadorOrdenacao,
      mensagemErro,
    ]
  );
}
