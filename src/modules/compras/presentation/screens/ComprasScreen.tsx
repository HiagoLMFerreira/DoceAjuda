import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarcodeScannerModal from '../../../../shared/scanner/presentation/BarcodeScannerModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBottomNavigation from '../../../../shared/components/AppBottomNavigation';
import { useAuth } from '../../../auth/presentation/useAuth';
import {
  buscarCompraPorId,
  cadastrarCompra,
  cancelarCompra,
  CompraDatabase,
  CompraDetalhada,
  DirecaoOrdenacao,
  excluirCompra,
  listarCompras,
  listarProdutos,
  OrdenarCompraPor,
  ProdutoEstoque,
} from '../../application/comprasApi';

type UnidadeConteudo = 'un' | 'duzia' | 'g' | 'kg' | 'ml' | 'l' | 'caixa' | 'pacote';

type ItemFormulario = {
  produto_id: number;
  produto_nome: string;
  unidade_estoque: string;
  quantidade_embalagens: number;
  quantidade_por_embalagem: number;
  unidade_conteudo: UnidadeConteudo;
  valor_unitario: number;
};

const UNIDADES: Array<{ valor: UnidadeConteudo; rotulo: string }> = [
  { valor: 'un', rotulo: 'un' },
  { valor: 'duzia', rotulo: 'dúzia' },
  { valor: 'g', rotulo: 'g' },
  { valor: 'kg', rotulo: 'kg' },
  { valor: 'ml', rotulo: 'ml' },
  { valor: 'l', rotulo: 'L' },
  { valor: 'caixa', rotulo: 'caixa' },
  { valor: 'pacote', rotulo: 'pacote' },
];

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  textMuted: '#9B98A0',
  border: '#F1E7EA',
  success: '#2D9449',
  successSoft: '#EDF9F0',
  danger: '#D93C56',
  dangerSoft: '#FFF1F3',
};

function numeroEntrada(valor: string): number {
  return Number(valor.replace(',', '.'));
}

