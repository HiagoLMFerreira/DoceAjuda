import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import BarcodeScannerModal from '../components/BarcodeScannerModal';
import {
  CustoFixoDatabase,
  CustoVariavelDatabase,
  NovoProdutoVenda,
  ParametrosPrecificacao,
  ProdutoEstoque,
  ProdutoParaReceita,
  ProdutoVendaDatabase,
  ProdutoVendaDetalhado,
  ReceitaDatabase,
  ReceitaParaPrecificacao,
  adicionarCustoFixo,
  adicionarCustoVariavel,
  alterarStatusCustoFixo,
  alterarStatusCustoVariavel,
  atualizarCustoFixo,
  atualizarCustoVariavel,
  atualizarProdutoVendaCompleto,
  buscarParametrosPrecificacao,
  buscarProdutoVendaDetalhado,
  buscarReceitaParaPrecificacao,
  calcularCustoIngrediente,
  calcularCustoMaoDeObra,
  calcularCustoOperacionalRateado,
  calcularPrecoSugerido,
  excluirCustoFixo,
  excluirCustoVariavel,
  excluirProdutoVenda,
  extrairNumeroRendimento,
  formatarMoeda,
  listarCustosFixos,
  listarCustosVariaveis,
  listarProdutos,
  listarProdutosVenda,
  listarReceitas,
  salvarParametrosPrecificacao,
  salvarProdutoVendaCompleto,
} from '../database/database';

type ModoFormulario = 'cadastro' | 'edicao';
type AbaParametros =
  | 'menu'
  | 'fixos'
  | 'variaveis'
  | 'maoDeObra'
  | 'margem'
  | 'ajuda';
type TipoCusto = 'fixo' | 'variavel';
type OrdenarProdutoVendaPor = 'nome' | 'preco_venda';
type DirecaoOrdenacaoProduto = 'asc' | 'desc';

type ReceitaProdutoLocal = {
  receita_id: number;
  nome: string;
  rendimento: string;
  quantidade_unidades: number;
  custo_receita_total: number;
  custo_unitario: number;
  custo_total: number;
  valido: boolean;
  mensagem?: string;
};

type ItemProdutoLocal = {
  produto_estoque_id: number;
  nome: string;
  quantidade_usada: number;
  unidade_medida: string;
  preco_medio: number;
  quantidade_embalagem: number;
  unidade_medida_produto: string;
  custo_total: number;
  valido: boolean;
  mensagem?: string;
};

type ProdutoEstoqueSelecionavel = ProdutoEstoque | ProdutoParaReceita;

const PARAMETROS_INICIAIS: ParametrosPrecificacao = {
  id: 1,
  salario_desejado: 0,
  horas_trabalhadas_mes: 180,
  margem_lucro: 30,
  valor_hora: 0,
  custos_fixos_mensais: 0,
  custos_variaveis: 0,
};

const UNIDADES = ['g', 'kg', 'ml', 'l', 'un'];

function formatarNumero(valor: number): string {
  return Number(valor || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 3,
  });
}

