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
import { SafeAreaView } from 'react-native-safe-area-context';

import BarcodeScannerModal from '../../../../shared/scanner/presentation/BarcodeScannerModal';
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
} from '../../application/produtosVendaApi';

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

      <Ionicons name="chevron-forward" size={20} color="#FF3B73" />
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
          <Ionicons name="arrow-back" size={19} color="#FF3B73" />
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
                  <Ionicons name="create-outline" size={19} color="#FF3B73" />
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
            <Ionicons name="arrow-back" size={19} color="#FF3B73" />
            <Text style={styles.voltarModuloText}>Voltar aos parâmetros</Text>
          </TouchableOpacity>

          <Text style={styles.parametroModuloTitulo}>
            COMO FUNCIONA A PRECIFICAÇÃO?
          </Text>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="business-outline" size={22} color="#FF3B73" />
              <Text style={styles.ajudaTitulo}>Custos fixos</Text>
            </View>

            <Text style={styles.ajudaTexto}>
              São despesas mensais que existem mesmo quando não há produção,
              como aluguel, internet e contabilidade.
            </Text>
          </View>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="flash-outline" size={22} color="#FF3B73" />
              <Text style={styles.ajudaTitulo}>Custos variáveis</Text>
            </View>

            <Text style={styles.ajudaTexto}>
              São despesas mensais que podem aumentar ou diminuir, como água,
              energia e gás.
            </Text>
          </View>

          <View style={styles.ajudaCard}>
            <View style={styles.ajudaTituloRow}>
              <Ionicons name="time-outline" size={22} color="#FF3B73" />
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
              <Ionicons name="calculator-outline" size={22} color="#FF3B73" />
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
              <Ionicons name="trending-up-outline" size={22} color="#FF3B73" />
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
              <Ionicons name="pricetag-outline" size={22} color="#FF3B73" />
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
            <Ionicons name="arrow-back" size={19} color="#FF3B73" />
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
            <Ionicons name="arrow-back" size={19} color="#FF3B73" />
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
            <Ionicons name="business-outline" size={26} color="#FF3B73" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Custos Fixos</Text>
            <Text style={styles.parametroCardSubtitle}>
              Total ativo: {formatarMoeda(totalCustosFixos)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#FF3B73" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parametroCard}
          onPress={() => {
            limparFormularioCusto();
            setAbaParametros('variaveis');
          }}
        >
          <View style={styles.parametroIconBox}>
            <Ionicons name="flash-outline" size={26} color="#FF3B73" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Custos Variáveis</Text>
            <Text style={styles.parametroCardSubtitle}>
              Total ativo: {formatarMoeda(totalCustosVariaveis)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#FF3B73" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parametroCard}
          onPress={() => setAbaParametros('maoDeObra')}
        >
          <View style={styles.parametroIconBox}>
            <Ionicons name="time-outline" size={26} color="#FF3B73" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Mão de Obra</Text>
            <Text style={styles.parametroCardSubtitle}>
              Valor da hora: {formatarMoeda(parametros.valor_hora)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#FF3B73" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.parametroCard}
          onPress={() => setAbaParametros('margem')}
        >
          <View style={styles.parametroIconBox}>
            <Ionicons name="trending-up-outline" size={26} color="#FF3B73" />
          </View>
          <View style={styles.parametroCardInfo}>
            <Text style={styles.parametroCardTitle}>Margem de Lucro</Text>
            <Text style={styles.parametroCardSubtitle}>
              Margem atual: {parametros.margem_lucro}%
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color="#FF3B73" />
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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextArea}>
          <Text style={styles.headerTitle}>Produtos para venda</Text>
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
                color="#FF3B73"
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
                color="#FF3B73"
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
            <Ionicons name="pricetags-outline" size={34} color="#FF3B73" />
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
            <Text style={styles.modalTitle}>Adicionar receita</Text>

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
                <Ionicons name="search-outline" size={23} color="#FF3B73" />
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
                <Ionicons name="barcode-outline" size={23} color="#FF3B73" />
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
            <Text style={styles.modalTitle}>Adicionar item</Text>

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
                <Text style={styles.modalTitle}>Detalhes do produto</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDFE',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFDFE',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#5A3844',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 11,
  },

  backButtonText: {
    color: '#FF3B73',
    fontSize: 36,
    lineHeight: 38,
    fontWeight: '500',
    marginTop: -3,
  },

  headerTextArea: {
    flex: 1,
    justifyContent: 'center',
  },

  headerTitle: {
    color: '#242329',
    fontSize: 20,
    fontWeight: '900',
  },

  searchInput: {
    minHeight: 54,
    color: '#242329',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  topButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  topButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 16,
  },

  parametrosButton: {
    backgroundColor: '#FF779B',
  },

  novoProdutoButton: {
    backgroundColor: '#FF3B73',
    shadowColor: '#FF3B73',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  topButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  tableHeader: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD5E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  tableHeaderButton: {
    height: 42,
    justifyContent: 'center',
  },

  tableHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  tableHeaderText: {
    color: '#242329',
    fontSize: 10,
    fontWeight: '900',
  },

  tableHeaderChevronSpace: {
    width: 24,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 18,
  },

  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#5A3844',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  produtoNomeArea: {
    flex: 1.7,
    paddingRight: 8,
  },

  produtoNome: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
  },

  produtoCusto: {
    color: '#737178',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },

  produtoPrecoArea: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 8,
  },

  produtoPrecoLabel: {
    color: '#9A979E',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  produtoPreco: {
    color: '#FF3B73',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
    paddingHorizontal: 24,
  },

  emptyText: {
    color: '#737178',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },

  emptySmall: {
    color: '#737178',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 14,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
  },

  modalContent: {
    width: '100%',
    maxHeight: '86%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
  },

  modalContentLarge: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
  },

  modalTitle: {
    color: '#242329',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 18,
  },

  inputLabel: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 4,
  },

  input: {
    minHeight: 54,
    color: '#242329',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  textAreaSmall: {
    minHeight: 88,
    color: '#242329',
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 13,
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#242329',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 12,
  },

  composicaoBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    padding: 13,
    marginBottom: 12,
  },

  composicaoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },

  composicaoBoxTitle: {
    flex: 1,
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },

  adicionarComponenteButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FF3B73',
    borderRadius: 12,
    paddingHorizontal: 11,
  },

  adicionarComponenteButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  composicaoItem: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F6EDF0',
    paddingVertical: 9,
  },

  composicaoItemInfo: {
    flex: 1,
    paddingRight: 8,
  },

  composicaoItemNome: {
    color: '#242329',
    fontSize: 12,
    fontWeight: '800',
  },

  composicaoItemSubtexto: {
    color: '#737178',
    fontSize: 10,
    marginTop: 4,
  },

  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D93C56',
  },

  resumoBox: {
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 18,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
  },

  resumoTitle: {
    color: '#242329',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },

  resumoLinha: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resumoLabel: {
    color: '#737178',
    fontSize: 11,
    fontWeight: '600',
  },

  resumoValor: {
    color: '#242329',
    fontSize: 11,
    fontWeight: '800',
  },

  resumoLinhaTotal: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0DDE3',
    marginTop: 6,
    paddingTop: 7,
  },

  resumoLabelTotal: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
  },

  resumoValorTotal: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },

  resumoLinhaDestaque: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F4',
    borderRadius: 13,
    paddingHorizontal: 11,
    marginTop: 8,
  },

  resumoLabelDestaque: {
    flex: 1,
    color: '#FF3B73',
    fontSize: 11,
    fontWeight: '900',
    paddingRight: 8,
  },

  resumoValorDestaque: {
    color: '#FF3B73',
    fontSize: 15,
    fontWeight: '900',
  },

  warningText: {
    color: '#D93C56',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
    backgroundColor: '#FFF0F3',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 2,
  },

  modalButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  grayButton: {
    backgroundColor: '#737178',
  },

  blackButton: {
    backgroundColor: '#FF3B73',
  },

  redButton: {
    backgroundColor: '#D93C56',
  },

  selecionadoBox: {
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 16,
    padding: 13,
    marginBottom: 12,
  },

  selecionadoLabel: {
    color: '#737178',
    fontSize: 10,
    fontWeight: '700',
  },

  selecionadoValue: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },

  selectionItemSubtitle: {
    color: '#737178',
    fontSize: 11,
    marginTop: 4,
  },

  selectProductButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FF3B73',
    borderRadius: 15,
    marginBottom: 14,
  },

  selectProductButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  unidadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },

  unidadeButton: {
    minWidth: 58,
    minHeight: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 13,
    paddingHorizontal: 11,
  },

  unidadeButtonSelected: {
    backgroundColor: '#FF3B73',
    borderColor: '#FF3B73',
  },

  unidadeButtonText: {
    color: '#737178',
    fontSize: 11,
    fontWeight: '800',
  },

  unidadeButtonTextSelected: {
    color: '#FFFFFF',
  },

  modalSelecaoProdutoContent: {
    width: '100%',
    height: '88%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
  },

  modalSelecaoProdutoTitulo: {
    color: '#242329',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },

  buscaProdutoContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 12,
  },

  buscaProdutoInput: {
    flex: 1,
    minHeight: 52,
    color: '#242329',
    fontSize: 14,
    fontWeight: '500',
  },

  botaoScannerBusca: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
  },

  listaSelecaoProdutos: {
    flex: 1,
  },

  listaSelecaoProdutosConteudo: {
    paddingBottom: 12,
  },

  produtoOpcaoSelecao: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 15,
    paddingHorizontal: 13,
    marginBottom: 8,
  },

  produtoOpcaoInfo: {
    flex: 1,
    paddingRight: 8,
  },

  produtoOpcaoNome: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
  },

  produtoOpcaoEstoque: {
    color: '#737178',
    fontSize: 10,
    marginTop: 4,
  },

  produtoListaVazia: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  produtoListaVaziaText: {
    color: '#737178',
    fontSize: 12,
  },

  botaoFecharSelecao: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFD4',
    borderRadius: 15,
    marginTop: 8,
  },

  botaoFecharSelecaoTexto: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
  },

  detailsTitle: {
    color: '#242329',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  detailsDescription: {
    color: '#737178',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  detailsLine: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F6EDF0',
  },

  detailsItem: {
    color: '#737178',
    fontSize: 11,
    fontWeight: '700',
  },

  detailsItemName: {
    flex: 1,
    color: '#242329',
    fontSize: 12,
    fontWeight: '800',
  },

  detailsItemValue: {
    color: '#242329',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },

  detailsSectionTitle: {
    color: '#242329',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 9,
  },

  detailsPriceRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailsPriceRowStrong: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0DDE3',
    marginTop: 5,
    paddingTop: 7,
  },

  detailsPriceLabel: {
    color: '#737178',
    fontSize: 11,
  },

  detailsPriceValue: {
    color: '#242329',
    fontSize: 12,
    fontWeight: '800',
  },

  detailsPriceLabelStrong: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
  },

  detailsPriceValueStrong: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },

  detailsSalePrice: {
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },

  detailsSaleLabel: {
    color: '#FF3B73',
    fontSize: 11,
    fontWeight: '800',
  },

  detailsSaleValue: {
    color: '#FF3B73',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },

  detailsButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  detailsButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },

  closeGrayButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFD4',
    borderRadius: 15,
    marginTop: 10,
  },

  closeGrayButtonText: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
  },

  parametrosHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  parametrosHeaderEspaco: {
    width: 42,
  },

  parametrosHeaderTitle: {
    flex: 1,
    color: '#242329',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },

  ajudaButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B73',
  },

  parametroCard: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
  },

  parametroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 11,
  },

  parametroCardInfo: {
    flex: 1,
  },

  parametroCardTitle: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },

  parametroCardSubtitle: {
    color: '#737178',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  voltarModuloButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F4',
    borderRadius: 13,
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  voltarModuloText: {
    color: '#FF3B73',
    fontSize: 12,
    fontWeight: '900',
  },

  parametroModuloTitulo: {
    color: '#242329',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },

  custoFormulario: {
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  formCustoButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  smallActionButton: {
    flex: 1,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
  },

  smallActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  totalCustoBox: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 17,
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  totalCustoLabel: {
    color: '#737178',
    fontSize: 12,
    fontWeight: '700',
  },

  totalCustoValor: {
    color: '#FF3B73',
    fontSize: 18,
    fontWeight: '900',
  },

  listaCustos: {
    paddingBottom: 10,
  },

  custoItem: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 15,
    padding: 11,
    marginBottom: 8,
  },

  custoItemInativo: {
    opacity: 0.55,
  },

  custoItemInfo: {
    flex: 1,
    paddingRight: 8,
  },

  custoItemNome: {
    color: '#242329',
    fontSize: 12,
    fontWeight: '900',
  },

  custoItemValor: {
    color: '#737178',
    fontSize: 11,
    marginTop: 4,
  },

  iconActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginLeft: 6,
  },

  deleteIconButton: {
    backgroundColor: '#D93C56',
  },

  calculoDestaqueBox: {
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 17,
    padding: 15,
    marginBottom: 14,
  },

  calculoDestaqueLabel: {
    color: '#737178',
    fontSize: 11,
    fontWeight: '700',
  },

  calculoDestaqueValor: {
    color: '#FF3B73',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
  },

  fullBlackButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FF3B73',
    borderRadius: 16,
    marginTop: 6,
  },

  fullBlackButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  simulacaoBox: {
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 17,
    padding: 15,
    marginBottom: 14,
  },

  simulacaoTitulo: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },

  simulacaoTexto: {
    color: '#737178',
    fontSize: 11,
    marginTop: 8,
  },

  simulacaoResultado: {
    color: '#FF3B73',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },

  ajudaCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  ajudaTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  ajudaTitulo: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },

  ajudaTexto: {
    color: '#737178',
    fontSize: 12,
    lineHeight: 19,
  },

  formulaBox: {
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 14,
    padding: 11,
    marginTop: 10,
  },

  formulaText: {
    color: '#FF3B73',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
});