function formatarNumero(valor: number): string {
  return Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

function formatarMoeda(valor: number): string {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function dataHoje(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function ComprasScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const [compras, setCompras] = useState<CompraDatabase[]>([]);
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [busca, setBusca] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [ordenarPor, setOrdenarPor] = useState<OrdenarCompraPor>('data_compra');
  const [direcao, setDirecao] = useState<DirecaoOrdenacao>('DESC');

  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalItem, setModalItem] = useState(false);
  const [modalProdutos, setModalProdutos] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [scannerProdutoVisivel, setScannerProdutoVisivel] = useState(false);

  const [detalhes, setDetalhes] = useState<CompraDetalhada | null>(null);
  const [dataCompra, setDataCompra] = useState(dataHoje());
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemFormulario[]>([]);
  const [indiceEdicao, setIndiceEdicao] = useState<number | null>(null);

  const [produtoItem, setProdutoItem] = useState<ProdutoEstoque | null>(null);
  const [quantidadeEmbalagens, setQuantidadeEmbalagens] = useState('1');
  const [quantidadePorEmbalagem, setQuantidadePorEmbalagem] = useState('1');
  const [unidadeConteudo, setUnidadeConteudo] = useState<UnidadeConteudo>('un');
  const [valorUnitario, setValorUnitario] = useState('');

  const carregarCompras = useCallback(async () => {
    try {
      setCompras(await listarCompras(busca, ordenarPor, direcao));
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar as compras.');
    }
  }, [busca, ordenarPor, direcao]);

  useFocusEffect(useCallback(() => {
    carregarCompras();
  }, [carregarCompras]));

  const ordenar = (campo: OrdenarCompraPor) => {
    if (campo === ordenarPor) {
      setDirecao((atual) => atual === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setOrdenarPor(campo);
      setDirecao('ASC');
    }
  };

  const iconeOrdenacao = (campo: OrdenarCompraPor) => {
    if (ordenarPor !== campo) return 'swap-vertical-outline';
    return direcao === 'ASC' ? 'arrow-up' : 'arrow-down';
  };

  const abrirNovaCompra = async () => {
    try {
      setProdutos(await listarProdutos('nome', 'ASC'));
      setDataCompra(dataHoje());
      setObservacoes('');
      setItens([]);
      setModalFormulario(true);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar os produtos.');
    }
  };

  const limparItem = () => {
    setIndiceEdicao(null);
    setProdutoItem(null);
    setQuantidadeEmbalagens('1');
    setQuantidadePorEmbalagem('1');
    setUnidadeConteudo('un');
    setValorUnitario('');
  };

  const abrirNovoItem = () => {
    limparItem();
    setModalItem(true);
  };

  const abrirEditarItem = (item: ItemFormulario, indice: number) => {
    const produto = produtos.find((p) => p.id === item.produto_id) ?? null;
    setIndiceEdicao(indice);
    setProdutoItem(produto);
    setQuantidadeEmbalagens(String(item.quantidade_embalagens));
    setQuantidadePorEmbalagem(String(item.quantidade_por_embalagem));
    setUnidadeConteudo(item.unidade_conteudo);
    setValorUnitario(String(item.valor_unitario).replace('.', ','));
    setModalItem(true);
  };

  const selecionarProduto = (produto: ProdutoEstoque) => {
    setProdutoItem(produto);
    const unidade = produto.unidade_medida?.toLowerCase() as UnidadeConteudo;
    setUnidadeConteudo(UNIDADES.some((u) => u.valor === unidade) ? unidade : 'un');
    setModalProdutos(false);
  };

  const aoEscanearCodigoProduto = (codigo: string) => {
    setBuscaProduto(codigo.trim());
    setScannerProdutoVisivel(false);
  };

  const salvarItem = () => {
    if (!produtoItem) {
      Alert.alert('Atenção', 'Selecione um produto.');
      return;
    }

    const embalagens = numeroEntrada(quantidadeEmbalagens);
    const conteudo = numeroEntrada(quantidadePorEmbalagem);
    const valor = numeroEntrada(valorUnitario);

    if (!Number.isFinite(embalagens) || embalagens <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade de embalagens válida.');
      return;
    }
    if (!Number.isFinite(conteudo) || conteudo <= 0) {
      Alert.alert('Atenção', 'Informe o conteúdo por embalagem.');
      return;
    }
    if (!Number.isFinite(valor) || valor < 0) {
      Alert.alert('Atenção', 'Informe um valor unitário válido.');
      return;
    }

    const duplicado = itens.some((item, indice) =>
      item.produto_id === produtoItem.id && indice !== indiceEdicao
    );
    if (duplicado) {
      Alert.alert('Atenção', 'Este produto já foi adicionado. Edite o item existente.');
      return;
    }

    const novo: ItemFormulario = {
      produto_id: produtoItem.id,
      produto_nome: produtoItem.nome || produtoItem.descricao,
      unidade_estoque: produtoItem.unidade_medida,
      quantidade_embalagens: embalagens,
      quantidade_por_embalagem: conteudo,
      unidade_conteudo: unidadeConteudo,
      valor_unitario: valor,
    };

    setItens((atuais) => {
      if (indiceEdicao === null) return [...atuais, novo];
      return atuais.map((item, indice) => indice === indiceEdicao ? novo : item);
    });
    setModalItem(false);
    limparItem();
  };

  const removerItem = (indice: number) => {
    Alert.alert('Remover item', 'Deseja remover este item da compra?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', style: 'destructive', onPress: () => setItens((atuais) => atuais.filter((_, i) => i !== indice)) },
    ]);
  };

  const totalCompra = useMemo(() => itens.reduce(
    (total, item) => total + item.quantidade_embalagens * item.valor_unitario,
    0
  ), [itens]);

  const confirmarCompra = async () => {
    try {
      if (!itens.length) {
        Alert.alert('Atenção', 'Adicione pelo menos um item.');
        return;
      }

      await cadastrarCompra({
        data_compra: dataCompra,
        observacoes,
        itens: itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade_embalagens: item.quantidade_embalagens,
          quantidade_por_embalagem: item.quantidade_por_embalagem,
          unidade_conteudo: item.unidade_conteudo,
          valor_unitario: item.valor_unitario,
        })),
      });

      setModalFormulario(false);
      await carregarCompras();
      Alert.alert('Sucesso', 'Compra confirmada e estoque atualizado.');
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível salvar a compra.');
    }
  };

  const abrirDetalhes = async (compra: CompraDatabase) => {
    try {
      const resultado = await buscarCompraPorId(compra.id);
      setDetalhes(resultado);
      setModalDetalhes(true);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível abrir a compra.');
    }
  };

  const confirmarCancelamento = () => {
    if (!detalhes) return;
    Alert.alert('Cancelar compra', 'O estoque desta compra será estornado. Deseja continuar?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Cancelar compra',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelarCompra(detalhes.id);
            setModalDetalhes(false);
            setDetalhes(null);
            await carregarCompras();
            Alert.alert('Sucesso', 'Compra cancelada e estoque estornado.');
          } catch (error) {
            Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível cancelar a compra.');
          }
        },
      },
    ]);
  };

  const confirmarExclusao = () => {
    if (!detalhes) return;
    const precisaEstornar = detalhes.status === 'CONFIRMADA';
    Alert.alert(
      'Excluir lançamento',
      precisaEstornar
        ? 'A compra será removida e sua entrada no estoque será estornada. Deseja continuar?'
        : 'A compra cancelada será removida definitivamente. Deseja continuar?',
      [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            if (precisaEstornar) {
              await cancelarCompra(detalhes.id);
            }
            await excluirCompra(detalhes.id);
            setModalDetalhes(false);
            setDetalhes(null);
            await carregarCompras();
          } catch (error) {
            Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível excluir a compra.');
          }
        },
        },
      ]
    );
  };

  const confirmarLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível sair da conta.'
              );
            }
          },
        },
      ]
    );
  };

  const produtosFiltrados = useMemo(() => {
    const texto = buscaProduto.trim().toLowerCase();
    if (!texto) return produtos;
    return produtos.filter((produto) =>
      String(produto.id).includes(texto) ||
      (produto.nome || produto.descricao).toLowerCase().includes(texto) ||
      String(produto.codigo_barras || '').includes(texto)
    );
  }, [produtos, buscaProduto]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.headerTituloLinha}>
            <View style={styles.headerIcone}>
              <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.headerTextoArea}>
              <Text style={styles.headerTitulo}>Compras</Text>
              <Text style={styles.headerSubtitulo}>
                Entradas, custos e reposição do estoque
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buscaContainer}>
          <Ionicons name="search-outline" size={21} color={COLORS.primary} />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar por ID, data, status ou produto"
            placeholderTextColor={COLORS.textMuted}
            value={busca}
            onChangeText={setBusca}
            onSubmitEditing={carregarCompras}
          />
          {!!busca && (
            <TouchableOpacity
              style={styles.limparBusca}
              onPress={() => setBusca('')}
              activeOpacity={0.75}
            >
              <Ionicons name="close-circle" size={21} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={abrirNovaCompra}
          activeOpacity={0.82}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.botaoPrincipalTexto}>Nova compra</Text>
        </TouchableOpacity>

      <View style={styles.cabecalhoGrid}>
        <Cabecalho titulo="ID" onPress={() => ordenar('id')} icone={iconeOrdenacao('id')} largura={0.7} />
        <Cabecalho titulo="DATA" onPress={() => ordenar('data_compra')} icone={iconeOrdenacao('data_compra')} largura={1.2} />
        <Cabecalho titulo="STATUS" onPress={() => ordenar('status')} icone={iconeOrdenacao('status')} largura={1.3} />
        <Cabecalho titulo="TOTAL" onPress={() => ordenar('valor_total')} icone={iconeOrdenacao('valor_total')} largura={1.2} />
      </View>

      <FlatList
        data={compras}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={(
          <View style={styles.vazioContainer}>
            <View style={styles.vazioIcone}>
              <Ionicons name="cart-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.vazioTitulo}>Nenhuma compra encontrada</Text>
            <Text style={styles.vazio}>
              Cadastre uma nova compra ou ajuste os termos da busca.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => abrirDetalhes(item)}
            activeOpacity={0.8}
          >
            <Text style={[styles.celula, { flex: 0.7 }]}>#{item.id}</Text>
            <Text style={[styles.celula, { flex: 1.2 }]}>{item.data_compra}</Text>
            <View style={[styles.statusArea, { flex: 1.3 }]}>
              <Text
                style={[
                  styles.status,
                  item.status === 'CANCELADA' && styles.statusCancelada,
                ]}
              >
                {item.status}
              </Text>
            </View>
            <Text style={[styles.celula, styles.valor, { flex: 1.2 }]}>{formatarMoeda(item.valor_total)}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalFormulario} transparent animationType="fade" onRequestClose={() => setModalFormulario(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalGrande}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>Nova compra</Text>
              <Text style={styles.label}>Data da compra</Text>
              <TextInput style={styles.input} value={dataCompra} onChangeText={setDataCompra} placeholder="AAAA-MM-DD" />
              <Text style={styles.label}>Observações</Text>
              <TextInput style={[styles.input, styles.inputMultilinha]} value={observacoes} onChangeText={setObservacoes} multiline placeholder="Opcional" />

              <TouchableOpacity style={styles.botaoSecundario} onPress={abrirNovoItem}>
                <Ionicons name="add" size={20} color="#111" />
                <Text style={styles.botaoSecundarioTexto}>Adicionar item</Text>
              </TouchableOpacity>

              {itens.map((item, indice) => (
                <View key={`${item.produto_id}-${indice}`} style={styles.itemCompra}>
                  <View style={styles.itemTextoArea}>
                    <Text style={styles.itemNome}>{item.produto_nome}</Text>
                    <Text style={styles.itemDescricao}>
                      {formatarNumero(item.quantidade_embalagens)} × {formatarNumero(item.quantidade_por_embalagem)} {item.unidade_conteudo}
                    </Text>
                    <Text style={styles.itemDescricao}>Entrada no estoque em {item.unidade_estoque}</Text>
                    <Text style={styles.itemSubtotal}>{formatarMoeda(item.quantidade_embalagens * item.valor_unitario)}</Text>
                  </View>
                  <View style={styles.acoesItem}>
                    <TouchableOpacity onPress={() => abrirEditarItem(item, indice)}><Ionicons name="create-outline" size={23} color="#111" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => removerItem(indice)}><Ionicons name="trash-outline" size={23} color="#b00020" /></TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total da compra</Text>
                <Text style={styles.totalValor}>{formatarMoeda(totalCompra)}</Text>
              </View>

              <View style={styles.botoesModal}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalFormulario(false)}><Text style={styles.botaoCancelarTexto}>FECHAR</Text></TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={confirmarCompra}><Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={styles.botaoSalvarTexto}>Confirmar</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalItem} transparent animationType="fade" onRequestClose={() => setModalItem(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalMedio}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>{indiceEdicao === null ? 'ADICIONAR ITEM' : 'EDITAR ITEM'}</Text>
              <Text style={styles.label}>Produto</Text>
              <TouchableOpacity style={styles.seletor} onPress={() => setModalProdutos(true)}>
                <Text style={produtoItem ? styles.seletorTexto : styles.placeholder}>{produtoItem ? `${produtoItem.nome || produtoItem.descricao} (${produtoItem.unidade_medida})` : 'Selecionar produto'}</Text>
                <Ionicons name="chevron-down" size={20} color="#444" />
              </TouchableOpacity>

              <Text style={styles.label}>Quantidade de embalagens</Text>
              <TextInput style={styles.input} value={quantidadeEmbalagens} onChangeText={setQuantidadeEmbalagens} keyboardType="decimal-pad" placeholder="Ex.: 3" />
              <Text style={styles.label}>Conteúdo de cada embalagem</Text>
              <TextInput style={styles.input} value={quantidadePorEmbalagem} onChangeText={setQuantidadePorEmbalagem} keyboardType="decimal-pad" placeholder="Ex.: 350" />
              <Text style={styles.label}>Unidade do conteúdo</Text>
              <View style={styles.opcoesUnidade}>
                {UNIDADES.map((unidade) => (
                  <TouchableOpacity key={unidade.valor} style={[styles.unidadeChip, unidadeConteudo === unidade.valor && styles.unidadeChipAtiva]} onPress={() => setUnidadeConteudo(unidade.valor)}>
                    <Text style={[styles.unidadeChipTexto, unidadeConteudo === unidade.valor && styles.unidadeChipTextoAtivo]}>{unidade.rotulo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ajuda}>Exemplo: 3 pacotes de 350 g. Informe 3, 350 e g.</Text>

              <Text style={styles.label}>Valor de cada embalagem</Text>
              <TextInput style={styles.input} value={valorUnitario} onChangeText={setValorUnitario} keyboardType="decimal-pad" placeholder="Ex.: 8,50" />

              <View style={styles.botoesModal}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => { setModalItem(false); limparItem(); }}><Text style={styles.botaoCancelarTexto}>CANCELAR</Text></TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarItem}><Text style={styles.botaoSalvarTexto}>Salvar item</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalProdutos} transparent animationType="fade" onRequestClose={() => setModalProdutos(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalMedio}>
            <Text style={styles.modalTitulo}>Selecionar produto</Text>
            <View style={styles.buscaContainer}>
              <TextInput
                style={styles.buscaInput}
                value={buscaProduto}
                onChangeText={setBuscaProduto}
                placeholder="Nome, ID ou código de barras"
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                style={styles.botaoScannerBusca}
                onPress={() => setScannerProdutoVisivel(true)}
              >
                <Ionicons name="barcode-outline" size={22} color="#111" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={produtosFiltrados}
              keyExtractor={(item) => String(item.id)}
              style={styles.listaProdutos}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.produtoOpcao} onPress={() => selecionarProduto(item)}>
                  <View>
                    <Text style={styles.itemNome}>{item.nome || item.descricao}</Text>
                    <Text style={styles.itemDescricao}>Estoque: {formatarNumero(item.quantidade)} {item.unidade_medida}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#555" />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.botaoCancelarInteiro} onPress={() => setModalProdutos(false)}><Text style={styles.botaoCancelarTexto}>FECHAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BarcodeScannerModal
        visible={scannerProdutoVisivel}
        onClose={() => setScannerProdutoVisivel(false)}
        onCodeScanned={aoEscanearCodigoProduto}
      />

      <Modal visible={modalDetalhes} transparent animationType="fade" onRequestClose={() => setModalDetalhes(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalGrande}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>Detalhes da compra</Text>
              {detalhes && (
                <>
                  <Info rotulo="Compra" valor={`#${detalhes.id}`} />
                  <Info rotulo="Data" valor={detalhes.data_compra} />
                  <Info rotulo="Status" valor={detalhes.status} />
                  {!!detalhes.observacoes && <Info rotulo="Observações" valor={detalhes.observacoes} />}

                  <Text style={styles.secaoTitulo}>ITENS</Text>
                  {detalhes.itens.map((item) => (
                    <View key={item.id} style={styles.itemDetalhe}>
                      <Text style={styles.itemNome}>{item.produto_nome}</Text>
                      <Text style={styles.itemDescricao}>{formatarNumero(item.quantidade_embalagens)} embalagem(ns) × {formatarNumero(item.quantidade_por_embalagem)} {item.unidade_conteudo}</Text>
                      <Text style={styles.itemDescricao}>Entrada: {formatarNumero(item.quantidade)} {item.unidade_medida}</Text>
                      <Text style={styles.itemDescricao}>Valor por embalagem: {formatarMoeda(item.valor_unitario)}</Text>
                      <Text style={styles.itemSubtotal}>Subtotal: {formatarMoeda(item.subtotal)}</Text>
                    </View>
                  ))}
                  <View style={styles.totalBox}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.totalValor}>{formatarMoeda(detalhes.valor_total)}</Text></View>

                  {detalhes.status === 'CONFIRMADA' && (
                    <TouchableOpacity style={styles.botaoPerigo} onPress={confirmarCancelamento}><Ionicons name="close-circle-outline" size={20} color="#fff" /><Text style={styles.botaoPerigoTexto}>Cancelar compra</Text></TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.botaoPerigo} onPress={confirmarExclusao}><Ionicons name="trash-outline" size={20} color="#fff" /><Text style={styles.botaoPerigoTexto}>Excluir lançamento</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.botaoCancelarInteiro} onPress={() => setModalDetalhes(false)}><Text style={styles.botaoCancelarTexto}>FECHAR</Text></TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>

      <AppBottomNavigation
        activeItem="menu"
        onInicio={() =>
          navigation.navigate('Dashboard')
        }
        onVendas={() =>
          navigation.navigate('Vendas')
        }
        onMenu={() =>
          navigation.navigate('Menu')
        }
        onRelatorios={() =>
          navigation.navigate('Relatorios')
        }
        onSair={confirmarLogout}
      />
    </SafeAreaView>
  );
}

function Cabecalho({ titulo, onPress, icone, largura }: { titulo: string; onPress: () => void; icone: any; largura: number }) {
  return (
    <TouchableOpacity style={[styles.cabecalhoCelula, { flex: largura }]} onPress={onPress}>
      <Text style={styles.cabecalhoTexto}>{titulo}</Text>
      <Ionicons name={icone} size={13} color="#222" />
    </TouchableOpacity>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return <View style={styles.infoLinha}><Text style={styles.infoRotulo}>{rotulo}</Text><Text style={styles.infoValor}>{valor}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#5A3844',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },

  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerTituloLinha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcone: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTextoArea: {
    flex: 1,
  },

  headerTitulo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  headerSubtitulo: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  buscaContainer: {
    minHeight: 54,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
  },

  buscaInput: {
    flex: 1,
    minHeight: 52,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  limparBusca: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resumoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  resumoCard: {
    flex: 1,
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  resumoCardDestaque: {
    flex: 1.35,
    borderColor: '#FFD1DD',
    backgroundColor: COLORS.primarySoft,
  },

  resumoIcone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  resumoIconeSucesso: {
    backgroundColor: COLORS.successSoft,
  },

  resumoNumero: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },

  resumoValor: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  resumoTexto: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },

  resumoTextoDestaque: {
    color: '#B9345A',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
  },

  botaoScannerBusca: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
  },

  botaoPrincipal: {
    minHeight: 53,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.23,
    shadowRadius: 10,
    elevation: 5,
  },

  botaoPrincipalTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  cabecalhoGrid: {
    minHeight: 43,
    backgroundColor: '#FFF0F4',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD5E0',
  },

  cabecalhoCelula: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  cabecalhoTexto: {
    fontSize: 10,
    fontWeight: '900',
    color: '#242329',
  },

  lista: {
    paddingBottom: 18,
  },

  card: {
    minHeight: 64,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#5A3844',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  celula: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textPrimary,
  },

  statusArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  status: {
    minWidth: 76,
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.successSoft,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.success,
  },

  statusCancelada: {
    color: COLORS.danger,
    backgroundColor: COLORS.dangerSoft,
  },

  valor: {
    fontWeight: '900',
  },

  vazioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
    paddingHorizontal: 22,
  },

  vazioIcone: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  vazioTitulo: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  vazio: {
    textAlign: 'center',
    marginTop: 5,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  modalGrande: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },

  modalMedio: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'left',
    color: '#242329',
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#242329',
    marginBottom: 7,
    marginTop: 6,
  },

  input: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    color: '#242329',
    fontSize: 14,
    marginBottom: 13,
  },

  inputMultilinha: {
    minHeight: 92,
    paddingTop: 13,
    textAlignVertical: 'top',
  },

  botaoSecundario: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginVertical: 10,
  },

  botaoSecundarioTexto: {
    color: '#FF3B73',
    fontSize: 13,
    fontWeight: '900',
  },

  itemCompra: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    padding: 14,
    marginBottom: 10,
  },

  itemTextoArea: {
    flex: 1,
  },

  itemNome: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },

  itemDescricao: {
    color: '#737178',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  itemSubtotal: {
    color: '#FF3B73',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
  },

  acoesItem: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 12,
  },

  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 17,
    padding: 15,
    marginTop: 8,
    marginBottom: 14,
  },

  totalLabel: {
    color: '#737178',
    fontSize: 12,
    fontWeight: '800',
  },

  totalValor: {
    color: '#FF3B73',
    fontSize: 19,
    fontWeight: '900',
  },

  botoesModal: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  botaoCancelar: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFD4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoCancelarInteiro: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  botaoCancelarTexto: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
  },

  botaoSalvar: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FF3B73',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  botaoSalvarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  seletor: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  seletorTexto: {
    flex: 1,
    color: '#242329',
    fontSize: 14,
    fontWeight: '700',
  },

  placeholder: {
    flex: 1,
    color: '#9A979E',
    fontSize: 14,
  },

  opcoesUnidade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 9,
  },

  unidadeChip: {
    minWidth: 62,
    minHeight: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  unidadeChipAtiva: {
    backgroundColor: '#FF3B73',
    borderColor: '#FF3B73',
  },

  unidadeChipTexto: {
    color: '#737178',
    fontSize: 12,
    fontWeight: '800',
  },

  unidadeChipTextoAtivo: {
    color: '#FFFFFF',
  },

  ajuda: {
    color: '#737178',
    fontSize: 11,
    lineHeight: 17,
    backgroundColor: '#FFF7F9',
    borderRadius: 13,
    padding: 12,
    marginBottom: 10,
  },

  listaProdutos: {
    maxHeight: 370,
  },

  produtoOpcao: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  infoLinha: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F6EDF0',
  },

  infoRotulo: {
    color: '#737178',
    fontSize: 12,
    fontWeight: '700',
  },

  infoValor: {
    flex: 1,
    color: '#242329',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },

  secaoTitulo: {
    color: '#FF3B73',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 18,
    marginBottom: 10,
  },

  itemDetalhe: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  botaoPerigo: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#D93C56',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },

  botaoPerigoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