export default function ProdutosVendaScreen() {
  const navigation = useNavigation<any>();

  const [produtos, setProdutos] = useState<ProdutoVendaDatabase[]>([]);
  const [busca, setBusca] = useState('');
  const [ordenarProdutoPor, setOrdenarProdutoPor] =
    useState<OrdenarProdutoVendaPor>('nome');
  const [direcaoOrdenacaoProduto, setDirecaoOrdenacaoProduto] =
    useState<DirecaoOrdenacaoProduto>('asc');
  const [produtoDetalhado, setProdutoDetalhado] =
    useState<ProdutoVendaDetalhado | null>(null);

  const [parametros, setParametros] =
    useState<ParametrosPrecificacao>(PARAMETROS_INICIAIS);
  const [custosFixos, setCustosFixos] = useState<CustoFixoDatabase[]>([]);
  const [custosVariaveis, setCustosVariaveis] = useState<
    CustoVariavelDatabase[]
  >([]);

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalParametros, setModalParametros] = useState(false);
  const [modalAdicionarReceita, setModalAdicionarReceita] = useState(false);
  const [modalSelecionarReceita, setModalSelecionarReceita] = useState(false);
  const [modalAdicionarItem, setModalAdicionarItem] = useState(false);
  const [modalSelecionarItem, setModalSelecionarItem] = useState(false);
  const [scannerVisivel, setScannerVisivel] = useState(false);

  const [modoFormulario, setModoFormulario] =
    useState<ModoFormulario>('cadastro');
  const [produtoIdEdicao, setProdutoIdEdicao] = useState<number | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tempoProducao, setTempoProducao] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [receitasProduto, setReceitasProduto] = useState<ReceitaProdutoLocal[]>(
    []
  );
  const [itensProduto, setItensProduto] = useState<ItemProdutoLocal[]>([]);

  const [receitasDisponiveis, setReceitasDisponiveis] = useState<
    ReceitaDatabase[]
  >([]);
  const [buscaReceita, setBuscaReceita] = useState('');
  const [receitaSelecionada, setReceitaSelecionada] =
    useState<ReceitaParaPrecificacao | null>(null);
  const [quantidadeReceita, setQuantidadeReceita] = useState('');

  const [buscaItem, setBuscaItem] = useState('');
  const [itensEncontrados, setItensEncontrados] = useState<ProdutoEstoque[]>(
    []
  );
  const [itemSelecionado, setItemSelecionado] = useState<ProdutoEstoque | null>(
    null
  );
  const [quantidadeItem, setQuantidadeItem] = useState('');
  const [unidadeItem, setUnidadeItem] = useState('un');

  const [abaParametros, setAbaParametros] = useState<AbaParametros>('menu');
  const [custoEditandoId, setCustoEditandoId] = useState<number | null>(null);
  const [nomeCusto, setNomeCusto] = useState('');
  const [valorCusto, setValorCusto] = useState('');
  const [salarioDesejado, setSalarioDesejado] = useState('');
  const [horasTrabalhadas, setHorasTrabalhadas] = useState('');
  const [margemLucro, setMargemLucro] = useState('');

  const textoParaNumero = (valor: string): number => {
    const texto = valor.trim().replace(/\s/g, '');

    if (!texto) {
      return 0;
    }

    const normalizado = texto.includes(',')
      ? texto.replace(/\./g, '').replace(',', '.')
      : texto;

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
  };

  const numeroParaTexto = (valor: number): string => {
    if (!valor) {
      return '';
    }

    return String(valor).replace('.', ',');
  };

  const obterNomeProduto = (produto: ProdutoEstoqueSelecionavel): string =>
    produto.nome || produto.descricao || 'Produto sem nome';

  const obterQuantidadeEstoque = (
    produto: ProdutoEstoqueSelecionavel
  ): number => Number(produto.quantidade || 0);

  const obterUnidadeEstoque = (produto: ProdutoEstoqueSelecionavel): string =>
    produto.unidade_medida || 'un';

  const totalCustosFixos = useMemo(
    () =>
      custosFixos
        .filter((item) => item.ativo === 1)
        .reduce((total, item) => total + item.valor, 0),
    [custosFixos]
  );

  const totalCustosVariaveis = useMemo(
    () =>
      custosVariaveis
        .filter((item) => item.ativo === 1)
        .reduce((total, item) => total + item.valor, 0),
    [custosVariaveis]
  );

  const tempoProducaoNumero = useMemo(
    () => textoParaNumero(tempoProducao),
    [tempoProducao]
  );

  const custoReceitas = useMemo(
    () => receitasProduto.reduce((total, item) => total + item.custo_total, 0),
    [receitasProduto]
  );

  const custoItens = useMemo(
    () => itensProduto.reduce((total, item) => total + item.custo_total, 0),
    [itensProduto]
  );

  const custoMaoDeObra = useMemo(
    () =>
      calcularCustoMaoDeObra(
        parametros.salario_desejado,
        parametros.horas_trabalhadas_mes,
        tempoProducaoNumero
      ),
    [parametros, tempoProducaoNumero]
  );

  const custoOperacional = useMemo(
    () =>
      calcularCustoOperacionalRateado(
        totalCustosFixos,
        totalCustosVariaveis,
        parametros.horas_trabalhadas_mes,
        tempoProducaoNumero
      ),
    [
      totalCustosFixos,
      totalCustosVariaveis,
      parametros.horas_trabalhadas_mes,
      tempoProducaoNumero,
    ]
  );

  const custoTotal = useMemo(
    () => custoReceitas + custoItens + custoMaoDeObra + custoOperacional,
    [custoReceitas, custoItens, custoMaoDeObra, custoOperacional]
  );

  const precoSugerido = useMemo(
    () => calcularPrecoSugerido(custoTotal, parametros.margem_lucro),
    [custoTotal, parametros.margem_lucro]
  );

  const precoVendaNumero = useMemo(
    () => textoParaNumero(precoVenda),
    [precoVenda]
  );

  const produtosOrdenados = useMemo(() => {
    return [...produtos].sort((a, b) => {
      let comparacao = 0;

      if (ordenarProdutoPor === 'preco_venda') {
        comparacao = Number(a.preco_venda) - Number(b.preco_venda);
      } else {
        comparacao = a.nome.localeCompare(b.nome, 'pt-BR', {
          sensitivity: 'base',
        });
      }

      // Usa o ID como desempate para manter a ordem previsível.
      if (comparacao === 0) {
        comparacao = Number(a.id) - Number(b.id);
      }

      return direcaoOrdenacaoProduto === 'asc' ? comparacao : comparacao * -1;
    });
  }, [produtos, ordenarProdutoPor, direcaoOrdenacaoProduto]);

  const alterarOrdenacaoProduto = (campo: OrdenarProdutoVendaPor) => {
    if (ordenarProdutoPor === campo) {
      setDirecaoOrdenacaoProduto((direcaoAtual) =>
        direcaoAtual === 'asc' ? 'desc' : 'asc'
      );
      return;
    }

    setOrdenarProdutoPor(campo);
    setDirecaoOrdenacaoProduto('asc');
  };

  const receitasFiltradas = useMemo(() => {
    const filtro = buscaReceita.trim().toLowerCase();

    return receitasDisponiveis
      .filter((receita) => {
        if (!filtro) {
          return true;
        }

        return (
          receita.nome.toLowerCase().includes(filtro) ||
          receita.rendimento.toLowerCase().includes(filtro) ||
          String(receita.id).includes(filtro)
        );
      })
      .sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR', {
          sensitivity: 'base',
        })
      );
  }, [receitasDisponiveis, buscaReceita]);

  const produtosFiltrados = useMemo(() => {
    const textoBusca = buscaItem.trim().toLowerCase();

    if (!textoBusca) {
      return itensEncontrados;
    }

    return itensEncontrados.filter((produto) => {
      const id = String(produto.id);
      const nomeProduto = obterNomeProduto(produto).toLowerCase();
      const codigoBarras = String(produto.codigo_barras || '').toLowerCase();

      return (
        id.includes(textoBusca) ||
        nomeProduto.includes(textoBusca) ||
        codigoBarras.includes(textoBusca)
      );
    });
  }, [itensEncontrados, buscaItem]);

  const carregarProdutos = useCallback(async () => {
    try {
      const resultado = await listarProdutosVenda(busca);
      setProdutos(resultado);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos para venda.');
    }
  }, [busca]);

  const carregarParametros = useCallback(async () => {
    try {
      const [dadosParametros, fixos, variaveis] = await Promise.all([
        buscarParametrosPrecificacao(),
        listarCustosFixos(true),
        listarCustosVariaveis(true),
      ]);

      setParametros(dadosParametros);
      setCustosFixos(fixos);
      setCustosVariaveis(variaveis);
      setSalarioDesejado(numeroParaTexto(dadosParametros.salario_desejado));
      setHorasTrabalhadas(
        numeroParaTexto(dadosParametros.horas_trabalhadas_mes)
      );
      setMargemLucro(numeroParaTexto(dadosParametros.margem_lucro));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os parâmetros.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
      carregarParametros();
    }, [carregarProdutos, carregarParametros])
  );

  const limparFormulario = () => {
    setProdutoIdEdicao(null);
    setNome('');
    setDescricao('');
    setTempoProducao('');
    setPrecoVenda('');
    setReceitasProduto([]);
    setItensProduto([]);
  };

  const limparModalReceita = () => {
    setBuscaReceita('');
    setReceitaSelecionada(null);
    setQuantidadeReceita('');
  };

  const limparModalItem = () => {
    setBuscaItem('');
    setItensEncontrados([]);
    setItemSelecionado(null);
    setQuantidadeItem('');
    setUnidadeItem('un');
  };

  const limparFormularioCusto = () => {
    setCustoEditandoId(null);
    setNomeCusto('');
    setValorCusto('');
  };

  const abrirCadastro = () => {
    setModoFormulario('cadastro');
    limparFormulario();
    setModalFormulario(true);
  };

  const abrirParametros = async () => {
    await carregarParametros();
    setAbaParametros('menu');
    limparFormularioCusto();
    setModalParametros(true);
  };

  const calcularReceita = (
    receita: ReceitaParaPrecificacao,
    quantidadeUnidades: number
  ): ReceitaProdutoLocal => {
    const resultados = receita.itens.map((item) =>
      calcularCustoIngrediente(
        item.preco_medio,
        item.quantidade_embalagem,
        item.unidade_medida_produto,
        item.quantidade_numero,
        item.unidade_medida
      )
    );

    const erro = resultados.find((resultado) => !resultado.unidadeCompativel);
    const custoReceitaTotal = resultados.reduce(
      (total, resultado) => total + resultado.custo,
      0
    );
    const rendimento = extrairNumeroRendimento(receita.rendimento);
    const custoUnitario = rendimento > 0 ? custoReceitaTotal / rendimento : 0;

    return {
      receita_id: receita.id,
      nome: receita.nome,
      rendimento: receita.rendimento,
      quantidade_unidades: quantidadeUnidades,
      custo_receita_total: custoReceitaTotal,
      custo_unitario: custoUnitario,
      custo_total: custoUnitario * quantidadeUnidades,
      valido: !erro && rendimento > 0,
      mensagem:
        erro?.mensagem ||
        (rendimento <= 0
          ? 'O rendimento da receita não possui uma quantidade numérica válida.'
          : undefined),
    };
  };

  const calcularItem = (
    produto: ProdutoEstoqueSelecionavel,
    quantidade: number,
    unidade: string
  ): ItemProdutoLocal => {
    const resultado = calcularCustoIngrediente(
      produto.preco_medio,
      produto.quantidade_embalagem,
      produto.unidade_medida,
      quantidade,
      unidade
    );

    return {
      produto_estoque_id: produto.id,
      nome: obterNomeProduto(produto),
      quantidade_usada: quantidade,
      unidade_medida: unidade,
      preco_medio: produto.preco_medio,
      quantidade_embalagem: produto.quantidade_embalagem,
      unidade_medida_produto: produto.unidade_medida,
      custo_total: resultado.custo,
      valido: resultado.unidadeCompativel,
      mensagem: resultado.mensagem,
    };
  };

  const carregarReceitasDisponiveis = async () => {
    try {
      const receitas = await listarReceitas();
      setReceitasDisponiveis(receitas);
      return receitas;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as receitas.');
      setReceitasDisponiveis([]);
      return [] as ReceitaDatabase[];
    }
  };

  const pesquisarReceitas = (texto: string) => {
    setBuscaReceita(texto);
  };

  const abrirSelecaoReceita = async () => {
    setBuscaReceita('');
    await carregarReceitasDisponiveis();
    setModalSelecionarReceita(true);
  };

  const abrirAdicionarReceita = async () => {
    limparModalReceita();
    setModalFormulario(false);
    setModalAdicionarReceita(true);
    await abrirSelecaoReceita();
  };

  const selecionarReceita = async (receita: ReceitaDatabase) => {
    try {
      const detalhe = await buscarReceitaParaPrecificacao(receita.id);

      if (!detalhe) {
        Alert.alert('Erro', 'Receita não encontrada.');
        return;
      }

      setReceitaSelecionada(detalhe);
      setModalSelecionarReceita(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a receita.');
    }
  };

  const adicionarReceitaAoProduto = () => {
    if (!receitaSelecionada) {
      Alert.alert('Atenção', 'Selecione uma receita.');
      return;
    }

    const quantidade = textoParaNumero(quantidadeReceita);

    if (quantidade <= 0) {
      Alert.alert(
        'Atenção',
        'Informe quantas unidades da receita serão usadas.'
      );
      return;
    }

    if (
      receitasProduto.some((item) => item.receita_id === receitaSelecionada.id)
    ) {
      Alert.alert('Atenção', 'Essa receita já foi adicionada ao produto.');
      return;
    }

    const itemCalculado = calcularReceita(receitaSelecionada, quantidade);

    if (!itemCalculado.valido) {
      Alert.alert('Não foi possível calcular', itemCalculado.mensagem);
      return;
    }

    setReceitasProduto((atuais) => [...atuais, itemCalculado]);
    setModalAdicionarReceita(false);
    limparModalReceita();
    setModalFormulario(true);
  };

  const carregarProdutosDoEstoque = async () => {
    try {
      const resultado = await listarProdutos('nome', 'ASC');
      setItensEncontrados(resultado);
      return resultado;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos do estoque.');
      setItensEncontrados([]);
      return [] as ProdutoEstoque[];
    }
  };

  const pesquisarProdutos = (texto: string) => {
    setBuscaItem(texto);
  };

  const abrirSelecaoProduto = async () => {
    setBuscaItem('');
    await carregarProdutosDoEstoque();
    setModalSelecionarItem(true);
  };

  const abrirAdicionarItem = async () => {
    limparModalItem();
    setModalFormulario(false);
    setModalAdicionarItem(true);
    await abrirSelecaoProduto();
  };

  const selecionarProduto = (produto: ProdutoEstoque) => {
    setItemSelecionado(produto);

    const unidadeProduto = obterUnidadeEstoque(produto).toLowerCase();

    if (UNIDADES.includes(unidadeProduto)) {
      setUnidadeItem(unidadeProduto);
    }

    setModalSelecionarItem(false);
    setModalAdicionarItem(true);
  };

  const abrirScanner = () => {
    setScannerVisivel(true);
  };

  const adicionarItemAoProduto = () => {
    if (!itemSelecionado) {
      Alert.alert('Atenção', 'Selecione um item do estoque.');
      return;
    }

    const quantidade = textoParaNumero(quantidadeItem);

    if (quantidade <= 0) {
      Alert.alert('Atenção', 'Informe a quantidade usada.');
      return;
    }

    if (
      itensProduto.some(
        (item) => item.produto_estoque_id === itemSelecionado.id
      )
    ) {
      Alert.alert('Atenção', 'Esse item já foi adicionado ao produto.');
      return;
    }

    const itemCalculado = calcularItem(
      itemSelecionado,
      quantidade,
      unidadeItem
    );

    if (!itemCalculado.valido) {
      Alert.alert('Unidades incompatíveis', itemCalculado.mensagem);
      return;
    }

    setItensProduto((atuais) => [...atuais, itemCalculado]);
    setModalAdicionarItem(false);
    limparModalItem();
    setModalFormulario(true);
  };

  const aoReceberCodigo = (codigo: string) => {
    setScannerVisivel(false);
    setBuscaItem(codigo.trim());
  };

  const removerReceita = (receitaId: number) => {
    setReceitasProduto((atuais) =>
      atuais.filter((item) => item.receita_id !== receitaId)
    );
  };

  const removerItem = (produtoEstoqueId: number) => {
    setItensProduto((atuais) =>
      atuais.filter((item) => item.produto_estoque_id !== produtoEstoqueId)
    );
  };

  const salvarProduto = async () => {
    try {
      if (!nome.trim()) {
        Alert.alert('Atenção', 'Informe o nome do produto.');
        return;
      }

      if (tempoProducaoNumero <= 0) {
        Alert.alert('Atenção', 'Informe o tempo de produção em minutos.');
        return;
      }

      if (receitasProduto.length === 0 && itensProduto.length === 0) {
        Alert.alert(
          'Atenção',
          'Adicione pelo menos uma receita ou item do estoque.'
        );
        return;
      }

      if (precoVendaNumero <= 0) {
        Alert.alert('Atenção', 'Informe o preço definitivo de venda.');
        return;
      }

      const componenteInvalido =
        receitasProduto.some((item) => !item.valido) ||
        itensProduto.some((item) => !item.valido);

      if (componenteInvalido) {
        Alert.alert(
          'Atenção',
          'Existe um componente com erro de cálculo ou unidade incompatível.'
        );
        return;
      }

      const dados: NovoProdutoVenda = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        tempo_producao_minutos: tempoProducaoNumero,
        custo_receitas: custoReceitas,
        custo_itens: custoItens,
        custo_mao_obra: custoMaoDeObra,
        custo_operacional: custoOperacional,
        custo_total: custoTotal,
        margem_lucro: parametros.margem_lucro,
        preco_sugerido: precoSugerido,
        preco_venda: precoVendaNumero,
        receitas: receitasProduto.map((item) => ({
          receita_id: item.receita_id,
          quantidade_unidades: item.quantidade_unidades,
        })),
        itens: itensProduto.map((item) => ({
          produto_estoque_id: item.produto_estoque_id,
          quantidade_usada: item.quantidade_usada,
          unidade_medida: item.unidade_medida,
        })),
      };

      if (modoFormulario === 'cadastro') {
        await salvarProdutoVendaCompleto(dados);
      } else {
        if (!produtoIdEdicao) {
          Alert.alert('Erro', 'Produto inválido para edição.');
          return;
        }

        await atualizarProdutoVendaCompleto(produtoIdEdicao, dados);
      }

      setModalFormulario(false);
      limparFormulario();
      await carregarProdutos();

      Alert.alert(
        'Sucesso',
        modoFormulario === 'cadastro'
          ? 'Produto cadastrado com sucesso.'
          : 'Produto atualizado com sucesso.'
      );
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o produto.';
      Alert.alert('Erro', mensagem);
    }
  };

  const abrirDetalhes = async (produto: ProdutoVendaDatabase) => {
    try {
      const detalhe = await buscarProdutoVendaDetalhado(produto.id);

      if (!detalhe) {
        Alert.alert('Erro', 'Produto não encontrado.');
        return;
      }

      setProdutoDetalhado(detalhe);
      setModalDetalhes(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir os detalhes do produto.');
    }
  };

  const abrirEdicao = async () => {
    if (!produtoDetalhado) {
      return;
    }

    try {
      const receitasCalculadas = await Promise.all(
        produtoDetalhado.receitas.map(async (item) => {
          const receita = await buscarReceitaParaPrecificacao(item.receita_id);

          if (!receita) {
            return null;
          }

          return calcularReceita(receita, item.quantidade_unidades);
        })
      );

      const itensCalculados: ItemProdutoLocal[] = produtoDetalhado.itens.map(
        (item) => {
          const produto: ProdutoParaReceita = {
            id: item.produto_estoque_id,
            nome: item.produto_nome,
            descricao: item.produto_nome,
            codigo_barras: '',
            preco_medio: item.preco_medio,
            quantidade: 0,
            quantidade_embalagem: item.quantidade_embalagem,
            unidade_medida: item.unidade_medida_produto,
          };

          return calcularItem(
            produto,
            item.quantidade_usada,
            item.unidade_medida
          );
        }
      );

      setModoFormulario('edicao');
      setProdutoIdEdicao(produtoDetalhado.id);
      setNome(produtoDetalhado.nome);
      setDescricao(produtoDetalhado.descricao);
      setTempoProducao(
        numeroParaTexto(produtoDetalhado.tempo_producao_minutos)
      );
      setPrecoVenda(numeroParaTexto(produtoDetalhado.preco_venda));
      setReceitasProduto(
        receitasCalculadas.filter(
          (item): item is ReceitaProdutoLocal => item !== null
        )
      );
      setItensProduto(itensCalculados);
      setModalDetalhes(false);
      setModalFormulario(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível preparar o produto para edição.');
    }
  };

  const confirmarExclusaoProduto = () => {
    if (!produtoDetalhado) {
      return;
    }

    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${produtoDetalhado.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirProdutoVenda(produtoDetalhado.id);
              setModalDetalhes(false);
              setProdutoDetalhado(null);
              await carregarProdutos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto.');
            }
          },
        },
      ]
    );
  };

  const salvarCusto = async (tipo: TipoCusto) => {
    try {
      const valor = textoParaNumero(valorCusto);

      if (!nomeCusto.trim()) {
        Alert.alert('Atenção', 'Informe o nome do custo.');
        return;
      }

      if (valor < 0) {
        Alert.alert('Atenção', 'Informe um valor válido.');
        return;
      }

      if (tipo === 'fixo') {
        if (custoEditandoId) {
          await atualizarCustoFixo(custoEditandoId, nomeCusto, valor);
        } else {
          await adicionarCustoFixo(nomeCusto, valor);
        }
      } else if (custoEditandoId) {
        await atualizarCustoVariavel(custoEditandoId, nomeCusto, valor);
      } else {
        await adicionarCustoVariavel(nomeCusto, valor);
      }

      limparFormularioCusto();
      await carregarParametros();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o custo.';
      Alert.alert('Erro', mensagem);
    }
  };

  const editarCusto = (item: CustoFixoDatabase | CustoVariavelDatabase) => {
    setCustoEditandoId(item.id);
    setNomeCusto(item.nome);
    setValorCusto(numeroParaTexto(item.valor));
  };

  const confirmarExclusaoCusto = (tipo: TipoCusto, id: number) => {
    Alert.alert('Excluir custo', 'Deseja realmente excluir este custo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            if (tipo === 'fixo') {
              await excluirCustoFixo(id);
            } else {
              await excluirCustoVariavel(id);
            }

            limparFormularioCusto();
            await carregarParametros();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o custo.');
          }
        },
      },
    ]);
  };

  const alterarStatusCusto = async (
    tipo: TipoCusto,
    id: number,
    ativo: boolean
  ) => {
    try {
      if (tipo === 'fixo') {
        await alterarStatusCustoFixo(id, ativo);
      } else {
        await alterarStatusCustoVariavel(id, ativo);
      }

      await carregarParametros();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status do custo.');
    }
  };

  const salvarMaoDeObra = async () => {
    try {
      const salario = textoParaNumero(salarioDesejado);
      const horas = textoParaNumero(horasTrabalhadas);

      if (salario < 0 || horas <= 0) {
        Alert.alert('Atenção', 'Informe salário e horas válidos.');
        return;
      }

      await salvarParametrosPrecificacao(
        salario,
        horas,
        parametros.margem_lucro
      );
      await carregarParametros();
      setAbaParametros('menu');
      Alert.alert('Sucesso', 'Parâmetros de mão de obra salvos.');
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a mão de obra.';
      Alert.alert('Erro', mensagem);
    }
  };

  const salvarMargem = async () => {
    try {
      const margem = textoParaNumero(margemLucro);

      if (margem < 0 || margem >= 100) {
        Alert.alert('Atenção', 'A margem deve estar entre 0% e 99,99%.');
        return;
      }

      await salvarParametrosPrecificacao(
        parametros.salario_desejado,
        parametros.horas_trabalhadas_mes,
        margem
      );
      await carregarParametros();
      setAbaParametros('menu');
      Alert.alert('Sucesso', 'Margem de lucro salva.');
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a margem.';
      Alert.alert('Erro', mensagem);
    }
  };

  const fecharParametros = () => {
    setModalParametros(false);
    setAbaParametros('menu');
    limparFormularioCusto();
  };

  const renderProduto = ({ item }: { item: ProdutoVendaDatabase }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.82}
      onPress={() => abrirDetalhes(item)}
    >
      <View style={styles.produtoNomeArea}>
        <Text style={styles.produtoNome} numberOfLines={2}>
          {item.nome}
        </Text>
        <Text style={styles.produtoCusto}>
          Custo: {formatarMoeda(item.custo_total)}
        </Text>
      </View>

      <View style={styles.produtoPrecoArea}>
        <Text style={styles.produtoPrecoLabel}>VENDA</Text>
        <Text style={styles.produtoPreco}>
          {formatarMoeda(item.preco_venda)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#333" />
    </TouchableOpacity>
  );

  const renderListaCustos = (tipo: TipoCusto) => {
    const lista = tipo === 'fixo' ? custosFixos : custosVariaveis;
    const total = tipo === 'fixo' ? totalCustosFixos : totalCustosVariaveis;

    return (
      <>
        <TouchableOpacity
          style={styles.voltarModuloButton}
          onPress={() => {
            limparFormularioCusto();
            setAbaParametros('menu');
          }}
        >
          <Ionicons name="arrow-back" size={19} color="#111" />
          <Text style={styles.voltarModuloText}>Voltar aos parâmetros</Text>
        </TouchableOpacity>

        <Text style={styles.parametroModuloTitulo}>
          {tipo === 'fixo' ? 'CUSTOS FIXOS' : 'CUSTOS VARIÁVEIS'}
        </Text>

        <View style={styles.custoFormulario}>
          <Text style={styles.inputLabel}>Nome do custo:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Aluguel, energia, gás..."
            placeholderTextColor="#888"
            value={nomeCusto}
            onChangeText={setNomeCusto}
          />

          <Text style={styles.inputLabel}>Valor mensal:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 150,00"
            placeholderTextColor="#888"
            value={valorCusto}
            onChangeText={setValorCusto}
            keyboardType="numeric"
          />

          <View style={styles.formCustoButtons}>
            {custoEditandoId && (
              <TouchableOpacity
                style={[styles.smallActionButton, styles.grayButton]}
                onPress={limparFormularioCusto}
              >
                <Text style={styles.smallActionText}>Cancelar edição</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.smallActionButton, styles.blackButton]}
              onPress={() => salvarCusto(tipo)}
            >
              <Ionicons
                name={custoEditandoId ? 'save-outline' : 'add-outline'}
                size={18}
                color="#fff"
              />
              <Text style={styles.smallActionText}>
                {custoEditandoId ? 'Salvar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalCustoBox}>
          <Text style={styles.totalCustoLabel}>Total ativo mensal</Text>
          <Text style={styles.totalCustoValor}>{formatarMoeda(total)}</Text>
        </View>

        <View style={styles.listaCustos}>
          {lista.length === 0 ? (
            <Text style={styles.emptySmall}>Nenhum custo cadastrado.</Text>
          ) : (
            lista.map((item) => (
              <View
                key={`${tipo}-${item.id}`}
                style={[
                  styles.custoItem,
                  item.ativo === 0 && styles.custoItemInativo,
                ]}
              >
                <View style={styles.custoItemInfo}>
                  <Text style={styles.custoItemNome}>{item.nome}</Text>
                  <Text style={styles.custoItemValor}>
                    {formatarMoeda(item.valor)}
                  </Text>
                </View>

                <Switch
                  value={item.ativo === 1}
                  onValueChange={(ativo) =>
                    alterarStatusCusto(tipo, item.id, ativo)
                  }
                />

                <TouchableOpacity
                  style={styles.iconActionButton}
                  onPress={() => editarCusto(item)}
                >
                  <Ionicons name="create-outline" size={19} color="#111" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconActionButton, styles.deleteIconButton]}
                  onPress={() => confirmarExclusaoCusto(tipo, item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </>
    );
  };

  const renderConteudoParametros = () => {
    if (abaParametros === 'ajuda') {
      return (
        <>
          <TouchableOpacity
            style={styles.voltarModuloButton}
            onPress={() => setAbaParametros('menu')}
          >
            <Ionicons name="arrow-back" size={19} color="#111" />
            <Text style={styles.voltarModuloText}>Voltar aos parâmetros</Text>
          </TouchableOpacity>

          <Text style={styles.parametroModuloTitulo}>
            COMO FUNCIONA A PRECIFICAÇÃO?
          </Text>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="business-outline" size={22} color="#111" />
              <Text style={styles.ajudaTitulo}>Custos fixos</Text>
            </View>

            <Text style={styles.ajudaTexto}>
              São despesas mensais que existem mesmo quando não há produção,
              como aluguel, internet e contabilidade.
            </Text>
          </View>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="flash-outline" size={22} color="#111" />
              <Text style={styles.ajudaTitulo}>Custos variáveis</Text>
            </View>

            <Text style={styles.ajudaTexto}>
              São despesas mensais que podem aumentar ou diminuir, como água,
              energia e gás.
            </Text>
          </View>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="time-outline" size={22} color="#111" />
              <Text style={styles.ajudaTitulo}>Mão de obra</Text>
            </View>

            <Text style={styles.ajudaTexto}>
              O valor da hora é calculado dividindo o salário desejado pelas
              horas trabalhadas no mês. O produto recebe somente o custo do
              tempo gasto para produzi-lo.
            </Text>
          </View>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="calculator-outline" size={22} color="#111" />
              <Text style={styles.ajudaTitulo}>Rateio dos custos</Text>
            </View>

            <Text style={styles.ajudaTexto}>
              Os custos fixos e variáveis são somados, divididos pelas horas
              mensais e multiplicados pelo tempo gasto no produto.
            </Text>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>
                ((fixos + variáveis) ÷ horas mensais) × horas do produto
              </Text>
            </View>
          </View>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="trending-up-outline" size={22} color="#111" />
              <Text style={styles.ajudaTitulo}>Margem de lucro</Text>
            </View>

            <Text style={styles.ajudaTexto}>
              A margem informa qual porcentagem do preço de venda será lucro.
              Com custo de R$ 30,00 e margem de 30%, o preço sugerido será R$
              42,86.
            </Text>

            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>
                preço sugerido = custo ÷ (1 - margem)
              </Text>
            </View>
          </View>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="pricetag-outline" size={22} color="#111" />
              <Text style={styles.ajudaTitulo}>
                Preço sugerido e preço definitivo
              </Text>
            </View>

            <Text style={styles.ajudaTexto}>
              O sistema calcula um preço sugerido, mas o preço definitivo é
              informado pela pessoa no cadastro do produto.
            </Text>
          </View>
        </>
      );
    }

    if (abaParametros === 'fixos') {
      return renderListaCustos('fixo');
    }

    if (abaParametros === 'variaveis') {
      return renderListaCustos('variavel');
    }

    if (abaParametros === 'maoDeObra') {
      const salario = textoParaNumero(salarioDesejado);
      const horas = textoParaNumero(horasTrabalhadas);
      const valorHora = horas > 0 ? salario / horas : 0;

      return (
        <>
          <TouchableOpacity
            style={styles.voltarModuloButton}
            onPress={() => setAbaParametros('menu')}
          >
            <Ionicons name="arrow-back" size={19} color="#111" />
            <Text style={styles.voltarModuloText}>Voltar aos parâmetros</Text>
          </TouchableOpacity>

          <Text style={styles.parametroModuloTitulo}>MÃO DE OBRA</Text>

          <Text style={styles.inputLabel}>Salário desejado:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2200,00"
            placeholderTextColor="#888"
            value={salarioDesejado}
            onChangeText={setSalarioDesejado}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Horas trabalhadas no mês:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 180"
            placeholderTextColor="#888"
            value={horasTrabalhadas}
            onChangeText={setHorasTrabalhadas}
            keyboardType="numeric"
          />

          <View style={styles.calculoDestaqueBox}>
            <Text style={styles.calculoDestaqueLabel}>
              Valor calculado da hora
            </Text>
            <Text style={styles.calculoDestaqueValor}>
              {formatarMoeda(valorHora)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.fullBlackButton}
            onPress={salvarMaoDeObra}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.fullBlackButtonText}>Salvar mão de obra</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (abaParametros === 'margem') {
      const margem = textoParaNumero(margemLucro);
      const simulacao = calcularPrecoSugerido(100, margem);

      return (
        <>
          <TouchableOpacity
            style={styles.voltarModuloButton}
            onPress={() => setAbaParametros('menu')}
          >
            <Ionicons name="arrow-back" size={19} color="#111" />
            <Text style={styles.voltarModuloText}>Voltar aos parâmetros</Text>
          </TouchableOpacity>

          <Text style={styles.parametroModuloTitulo}>MARGEM DE LUCRO</Text>

          <Text style={styles.inputLabel}>Margem de lucro desejada (%):</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 30"
            placeholderTextColor="#888"
            value={margemLucro}
            onChangeText={setMargemLucro}
            keyboardType="numeric"
          />

          <View style={styles.simulacaoBox}>
            <Text style={styles.simulacaoTitulo}>Simulação</Text>
            <Text style={styles.simulacaoTexto}>
              Custo do produto: R$ 100,00
            </Text>
            <Text style={styles.simulacaoResultado}>
              Preço sugerido: {formatarMoeda(simulacao)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.fullBlackButton}
            onPress={salvarMargem}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.fullBlackButtonText}>Salvar margem</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <View style={styles.parametrosHeader}>
          <View style={styles.parametrosHeaderEspaco} />

          <Text style={styles.parametrosHeaderTitle}>
            PARÂMETROS DE PRECIFICAÇÃO
          </Text>

          <TouchableOpacity
            style={styles.ajudaButton}
            onPress={() => setAbaParametros('ajuda')}
            activeOpacity={0.8}
          >
            <Ionicons name="help" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.parametroCard}
          onPress={() => {
            limparFormularioCusto();
            setAbaParametros('fixos');
          }}
        >
          <View style={styles.parametroIconBox}>
            <Ionicons name="business-outline" size={26} color="#111" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Custos Fixos</Text>
            <Text style={styles.parametroCardSubtitle}>
              Total ativo: {formatarMoeda(totalCustosFixos)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parametroCard}
          onPress={() => {
            limparFormularioCusto();
            setAbaParametros('variaveis');
          }}
        >
          <View style={styles.parametroIconBox}>
            <Ionicons name="flash-outline" size={26} color="#111" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Custos Variáveis</Text>
            <Text style={styles.parametroCardSubtitle}>
              Total ativo: {formatarMoeda(totalCustosVariaveis)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parametroCard}
          onPress={() => setAbaParametros('maoDeObra')}
        >
          <View style={styles.parametroIconBox}>
            <Ionicons name="time-outline" size={26} color="#111" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Mão de Obra</Text>
            <Text style={styles.parametroCardSubtitle}>
              Valor da hora: {formatarMoeda(parametros.valor_hora)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parametroCard}
          onPress={() => setAbaParametros('margem')}
        >
          <View style={styles.parametroIconBox}>
            <Ionicons name="trending-up-outline" size={26} color="#111" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Margem de Lucro</Text>
            <Text style={styles.parametroCardSubtitle}>
              Margem atual: {parametros.margem_lucro}%
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeGrayButton}
          onPress={fecharParametros}
        >
          <Text style={styles.closeGrayButtonText}>Fechar</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextArea}>
          <Text style={styles.headerTitle}>PRODUTOS PARA VENDA</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome ou ID"
        placeholderTextColor="#888"
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.topButtons}>
        <TouchableOpacity
          style={[styles.topButton, styles.parametrosButton]}
          onPress={abrirParametros}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={20} color="#fff" />
          <Text style={styles.topButtonText}>Parâmetros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topButton, styles.novoProdutoButton]}
          onPress={abrirCadastro}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.topButtonText}>Novo Produto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <TouchableOpacity
          style={[styles.tableHeaderButton, { flex: 1.7 }]}
          onPress={() => alterarOrdenacaoProduto('nome')}
          activeOpacity={0.7}
        >
          <View style={styles.tableHeaderContent}>
            <Text style={styles.tableHeaderText}>PRODUTO</Text>
            {ordenarProdutoPor === 'nome' && (
              <Ionicons
                name={
                  direcaoOrdenacaoProduto === 'asc' ? 'caret-up' : 'caret-down'
                }
                size={14}
                color="#111"
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tableHeaderButton, { flex: 1 }]}
          onPress={() => alterarOrdenacaoProduto('preco_venda')}
          activeOpacity={0.7}
        >
          <View style={styles.tableHeaderContent}>
            <Text style={styles.tableHeaderText}>PREÇO</Text>
            {ordenarProdutoPor === 'preco_venda' && (
              <Ionicons
                name={
                  direcaoOrdenacaoProduto === 'asc' ? 'caret-up' : 'caret-down'
                }
                size={14}
                color="#111"
              />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.tableHeaderChevronSpace} />
      </View>

      <FlatList
        data={produtosOrdenados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduto}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="pricetags-outline" size={34} color="#777" />
            <Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>
          </View>
        }
      />

      <Modal visible={modalFormulario} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>
              {modoFormulario === 'cadastro'
                ? 'NOVO PRODUTO'
                : 'EDITAR PRODUTO'}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Nome:</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do produto para venda"
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.inputLabel}>Descrição:</Text>
              <TextInput
                style={styles.textAreaSmall}
                placeholder="Descrição opcional"
                placeholderTextColor="#888"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>
                Tempo de produção (minutos):
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 30"
                placeholderTextColor="#888"
                value={tempoProducao}
                onChangeText={setTempoProducao}
                keyboardType="numeric"
              />

              <Text style={styles.sectionTitle}>Composição do produto</Text>

              <View style={styles.composicaoBox}>
                <View style={styles.composicaoBoxHeader}>
                  <Text style={styles.composicaoBoxTitle}>
                    Receitas utilizadas
                  </Text>

                  <TouchableOpacity
                    style={styles.adicionarComponenteButton}
                    onPress={abrirAdicionarReceita}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.adicionarComponenteButtonText}>
                      Receita
                    </Text>
                  </TouchableOpacity>
                </View>
                {receitasProduto.length === 0 ? (
                  <Text style={styles.emptySmall}>
                    Nenhuma receita adicionada.
                  </Text>
                ) : (
                  receitasProduto.map((item) => (
                    <View key={item.receita_id} style={styles.composicaoItem}>
                      <View style={styles.composicaoItemInfo}>
                        <Text style={styles.composicaoItemNome}>
                          {item.nome}
                        </Text>
                        <Text style={styles.composicaoItemSubtexto}>
                          {item.quantidade_unidades} un do rendimento •{' '}
                          {formatarMoeda(item.custo_total)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removerReceita(item.receita_id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.composicaoBox}>
                <View style={styles.composicaoBoxHeader}>
                  <Text style={styles.composicaoBoxTitle}>
                    Itens Adicionais
                  </Text>

                  <TouchableOpacity
                    style={styles.adicionarComponenteButton}
                    onPress={abrirAdicionarItem}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.adicionarComponenteButtonText}>
                      Item
                    </Text>
                  </TouchableOpacity>
                </View>
                {itensProduto.length === 0 ? (
                  <Text style={styles.emptySmall}>Nenhum item adicionado.</Text>
                ) : (
                  itensProduto.map((item) => (
                    <View
                      key={item.produto_estoque_id}
                      style={styles.composicaoItem}
                    >
                      <View style={styles.composicaoItemInfo}>
                        <Text style={styles.composicaoItemNome}>
                          {item.nome}
                        </Text>
                        <Text style={styles.composicaoItemSubtexto}>
                          {item.quantidade_usada} {item.unidade_medida} •{' '}
                          {formatarMoeda(item.custo_total)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removerItem(item.produto_estoque_id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.resumoBox}>
                <Text style={styles.resumoTitle}>Resumo da precificação</Text>

                <View style={styles.resumoLinha}>
                  <Text style={styles.resumoLabel}>Receitas</Text>
                  <Text style={styles.resumoValor}>
                    {formatarMoeda(custoReceitas)}
                  </Text>
                </View>
                <View style={styles.resumoLinha}>
                  <Text style={styles.resumoLabel}>Itens Adicionais</Text>
                  <Text style={styles.resumoValor}>
                    {formatarMoeda(custoItens)}
                  </Text>
                </View>
                <View style={styles.resumoLinha}>
                  <Text style={styles.resumoLabel}>Mão de obra</Text>
                  <Text style={styles.resumoValor}>
                    {formatarMoeda(custoMaoDeObra)}
                  </Text>
                </View>
                <View style={styles.resumoLinha}>
                  <Text style={styles.resumoLabel}>Custos rateados</Text>
                  <Text style={styles.resumoValor}>
                    {formatarMoeda(custoOperacional)}
                  </Text>
                </View>
                <View style={styles.resumoLinhaTotal}>
                  <Text style={styles.resumoLabelTotal}>Custo total</Text>
                  <Text style={styles.resumoValorTotal}>
                    {formatarMoeda(custoTotal)}
                  </Text>
                </View>
                <View style={styles.resumoLinhaDestaque}>
                  <Text style={styles.resumoLabelDestaque}>
                    Preço sugerido ({parametros.margem_lucro}%)
                  </Text>
                  <Text style={styles.resumoValorDestaque}>
                    {formatarMoeda(precoSugerido)}
                  </Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>Preço definitivo de venda:</Text>
              <TextInput
                style={styles.input}
                placeholder="Valor definido pelo usuário"
                placeholderTextColor="#888"
                value={precoVenda}
                onChangeText={setPrecoVenda}
                keyboardType="numeric"
              />

              {precoVendaNumero > 0 && precoVendaNumero < custoTotal && (
                <Text style={styles.warningText}>
                  O preço informado está abaixo do custo total do produto.
                </Text>
              )}

              {precoVendaNumero >= custoTotal &&
                precoVendaNumero > 0 &&
                precoVendaNumero < precoSugerido && (
                  <Text style={styles.warningText}>
                    O preço informado está abaixo do preço sugerido.
                  </Text>
                )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.grayButton]}
                  onPress={() => {
                    setModalFormulario(false);
                    limparFormulario();
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.blackButton]}
                  onPress={salvarProduto}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalAdicionarReceita} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ADICIONAR RECEITA</Text>

            {receitaSelecionada ? (
              <View style={styles.selecionadoBox}>
                <Text style={styles.selecionadoLabel}>
                  Receita selecionada:
                </Text>
                <Text style={styles.selecionadoValue}>
                  {receitaSelecionada.nome}
                </Text>
                <Text style={styles.selectionItemSubtitle}>
                  Rendimento: {receitaSelecionada.rendimento}
                </Text>
              </View>
            ) : (
              <Text style={styles.emptySmall}>
                Nenhuma receita selecionada.
              </Text>
            )}

            <TouchableOpacity
              style={styles.selectProductButton}
              onPress={() => void abrirSelecaoReceita()}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color="#fff" />
              <Text style={styles.selectProductButtonText}>
                {receitaSelecionada ? 'Trocar receita' : 'Selecionar receita'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>
              Quantas unidades do rendimento serão usadas?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3"
              placeholderTextColor="#888"
              value={quantidadeReceita}
              onChangeText={setQuantidadeReceita}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.grayButton]}
                onPress={() => {
                  setModalSelecionarReceita(false);
                  setModalAdicionarReceita(false);
                  limparModalReceita();
                  setModalFormulario(true);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.blackButton]}
                onPress={adicionarReceitaAoProduto}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalSelecionarReceita}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSelecionarReceita(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSelecaoProdutoContent}>
            <Text style={styles.modalSelecaoProdutoTitulo}>
              SELECIONAR RECEITA
            </Text>

            <View style={styles.buscaProdutoContainer}>
              <TextInput
                style={styles.buscaProdutoInput}
                value={buscaReceita}
                onChangeText={pesquisarReceitas}
                placeholder="Nome, ID ou rendimento"
                placeholderTextColor="#888"
              />

              <View style={styles.botaoScannerBusca}>
                <Ionicons name="search-outline" size={23} color="#111" />
              </View>
            </View>

            <FlatList
              data={receitasFiltradas}
              keyExtractor={(item) => item.id.toString()}
              style={styles.listaSelecaoProdutos}
              contentContainerStyle={styles.listaSelecaoProdutosConteudo}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.produtoListaVazia}>
                  <Text style={styles.produtoListaVaziaText}>
                    Nenhuma receita encontrada.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.produtoOpcaoSelecao}
                  onPress={() => selecionarReceita(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.produtoOpcaoInfo}>
                    <Text style={styles.produtoOpcaoNome} numberOfLines={1}>
                      {item.nome}
                    </Text>

                    <Text style={styles.produtoOpcaoEstoque}>
                      ID: {item.id} • Rendimento: {item.rendimento}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={22} color="#555" />
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.botaoFecharSelecao}
              onPress={() => setModalSelecionarReceita(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.botaoFecharSelecaoTexto}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalSelecionarItem}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSelecionarItem(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSelecaoProdutoContent}>
            <Text style={styles.modalSelecaoProdutoTitulo}>
              SELECIONAR PRODUTO
            </Text>

            <View style={styles.buscaProdutoContainer}>
              <TextInput
                style={styles.buscaProdutoInput}
                value={buscaItem}
                onChangeText={pesquisarProdutos}
                placeholder="Nome, ID ou código de barras"
                placeholderTextColor="#888"
              />

              <TouchableOpacity
                style={styles.botaoScannerBusca}
                onPress={abrirScanner}
                activeOpacity={0.7}
              >
                <Ionicons name="barcode-outline" size={23} color="#111" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={produtosFiltrados}
              keyExtractor={(item) => item.id.toString()}
              style={styles.listaSelecaoProdutos}
              contentContainerStyle={styles.listaSelecaoProdutosConteudo}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.produtoListaVazia}>
                  <Text style={styles.produtoListaVaziaText}>
                    Nenhum produto encontrado.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.produtoOpcaoSelecao}
                  onPress={() => selecionarProduto(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.produtoOpcaoInfo}>
                    <Text style={styles.produtoOpcaoNome} numberOfLines={1}>
                      {obterNomeProduto(item)}
                    </Text>

                    <Text style={styles.produtoOpcaoEstoque}>
                      Estoque: {formatarNumero(obterQuantidadeEstoque(item))}{' '}
                      {obterUnidadeEstoque(item)}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={22} color="#555" />
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.botaoFecharSelecao}
              onPress={() => setModalSelecionarItem(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.botaoFecharSelecaoTexto}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalAdicionarItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ADICIONAR ITEM</Text>

            {itemSelecionado ? (
              <View style={styles.selecionadoBox}>
                <Text style={styles.selecionadoLabel}>Item selecionado:</Text>
                <Text style={styles.selecionadoValue}>
                  {obterNomeProduto(itemSelecionado)}
                </Text>
                <Text style={styles.selectionItemSubtitle}>
                  Embalagem: {itemSelecionado.quantidade_embalagem}{' '}
                  {itemSelecionado.unidade_medida} •{' '}
                  {formatarMoeda(itemSelecionado.preco_medio)}
                </Text>
              </View>
            ) : (
              <Text style={styles.emptySmall}>Nenhum item selecionado.</Text>
            )}

            <TouchableOpacity
              style={styles.selectProductButton}
              onPress={() => void abrirSelecaoProduto()}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color="#fff" />
              <Text style={styles.selectProductButtonText}>Trocar item</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Quantidade usada:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100, 2, 0,5..."
              placeholderTextColor="#888"
              value={quantidadeItem}
              onChangeText={setQuantidadeItem}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Unidade:</Text>
            <View style={styles.unidadesContainer}>
              {UNIDADES.map((unidade) => (
                <TouchableOpacity
                  key={unidade}
                  style={[
                    styles.unidadeButton,
                    unidadeItem === unidade && styles.unidadeButtonSelected,
                  ]}
                  onPress={() => setUnidadeItem(unidade)}
                >
                  <Text
                    style={[
                      styles.unidadeButtonText,
                      unidadeItem === unidade &&
                        styles.unidadeButtonTextSelected,
                    ]}
                  >
                    {unidade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.grayButton]}
                onPress={() => {
                  setModalAdicionarItem(false);
                  limparModalItem();
                  setModalFormulario(true);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.blackButton]}
                onPress={adicionarItemAoProduto}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            {produtoDetalhado && (
              <>
                <Text style={styles.modalTitle}>DETALHES DO PRODUTO</Text>
                <ScrollView showsVerticalScrollIndicator>
                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>
                      {produtoDetalhado.nome}
                    </Text>
                    {!!produtoDetalhado.descricao && (
                      <Text style={styles.detailsDescription}>
                        {produtoDetalhado.descricao}
                      </Text>
                    )}
                    <Text style={styles.detailsLine}>
                      Tempo: {produtoDetalhado.tempo_producao_minutos} minutos
                    </Text>
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsSectionTitle}>Receitas</Text>
                    {produtoDetalhado.receitas.length === 0 ? (
                      <Text style={styles.emptySmall}>Nenhuma receita.</Text>
                    ) : (
                      produtoDetalhado.receitas.map((item) => (
                        <View key={item.id} style={styles.detailsItem}>
                          <Text style={styles.detailsItemName}>
                            {item.receita_nome}
                          </Text>
                          <Text style={styles.detailsItemValue}>
                            {item.quantidade_unidades} unidade(s) do rendimento
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsSectionTitle}>
                      Itens Adicionais
                    </Text>
                    {produtoDetalhado.itens.length === 0 ? (
                      <Text style={styles.emptySmall}>Nenhum item.</Text>
                    ) : (
                      produtoDetalhado.itens.map((item) => (
                        <View key={item.id} style={styles.detailsItem}>
                          <Text style={styles.detailsItemName}>
                            {item.produto_nome}
                          </Text>
                          <Text style={styles.detailsItemValue}>
                            {item.quantidade_usada} {item.unidade_medida}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.detailsSectionTitle}>Precificação</Text>
                    <View style={styles.detailsPriceRow}>
                      <Text style={styles.detailsPriceLabel}>Receitas</Text>
                      <Text style={styles.detailsPriceValue}>
                        {formatarMoeda(produtoDetalhado.custo_receitas)}
                      </Text>
                    </View>
                    <View style={styles.detailsPriceRow}>
                      <Text style={styles.detailsPriceLabel}>Itens</Text>
                      <Text style={styles.detailsPriceValue}>
                        {formatarMoeda(produtoDetalhado.custo_itens)}
                      </Text>
                    </View>
                    <View style={styles.detailsPriceRow}>
                      <Text style={styles.detailsPriceLabel}>Mão de obra</Text>
                      <Text style={styles.detailsPriceValue}>
                        {formatarMoeda(produtoDetalhado.custo_mao_obra)}
                      </Text>
                    </View>
                    <View style={styles.detailsPriceRow}>
                      <Text style={styles.detailsPriceLabel}>
                        Custos rateados
                      </Text>
                      <Text style={styles.detailsPriceValue}>
                        {formatarMoeda(produtoDetalhado.custo_operacional)}
                      </Text>
                    </View>
                    <View style={styles.detailsPriceRowStrong}>
                      <Text style={styles.detailsPriceLabelStrong}>
                        Custo total
                      </Text>
                      <Text style={styles.detailsPriceValueStrong}>
                        {formatarMoeda(produtoDetalhado.custo_total)}
                      </Text>
                    </View>
                    <View style={styles.detailsPriceRow}>
                      <Text style={styles.detailsPriceLabel}>
                        Preço sugerido
                      </Text>
                      <Text style={styles.detailsPriceValue}>
                        {formatarMoeda(produtoDetalhado.preco_sugerido)}
                      </Text>
                    </View>
                    <View style={styles.detailsSalePrice}>
                      <Text style={styles.detailsSaleLabel}>
                        Preço de venda
                      </Text>
                      <Text style={styles.detailsSaleValue}>
                        {formatarMoeda(produtoDetalhado.preco_venda)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.detailsButtonsRow}>
                  <TouchableOpacity
                    style={[styles.detailsButton, styles.blackButton]}
                    onPress={abrirEdicao}
                  >
                    <Ionicons name="create-outline" size={19} color="#fff" />
                    <Text style={styles.modalButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailsButton, styles.redButton]}
                    onPress={confirmarExclusaoProduto}
                  >
                    <Ionicons name="trash-outline" size={19} color="#fff" />
                    <Text style={styles.modalButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeGrayButton}
                  onPress={() => {
                    setModalDetalhes(false);
                    setProdutoDetalhado(null);
                  }}
                >
                  <Text style={styles.closeGrayButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={modalParametros} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <ScrollView
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              {renderConteudoParametros()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BarcodeScannerModal
        visible={scannerVisivel}
        onClose={() => setScannerVisivel(false)}
        onCodeScanned={aoReceberCodigo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '500',
    lineHeight: 36,
    marginTop: -2,
  },
  headerTextArea: {
    paddingHorizontal: 42,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  topButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  topButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  parametrosButton: {
    backgroundColor: '#555',
  },
  novoProdutoButton: {
    backgroundColor: '#000',
  },
  topButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c8c8c8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  tableHeaderButton: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tableHeaderChevronSpace: {
    width: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 28,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  produtoNomeArea: {
    flex: 1.7,
  },
  produtoNome: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  produtoCusto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    marginTop: 3,
  },
  produtoPrecoArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  produtoPrecoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#666',
  },
  produtoPreco: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
    marginTop: 2,
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 25,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySmall: {
    color: '#666',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '84%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  modalContentLarge: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 5,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 11,
  },
  textAreaSmall: {
    minHeight: 78,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 11,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111',
    marginTop: 5,
    marginBottom: 8,
  },
  composicaoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 5,
  },
  adicionarComponenteButton: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: '#000',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  adicionarComponenteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    width: 40,
    textAlign: 'center',
  },
  composicaoButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  composicaoButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 7,
  },
  composicaoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  composicaoBox: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 11,
  },
  composicaoBoxTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
    marginBottom: 5,
  },
  composicaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  composicaoItemInfo: {
    flex: 1,
  },
  composicaoItemNome: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },
  composicaoItemSubtexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#c90000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  resumoBox: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 11,
    marginBottom: 12,
  },
  resumoTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111',
    marginBottom: 6,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
    gap: 8,
  },
  resumoLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#444',
  },
  resumoValor: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111',
  },
  resumoLinhaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 8,
  },
  resumoLabelTotal: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
  resumoValorTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
  resumoLinhaDestaque: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 9,
    gap: 8,
  },
  resumoLabelDestaque: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
  },
  resumoValorDestaque: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#c90000',
    marginTop: -4,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 3,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  blackButton: {
    backgroundColor: '#000',
  },
  grayButton: {
    backgroundColor: '#888',
  },
  redButton: {
    backgroundColor: '#c90000',
  },
  selectionList: {
    maxHeight: 210,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 9,
    marginBottom: 11,
  },
  productSelectionList: {
    height: 260,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 9,
    marginBottom: 2,
  },
  productSelectionListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectionItemSelected: {
    backgroundColor: '#e4e4e4',
  },
  selectionItemTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },
  selectionItemSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginTop: 2,
  },
  inputComIconeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 9,
    paddingLeft: 12,
    paddingRight: 4,
    height: 46,
    marginBottom: 10,
  },
  inputComIcone: {
    flex: 1,
    height: '100%',
    color: '#111',
    fontSize: 14,
    fontWeight: '600',
  },
  scannerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectProductButton: {
    minHeight: 43,
    backgroundColor: '#000',
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 12,
  },
  selectProductButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  modalSelecaoProdutoContent: {
    width: '100%',
    maxHeight: '86%',
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    padding: 18,
  },
  modalSelecaoProdutoTitulo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  buscaProdutoContainer: {
    minHeight: 54,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#c7c7c7',
    borderRadius: 13,
    paddingLeft: 13,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  buscaProdutoInput: {
    flex: 1,
    minHeight: 52,
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  botaoScannerBusca: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listaSelecaoProdutos: {
    maxHeight: 390,
    marginBottom: 14,
  },
  listaSelecaoProdutosConteudo: {
    paddingBottom: 2,
  },
  produtoListaVazia: {
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  produtoListaVaziaText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  produtoOpcaoSelecao: {
    minHeight: 72,
    backgroundColor: '#fff',
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  produtoOpcaoInfo: {
    flex: 1,
    marginRight: 10,
  },
  produtoOpcaoNome: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },
  produtoOpcaoEstoque: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 5,
  },
  botaoFecharSelecao: {
    minHeight: 52,
    backgroundColor: '#d1d1d1',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoFecharSelecaoTexto: {
    color: '#111',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  selecionadoBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 9,
    marginBottom: 10,
  },
  selecionadoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
  },
  selecionadoValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
    marginTop: 2,
  },
  unidadesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  unidadeButton: {
    flex: 1,
    minHeight: 39,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  unidadeButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  unidadeButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111',
  },
  unidadeButtonTextSelected: {
    color: '#fff',
  },
  detailsCard: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 11,
    marginBottom: 11,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },
  detailsDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    lineHeight: 19,
    marginTop: 5,
  },
  detailsLine: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333',
    marginTop: 7,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111',
    marginBottom: 5,
  },
  detailsItem: {
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  detailsItemName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },
  detailsItemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginTop: 2,
  },
  detailsPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  detailsPriceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#444',
  },
  detailsPriceValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111',
  },
  detailsPriceRowStrong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailsPriceLabelStrong: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
  detailsPriceValueStrong: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
  detailsSalePrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  detailsSaleLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  detailsSaleValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  detailsButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  detailsButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  closeGrayButton: {
    minHeight: 43,
    backgroundColor: '#888',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  closeGrayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  parametroCard: {
    backgroundColor: '#f6f6f6',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 11,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  parametroIconBox: {
    width: 47,
    height: 47,
    borderRadius: 12,
    backgroundColor: '#e7e7e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  parametroCardInfo: {
    flex: 1,
  },
  parametroCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111',
  },
  parametroCardSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginTop: 2,
  },
  voltarModuloButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  voltarModuloText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
  },
  parametroModuloTitulo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginBottom: 14,
  },
  custoFormulario: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 11,
    marginBottom: 11,
  },
  formCustoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionButton: {
    flex: 1,
    minHeight: 41,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 7,
  },
  smallActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  totalCustoBox: {
    backgroundColor: '#000',
    borderRadius: 9,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalCustoLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  totalCustoValor: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  listaCustos: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  custoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
    gap: 7,
  },
  custoItemInativo: {
    opacity: 0.5,
  },
  custoItemInfo: {
    flex: 1,
  },
  custoItemNome: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },
  custoItemValor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginTop: 2,
  },
  iconActionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconButton: {
    backgroundColor: '#c90000',
  },
  calculoDestaqueBox: {
    backgroundColor: '#000',
    borderRadius: 9,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  calculoDestaqueLabel: {
    color: '#ddd',
    fontSize: 12,
    fontWeight: '800',
  },
  calculoDestaqueValor: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  fullBlackButton: {
    minHeight: 45,
    backgroundColor: '#000',
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  fullBlackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  simulacaoBox: {
    backgroundColor: '#f6f6f6',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 12,
  },
  simulacaoTitulo: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111',
    marginBottom: 5,
  },
  simulacaoTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  simulacaoResultado: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111',
    marginTop: 5,
  },
  parametrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  parametrosHeaderEspaco: {
    width: 42,
  },

  parametrosHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 0.8,
  },

  ajudaButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ajudaCard: {
    backgroundColor: '#f6f6f6',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  ajudaTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },

  ajudaTitulo: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111',
  },

  ajudaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    lineHeight: 19,
  },

  formulaBox: {
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    padding: 9,
    marginTop: 9,
  },

  formulaText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#222',
    textAlign: 'center',
  },
});
