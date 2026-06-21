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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  cadastrarProduto,
  DirecaoOrdenacao,
  editarProduto,
  excluirProduto,
  listarProdutos,
  OrdenarProdutoPor,
  ProdutoEstoque,
} from '../database/database';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

type ModoFormulario = 'cadastro' | 'edicao';
type CampoScanner = 'busca' | 'formulario';
type UnidadeMedidaProduto =
  | 'un'
  | 'kg'
  | 'g'
  | 'l'
  | 'ml'
  | 'caixa'
  | 'pacote'
  | 'duzia';

type OpcaoUnidade = {
  valor: UnidadeMedidaProduto;
  rotulo: string;
};

const UNIDADES_MEDIDA: OpcaoUnidade[] = [
  { valor: 'un', rotulo: 'un' },
  { valor: 'kg', rotulo: 'kg' },
  { valor: 'g', rotulo: 'g' },
  { valor: 'l', rotulo: 'L' },
  { valor: 'ml', rotulo: 'ml' },
  { valor: 'caixa', rotulo: 'caixa' },
  { valor: 'pacote', rotulo: 'pacote' },
  { valor: 'duzia', rotulo: 'dúzia' },
];

export default function EstoqueScreen() {
  const navigation = useNavigation<any>();

  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modoFormulario, setModoFormulario] =
    useState<ModoFormulario>('cadastro');
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null);

  const [ordenarPor, setOrdenarPor] =
    useState<OrdenarProdutoPor>('nome');
  const [direcaoOrdenacao, setDirecaoOrdenacao] =
    useState<DirecaoOrdenacao>('ASC');

  const [busca, setBusca] = useState('');
  const [nome, setNome] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [unidadeMedida, setUnidadeMedida] =
    useState<UnidadeMedidaProduto>('un');

  const [scannerVisivel, setScannerVisivel] = useState(false);
  const [campoScanner, setCampoScanner] =
    useState<CampoScanner>('busca');

  const obterNomeProduto = (produto: ProdutoEstoque) =>
    produto.nome || produto.descricao || 'Produto sem nome';

  const obterRotuloUnidade = (unidade?: string) => {
    const unidadeNormalizada = unidade?.trim().toLowerCase() || 'un';
    return (
      UNIDADES_MEDIDA.find((item) => item.valor === unidadeNormalizada)
        ?.rotulo || unidade || 'un'
    );
  };

  const formatarMoeda = (valor: number | undefined | null) =>
    Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const formatarQuantidade = (valor: number | undefined | null) =>
    Number(valor || 0).toLocaleString('pt-BR', {
      maximumFractionDigits: 3,
    });

  const carregarProdutos = useCallback(async () => {
    try {
      const resultado = await listarProdutos(
        ordenarPor,
        direcaoOrdenacao
      );
      setProdutos(resultado);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os produtos.';

      Alert.alert('Erro', mensagem);
    }
  }, [ordenarPor, direcaoOrdenacao]);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  const produtosFiltrados = useMemo(() => {
    const textoBusca = busca.trim().toLowerCase();

    if (!textoBusca) {
      return produtos;
    }

    return produtos.filter((produto) => {
      const id = String(produto.id);
      const nomeProduto = obterNomeProduto(produto).toLowerCase();
      const codigo = String(produto.codigo_barras || '').toLowerCase();

      return (
        id.includes(textoBusca) ||
        nomeProduto.includes(textoBusca) ||
        codigo.includes(textoBusca)
      );
    });
  }, [produtos, busca]);

  const abrirScanner = (campo: CampoScanner) => {
    setCampoScanner(campo);
    setScannerVisivel(true);
  };

  const aoReceberCodigo = (codigo: string) => {
    if (campoScanner === 'busca') {
      setBusca(codigo);
    } else {
      setCodigoBarras(codigo);
    }

    setScannerVisivel(false);
  };

  const limparFormulario = () => {
    setNome('');
    setCodigoBarras('');
    setUnidadeMedida('un');
  };

  const preencherFormulario = (produto: ProdutoEstoque) => {
    setNome(obterNomeProduto(produto));
    setCodigoBarras(produto.codigo_barras || '');

    const unidadeProduto = produto.unidade_medida
      ?.trim()
      .toLowerCase() as UnidadeMedidaProduto;

    const unidadeValida = UNIDADES_MEDIDA.some(
      (item) => item.valor === unidadeProduto
    );

    setUnidadeMedida(unidadeValida ? unidadeProduto : 'un');
  };

  const fecharFormulario = () => {
    limparFormulario();
    setModalFormulario(false);
    setProdutoSelecionado(null);
  };

  const abrirCadastro = () => {
    setModoFormulario('cadastro');
    setProdutoSelecionado(null);
    limparFormulario();
    setModalFormulario(true);
  };

  const abrirDetalhes = (produto: ProdutoEstoque) => {
    setProdutoSelecionado(produto);
    setModalDetalhes(true);
  };

  const fecharDetalhes = () => {
    setModalDetalhes(false);
    setProdutoSelecionado(null);
  };

  const abrirEdicao = () => {
    if (!produtoSelecionado) {
      return;
    }

    setModoFormulario('edicao');
    preencherFormulario(produtoSelecionado);
    setModalDetalhes(false);
    setModalFormulario(true);
  };

  const salvarProduto = async () => {
    try {
      if (!nome.trim()) {
        Alert.alert('Erro', 'Informe o nome do produto.');
        return;
      }

      if (!unidadeMedida) {
        Alert.alert('Erro', 'Selecione a unidade de medida.');
        return;
      }

      if (modoFormulario === 'cadastro') {
        await cadastrarProduto({
          nome: nome.trim(),
          codigo_barras: codigoBarras.trim(),
          unidade_medida: unidadeMedida,
        });
      } else {
        if (!produtoSelecionado) {
          Alert.alert('Erro', 'Produto inválido.');
          return;
        }

        await editarProduto({
          id: produtoSelecionado.id,
          nome: nome.trim(),
          codigo_barras: codigoBarras.trim(),
          unidade_medida: unidadeMedida,
        });
      }

      fecharFormulario();
      await carregarProdutos();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o produto.';

      Alert.alert('Erro', mensagem);
    }
  };

  const confirmarExclusao = () => {
    if (!produtoSelecionado) {
      return;
    }

    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${obterNomeProduto(
        produtoSelecionado
      )}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirProduto(produtoSelecionado.id);
              fecharDetalhes();
              await carregarProdutos();
            } catch (error) {
              const mensagem =
                error instanceof Error
                  ? error.message
                  : 'Não foi possível excluir o produto.';

              Alert.alert('Erro', mensagem);
            }
          },
        },
      ]
    );
  };

  const alternarOrdenacao = (coluna: OrdenarProdutoPor) => {
    if (ordenarPor === coluna) {
      setDirecaoOrdenacao((direcaoAtual) =>
        direcaoAtual === 'ASC' ? 'DESC' : 'ASC'
      );
      return;
    }

    setOrdenarPor(coluna);
    setDirecaoOrdenacao('ASC');
  };

  const renderIndicadorOrdenacao = (coluna: OrdenarProdutoPor) => {
    if (ordenarPor !== coluna) {
      return null;
    }

    return (
      <Ionicons
        name={direcaoOrdenacao === 'ASC' ? 'chevron-up' : 'chevron-down'}
        size={13}
        color="#1a1a1a"
      />
    );
  };

  const renderCabecalho = (
    titulo: string,
    coluna: OrdenarProdutoPor,
    estilo: object
  ) => (
    <TouchableOpacity
      style={[styles.headerCell, estilo]}
      onPress={() => alternarOrdenacao(coluna)}
      activeOpacity={0.7}
    >
      <Text style={styles.headerCellText}>{titulo}</Text>
      {renderIndicadorOrdenacao(coluna)}
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: ProdutoEstoque }) => {
    const produtoZerado = Number(item.quantidade || 0) <= 0;

    return (
      <TouchableOpacity
        style={[styles.row, produtoZerado && styles.rowZerado]}
        onPress={() => abrirDetalhes(item)}
        activeOpacity={0.75}
      >
        <Text style={styles.cellNome} numberOfLines={2}>
          {obterNomeProduto(item)}
        </Text>

        <Text
          style={[
            styles.cellQuantidade,
            produtoZerado && styles.textoZerado,
          ]}
          numberOfLines={1}
        >
          {formatarQuantidade(item.quantidade)}
        </Text>

        <Text style={styles.cellUnidade} numberOfLines={1}>
          {obterRotuloUnidade(item.unidade_medida)}
        </Text>

        <Text style={styles.cellPreco} numberOfLines={1}>
          {formatarMoeda(item.preco_medio)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerTextArea}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="cube-outline" size={23} color="#1a1a1a" />
            <Text style={styles.headerTitle}>ESTOQUE</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchInputContainer}>
        
        <TextInput
          style={styles.searchInputComIcone}
          placeholder="Buscar por nome, código de barras ou ID"
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
        />

        {busca.length > 0 && (
          <TouchableOpacity
            style={styles.inputIconButton}
            onPress={() => setBusca('')}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={21} color="#777" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.inputIconButton}
          onPress={() => abrirScanner('busca')}
          activeOpacity={0.7}
        >
          <Ionicons name="barcode-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={abrirCadastro}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={21} color="#fff" />
        <Text style={styles.primaryButtonText}>Novo Produto</Text>
      </TouchableOpacity>

      <View style={styles.tableHeader}>
        {renderCabecalho('NOME', 'nome', styles.headerNome)}
        {renderCabecalho('QTD', 'quantidade', styles.headerQuantidade)}
        {renderCabecalho(
          'UNID.',
          'unidade_medida',
          styles.headerUnidade
        )}
        {renderCabecalho(
          'PREÇO MÉDIO',
          'preco_medio',
          styles.headerPreco
        )}
      </View>

      <FlatList
        data={produtosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item: ProdutoEstoque) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={34} color="#777" />
            <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
          </View>
        }
      />

      <Modal
        visible={modalDetalhes}
        transparent
        animationType="fade"
        onRequestClose={fecharDetalhes}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            {produtoSelecionado && (
              <>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="cube-outline" size={22} color="#1a1a1a" />
                  <Text style={styles.detailsModalTitle}>
                    DADOS DO PRODUTO
                  </Text>
                </View>

                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>
                      {produtoSelecionado.id}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nome:</Text>
                    <Text style={styles.detailValue}>
                      {obterNomeProduto(produtoSelecionado)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>
                      {produtoSelecionado.codigo_barras || '-'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Unidade:</Text>
                    <Text style={styles.detailValue}>
                      {obterRotuloUnidade(
                        produtoSelecionado.unidade_medida
                      )}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantidade:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        produtoSelecionado.quantidade <= 0 &&
                          styles.textoZerado,
                      ]}
                    >
                      {formatarQuantidade(produtoSelecionado.quantidade)}{' '}
                      {obterRotuloUnidade(
                        produtoSelecionado.unidade_medida
                      )}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Última entrada:</Text>
                    <Text style={styles.detailValue}>
                      {formatarMoeda(
                        produtoSelecionado.preco_ultima_entrada
                      )}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <Text style={styles.detailLabel}>Preço médio:</Text>
                    <Text style={styles.detailValue}>
                      {formatarMoeda(produtoSelecionado.preco_medio)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsButtonsRow}>
                  <TouchableOpacity
                    style={[styles.detailsButton, styles.editButton]}
                    onPress={abrirEdicao}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={19} color="#fff" />
                    <Text style={styles.detailsButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailsButton, styles.deleteButton]}
                    onPress={confirmarExclusao}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={19} color="#fff" />
                    <Text style={styles.detailsButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.detailsCloseButton, styles.cancelButton]}
                  onPress={fecharDetalhes}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={19}
                    color="#fff"
                  />
                  <Text style={styles.detailsButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalFormulario}
        transparent
        animationType="fade"
        onRequestClose={fecharFormulario}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTitleRow}>
              <Ionicons
                name={
                  modoFormulario === 'cadastro'
                    ? 'add-circle-outline'
                    : 'create-outline'
                }
                size={22}
                color="#1a1a1a"
              />
              <Text style={styles.modalTitle}>
                {modoFormulario === 'cadastro'
                  ? 'NOVO PRODUTO'
                  : 'EDITAR PRODUTO'}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formScrollContent}
            >
              {modoFormulario === 'edicao' && produtoSelecionado && (
                <>
                  <Text style={styles.inputLabel}>ID:</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={String(produtoSelecionado.id)}
                    editable={false}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Nome do produto:</Text>
              <View style={styles.inputComIconeContainer}>
                <Ionicons name="cube-outline" size={20} color="#666" />
                <TextInput
                  style={styles.inputComIcone}
                  placeholder="Digite o nome do produto"
                  placeholderTextColor="#888"
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="sentences"
                />
              </View>

              <Text style={styles.inputLabel}>Código de barras:</Text>
              <View style={styles.inputComIconeContainer}>
                
                <TextInput
                  style={styles.inputComIcone}
                  placeholder="Digite ou leia o código de barras"
                  placeholderTextColor="#888"
                  value={codigoBarras}
                  onChangeText={setCodigoBarras}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.inputIconButton}
                  onPress={() => abrirScanner('formulario')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="barcode-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.labelComIcone}>
                <Ionicons name="scale-outline" size={17} color="#1a1a1a" />
                <Text style={styles.inputLabelSemMargem}>
                  Unidade de medida:
                </Text>
              </View>

              <View style={styles.unidadeContainer}>
                {UNIDADES_MEDIDA.map((unidade) => {
                  const selecionada = unidadeMedida === unidade.valor;

                  return (
                    <TouchableOpacity
                      key={unidade.valor}
                      style={[
                        styles.unidadeButton,
                        selecionada && styles.unidadeButtonSelected,
                      ]}
                      onPress={() => setUnidadeMedida(unidade.valor)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.unidadeButtonText,
                          selecionada &&
                            styles.unidadeButtonTextSelected,
                        ]}
                      >
                        {unidade.rotulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color="#444"
                />
                <Text style={styles.infoText}>
                  {modoFormulario === 'cadastro'
                    ? 'O produto será criado com quantidade e preços zerados. As entradas serão registradas pelo módulo de Compras.'
                    : 'Quantidade e preços não são alterados por este formulário. Esses valores serão controlados pelas compras e vendas.'}
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={fecharFormulario}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={19}
                    color="#fff"
                  />
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarProduto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="save-outline" size={19} color="#fff" />
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
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
  headerTextArea: {
    paddingHorizontal: 42,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 4,
    marginBottom: 10,
    height: 46,
  },
  searchInputComIcone: {
    flex: 1,
    height: '100%',
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 9,
  },
  inputIconButton: {
    width: 38,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c8c8c8',
    borderRadius: 8,
    marginBottom: 5,
    overflow: 'hidden',
  },
  headerCell: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  headerNome: {
    flex: 1.75,
    borderRightWidth: 1,
    borderRightColor: '#b0b0b0',
  },
  headerQuantidade: {
    flex: 0.72,
    borderRightWidth: 1,
    borderRightColor: '#b0b0b0',
  },
  headerUnidade: {
    flex: 0.72,
    borderRightWidth: 1,
    borderRightColor: '#b0b0b0',
  },
  headerPreco: {
    flex: 1.18,
  },
  headerCellText: {
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 28,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    overflow: 'hidden',
    minHeight: 56,
    alignItems: 'center',
  },
  rowZerado: {
    backgroundColor: '#fff7f7',
    borderColor: '#efb8b8',
  },
  cellNome: {
    flex: 1.75,
    paddingVertical: 10,
    paddingHorizontal: 9,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'left',
    fontSize: 12.5,
  },
  cellQuantidade: {
    flex: 0.72,
    paddingVertical: 10,
    paddingHorizontal: 3,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 12,
  },
  cellUnidade: {
    flex: 0.72,
    paddingVertical: 10,
    paddingHorizontal: 3,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 11.5,
  },
  cellPreco: {
    flex: 1.18,
    paddingVertical: 10,
    paddingHorizontal: 4,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 11.5,
  },
  textoZerado: {
    color: '#c90000',
    fontWeight: '900',
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 22,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  detailsModalContent: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 16,
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 1,
  },
  detailsCard: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
    gap: 10,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: '#333',
  },
  detailValue: {
    flex: 1.45,
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  detailsButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  detailsCloseButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  formScrollContent: {
    paddingBottom: 2,
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 5,
    marginLeft: 2,
  },
  inputLabelSemMargem: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#777',
  },
  inputComIconeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 3,
    marginBottom: 11,
    height: 47,
  },
  inputComIcone: {
    flex: 1,
    height: '100%',
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 9,
  },
  labelComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 7,
    marginLeft: 2,
  },
  unidadeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  unidadeButton: {
    minWidth: '22%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  unidadeButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  unidadeButtonText: {
    color: '#1a1a1a',
    fontWeight: '900',
    fontSize: 13,
  },
  unidadeButtonTextSelected: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 9,
    padding: 11,
    marginBottom: 15,
  },
  infoText: {
    flex: 1,
    color: '#444',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  editButton: {
    backgroundColor: '#000',
  },
  deleteButton: {
    backgroundColor: '#c90000',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
