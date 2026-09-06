import { useCallback, useMemo, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import { estoqueController } from '../../di/estoqueContainer';
import {
  UNIDADES_MEDIDA_ESTOQUE,
  type CampoScannerEstoque,
  type DirecaoOrdenacao,
  type FormularioProdutoEstoque,
  type ModoFormularioProduto,
  type OrdenarProdutoEstoquePor,
  type ProdutoEstoque,
  type UnidadeMedidaEstoque,
} from '../../domain/models/ProdutoEstoque';

const FORMULARIO_INICIAL: FormularioProdutoEstoque = {
  nome: '',
  codigoBarras: '',
  unidadeMedida: 'un',
  quantidadeMinima: '',
};

export function obterNomeProduto(produto: ProdutoEstoque): string {
  return produto.nome || produto.descricao || 'Produto sem nome';
}

export function obterRotuloUnidade(unidade?: string): string {
  const normalizada = unidade?.trim().toLowerCase() || 'un';
  const rotulos: Record<string, string> = {
    un: 'un',
    kg: 'kg',
    g: 'g',
    l: 'L',
    ml: 'ml',
    caixa: 'caixa',
    pacote: 'pacote',
    duzia: 'dúzia',
  };

  return rotulos[normalizada] ?? unidade ?? 'un';
}

export function useEstoque() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [situacao, setSituacao] =
    useState<'ATIVOS' | 'INATIVOS'>('ATIVOS');

  const [busca, setBusca] = useState('');
  const [ordenarPor, setOrdenarPor] =
    useState<OrdenarProdutoEstoquePor>('nome');
  const [direcao, setDirecao] =
    useState<DirecaoOrdenacao>('ASC');

  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null);
  const [modoFormulario, setModoFormulario] =
    useState<ModoFormularioProduto>('cadastro');
  const [formulario, setFormulario] =
    useState<FormularioProdutoEstoque>(FORMULARIO_INICIAL);

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [scannerVisivel, setScannerVisivel] = useState(false);
  const [campoScanner, setCampoScanner] =
    useState<CampoScannerEstoque>('busca');

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setProdutos(
        await estoqueController.listar({
          termo: busca,
          ordenarPor,
          direcao,
          situacao,
        })
      );
    } finally {
      setCarregando(false);
    }
  }, [busca, ordenarPor, direcao, situacao]);

  const abrirCadastro = useCallback(() => {
    setModoFormulario('cadastro');
    setProdutoSelecionado(null);
    setFormulario(FORMULARIO_INICIAL);
    setModalFormulario(true);
  }, []);

  const abrirDetalhes = useCallback((produto: ProdutoEstoque) => {
    setProdutoSelecionado(produto);
    setModalDetalhes(true);
  }, []);

  const fecharDetalhes = useCallback(() => {
    setProdutoSelecionado(null);
    setModalDetalhes(false);
  }, []);

  const abrirEdicao = useCallback(() => {
    if (!produtoSelecionado) return;

    const unidade = produtoSelecionado.unidade_medida
      ?.trim()
      .toLowerCase() as UnidadeMedidaEstoque;

    setModoFormulario('edicao');
    setFormulario({
      nome: obterNomeProduto(produtoSelecionado),
      codigoBarras: produtoSelecionado.codigo_barras ?? '',
      unidadeMedida: UNIDADES_MEDIDA_ESTOQUE.includes(unidade)
        ? unidade
        : 'un',
      quantidadeMinima: produtoSelecionado.quantidade_minima
        ? String(produtoSelecionado.quantidade_minima).replace('.', ',')
        : '',
    });
    setModalDetalhes(false);
    setModalFormulario(true);
  }, [produtoSelecionado]);

  const fecharFormulario = useCallback(() => {
    setModalFormulario(false);
    setProdutoSelecionado(null);
    setFormulario(FORMULARIO_INICIAL);
  }, []);

  const alterarFormulario = useCallback(
    (
      campo: keyof FormularioProdutoEstoque,
      valor: string
    ) => {
      setFormulario((atual) => ({
        ...atual,
        [campo]: valor,
      }));
    },
    []
  );

  const salvar = useCallback(async () => {
    try {
      setSalvando(true);
      const dados = {
        nome: formulario.nome,
        codigo_barras: formulario.codigoBarras,
        unidade_medida: formulario.unidadeMedida,
        quantidade_minima: formulario.quantidadeMinima.trim()
          ? Number(formulario.quantidadeMinima.replace(',', '.'))
          : 0,
      };

      if (modoFormulario === 'cadastro') {
        await estoqueController.criar(dados);
      } else {
        if (!produtoSelecionado) {
          throw new Error('Produto inválido.');
        }

        await estoqueController.atualizar({
          id: produtoSelecionado.id,
          ...dados,
        });
      }

      fecharFormulario();
      await carregar();
    } finally {
      setSalvando(false);
    }
  }, [
    formulario,
    modoFormulario,
    produtoSelecionado,
    fecharFormulario,
    carregar,
  ]);

  const alterarStatus = useCallback(async () => {
    if (!produtoSelecionado) return;

    try {
      setAlterandoStatus(true);
      await estoqueController.alterarStatus(
        produtoSelecionado.id,
        produtoSelecionado.ativo !== 1
      );
      fecharDetalhes();
      await carregar();
    } finally {
      setAlterandoStatus(false);
    }
  }, [produtoSelecionado, fecharDetalhes, carregar]);

  const alternarOrdenacao = useCallback(
    (campo: OrdenarProdutoEstoquePor) => {
      if (campo === ordenarPor) {
        setDirecao((atual) =>
          atual === 'ASC' ? 'DESC' : 'ASC'
        );
        return;
      }

      setOrdenarPor(campo);
      setDirecao('ASC');
    },
    [ordenarPor]
  );

  const abrirScanner = useCallback(
    (campo: CampoScannerEstoque) => {
      setCampoScanner(campo);
      setScannerVisivel(true);
    },
    []
  );

  const fecharScanner = useCallback(() => {
    setScannerVisivel(false);
  }, []);

  const receberCodigo = useCallback(
    (codigo: string) => {
      if (campoScanner === 'busca') {
        setBusca(codigo);
      } else {
        alterarFormulario('codigoBarras', codigo);
      }

      setScannerVisivel(false);
    },
    [campoScanner, alterarFormulario]
  );

  const mensagemErro = useCallback(
    (error: unknown, fallback: string) =>
      getErrorMessage(error, fallback),
    []
  );

  return useMemo(
    () => ({
      produtos,
      carregando,
      salvando,
      alterandoStatus,
      situacao,
      busca,
      ordenarPor,
      direcao,
      produtoSelecionado,
      modoFormulario,
      formulario,
      modalDetalhes,
      modalFormulario,
      scannerVisivel,
      setBusca,
      setSituacao,
      carregar,
      abrirCadastro,
      abrirDetalhes,
      fecharDetalhes,
      abrirEdicao,
      fecharFormulario,
      alterarFormulario,
      salvar,
      alterarStatus,
      alternarOrdenacao,
      abrirScanner,
      fecharScanner,
      receberCodigo,
      mensagemErro,
    }),
    [
      produtos,
      carregando,
      salvando,
      alterandoStatus,
      situacao,
      busca,
      ordenarPor,
      direcao,
      produtoSelecionado,
      modoFormulario,
      formulario,
      modalDetalhes,
      modalFormulario,
      scannerVisivel,
      carregar,
      abrirCadastro,
      abrirDetalhes,
      fecharDetalhes,
      abrirEdicao,
      fecharFormulario,
      alterarFormulario,
      salvar,
      alterarStatus,
      alternarOrdenacao,
      abrirScanner,
      fecharScanner,
      receberCodigo,
      mensagemErro,
    ]
  );
}
