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
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
} from '../database/database';

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
    Alert.alert('Excluir compra', 'Apenas compras canceladas podem ser excluídas. Deseja continuar?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirCompra(detalhes.id);
            setModalDetalhes(false);
            setDetalhes(null);
            await carregarCompras();
          } catch (error) {
            Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível excluir a compra.');
          }
        },
      },
    ]);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTituloLinha}>
          <Ionicons name="cart-outline" size={22} color="#111" />
          <Text style={styles.headerTitulo}>COMPRAS</Text>
        </View>
        <View style={styles.espacoHeader} />
      </View>

      <View style={styles.buscaContainer}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar por ID, data, status ou produto"
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={carregarCompras}
        />
        {!!busca && <TouchableOpacity onPress={() => setBusca('')}><Ionicons name="close-circle" size={20} color="#777" /></TouchableOpacity>}
      </View>

      <TouchableOpacity style={styles.botaoPrincipal} onPress={abrirNovaCompra}>
        <Ionicons name="add-circle-outline" size={21} color="#fff" />
        <Text style={styles.botaoPrincipalTexto}>NOVA COMPRA</Text>
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
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma compra encontrada.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => abrirDetalhes(item)}>
            <Text style={[styles.celula, { flex: 0.7 }]}>#{item.id}</Text>
            <Text style={[styles.celula, { flex: 1.2 }]}>{item.data_compra}</Text>
            <Text style={[styles.celula, styles.status, item.status === 'CANCELADA' && styles.statusCancelada, { flex: 1.3 }]}>{item.status}</Text>
            <Text style={[styles.celula, styles.valor, { flex: 1.2 }]}>{formatarMoeda(item.valor_total)}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalFormulario} transparent animationType="fade" onRequestClose={() => setModalFormulario(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalGrande}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitulo}>NOVA COMPRA</Text>
              <Text style={styles.label}>Data da compra</Text>
              <TextInput style={styles.input} value={dataCompra} onChangeText={setDataCompra} placeholder="AAAA-MM-DD" />
              <Text style={styles.label}>Observações</Text>
              <TextInput style={[styles.input, styles.inputMultilinha]} value={observacoes} onChangeText={setObservacoes} multiline placeholder="Opcional" />

              <TouchableOpacity style={styles.botaoSecundario} onPress={abrirNovoItem}>
                <Ionicons name="add" size={20} color="#111" />
                <Text style={styles.botaoSecundarioTexto}>ADICIONAR ITEM</Text>
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
                <Text style={styles.totalLabel}>TOTAL DA COMPRA</Text>
                <Text style={styles.totalValor}>{formatarMoeda(totalCompra)}</Text>
              </View>

              <View style={styles.botoesModal}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalFormulario(false)}><Text style={styles.botaoCancelarTexto}>FECHAR</Text></TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={confirmarCompra}><Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={styles.botaoSalvarTexto}>CONFIRMAR</Text></TouchableOpacity>
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
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarItem}><Text style={styles.botaoSalvarTexto}>SALVAR ITEM</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalProdutos} transparent animationType="fade" onRequestClose={() => setModalProdutos(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalMedio}>
            <Text style={styles.modalTitulo}>SELECIONAR PRODUTO</Text>
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
              <Text style={styles.modalTitulo}>DETALHES DA COMPRA</Text>
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
                    <TouchableOpacity style={styles.botaoPerigo} onPress={confirmarCancelamento}><Ionicons name="close-circle-outline" size={20} color="#fff" /><Text style={styles.botaoPerigoTexto}>CANCELAR COMPRA</Text></TouchableOpacity>
                  )}
                  {detalhes.status === 'CANCELADA' && (
                    <TouchableOpacity style={styles.botaoPerigo} onPress={confirmarExclusao}><Ionicons name="trash-outline" size={20} color="#fff" /><Text style={styles.botaoPerigoTexto}>EXCLUIR COMPRA</Text></TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.botaoCancelarInteiro} onPress={() => setModalDetalhes(false)}><Text style={styles.botaoCancelarTexto}>FECHAR</Text></TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
    paddingHorizontal: 16,
    paddingTop: 50,
  },

  header: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#d1d1d1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  headerTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },

  espacoHeader: {
    width: 40,
  },

  buscaContainer: {
    minHeight: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  buscaInput: {
    flex: 1,
    color: '#111',
    fontSize: 14,
  },

  botaoScannerBusca: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoPrincipal: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },

  botaoPrincipalTexto: {
    color: '#fff',
    fontWeight: '800',
  },

  cabecalhoGrid: {
    minHeight: 42,
    backgroundColor: '#cfcfcf',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 7,
  },

  cabecalhoCelula: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  cabecalhoTexto: {
    fontSize: 11,
    fontWeight: '800',
    color: '#222',
  },

  lista: {
    paddingBottom: 90,
  },

  card: {
    minHeight: 58,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 7,
  },

  celula: {
    textAlign: 'center',
    fontSize: 12,
    color: '#222',
  },

  status: {
    fontWeight: '800',
    color: '#237a39',
  },

  statusCancelada: {
    color: '#b00020',
  },

  valor: {
    fontWeight: '700',
  },

  vazio: {
    textAlign: 'center',
    marginTop: 35,
    color: '#666',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  modalGrande: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    padding: 18,
  },

  modalMedio: {
    width: '100%',
    maxHeight: '84%',
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    padding: 18,
  },

  modalTitulo: {
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    color: '#111',
    marginBottom: 18,
  },

  label: {
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    marginTop: 5,
  },

  input: {
    minHeight: 48,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c7c7c7',
    borderRadius: 11,
    paddingHorizontal: 12,
    color: '#111',
    marginBottom: 12,
  },

  inputMultilinha: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  seletor: {
    minHeight: 48,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c7c7c7',
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  seletorTexto: {
    color: '#111',
    flex: 1,
  },

  placeholder: {
    color: '#888',
    flex: 1,
  },

  botaoSecundario: {
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: '#111',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginVertical: 8,
  },

  botaoSecundarioTexto: {
    color: '#111',
    fontWeight: '800',
  },

  itemCompra: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemTextoArea: {
    flex: 1,
  },

  itemNome: {
    fontWeight: '800',
    color: '#111',
    marginBottom: 3,
  },

  itemDescricao: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },

  itemSubtotal: {
    fontWeight: '800',
    color: '#111',
    marginTop: 5,
  },

  acoesItem: {
    flexDirection: 'row',
    gap: 13,
    paddingLeft: 10,
  },

  totalBox: {
    marginTop: 12,
    backgroundColor: '#dedede',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontWeight: '900',
    color: '#111',
  },

  totalValor: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
  },

  botoesModal: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  botaoCancelar: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoCancelarTexto: {
    fontWeight: '800',
    color: '#222',
  },

  botaoSalvar: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#111',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoSalvarTexto: {
    fontWeight: '800',
    color: '#fff',
  },

  opcoesUnidade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 8,
  },

  unidadeChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#fff',
  },

  unidadeChipAtiva: {
    backgroundColor: '#111',
    borderColor: '#111',
  },

  unidadeChipTexto: {
    color: '#333',
    fontWeight: '700',
  },

  unidadeChipTextoAtivo: {
    color: '#fff',
  },

  ajuda: {
    color: '#666',
    fontSize: 12,
    marginBottom: 13,
  },

  listaProdutos: {
    maxHeight: 390,
  },

  produtoOpcao: {
    minHeight: 58,
    backgroundColor: '#fff',
    borderRadius: 11,
    paddingHorizontal: 12,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  botaoCancelarInteiro: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  infoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  infoRotulo: {
    color: '#555',
    fontWeight: '700',
  },

  infoValor: {
    flex: 1,
    textAlign: 'right',
    color: '#111',
    fontWeight: '600',
  },

  secaoTitulo: {
    fontWeight: '900',
    color: '#111',
    marginTop: 18,
    marginBottom: 8,
  },

  itemDetalhe: {
    backgroundColor: '#fff',
    borderRadius: 11,
    padding: 12,
    marginBottom: 8,
  },

  botaoPerigo: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#b00020',
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  botaoPerigoTexto: {
    color: '#fff',
    fontWeight: '800',
  },
});
