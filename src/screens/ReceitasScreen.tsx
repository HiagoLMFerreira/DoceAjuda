import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  ReceitaDatabase,
  ReceitaDetalhada,
  NovoItemReceita,
  ProdutoEstoque,
  listarReceitas,
  buscarReceitaDetalhada,
  salvarReceitaCompleta,
  editarReceitaCompleta,
  excluirReceita,
  listarProdutos,
} from "../database/database";

import BarcodeScannerModal from "../components/BarcodeScannerModal";

type ModoFormulario = "cadastro" | "edicao";
type OrdenarReceitaPor = "nome" | "rendimento";
type DirecaoOrdenacao = "ASC" | "DESC";

type ItemReceitaLocal = NovoItemReceita & {
  produto_nome: string;
  quantidade_numero: number;
  unidade_medida: string;
};

const UNIDADES_MEDIDA = ["g", "kg", "ml", "l", "un"];

function formatarNumero(valor: number): string {
  return Number(valor || 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

export default function ReceitasScreen() {
  const navigation = useNavigation<any>();

  const [receitas, setReceitas] = useState<ReceitaDatabase[]>([]);
  const [busca, setBusca] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<OrdenarReceitaPor>("nome");
  const [direcaoOrdenacao, setDirecaoOrdenacao] =
    useState<DirecaoOrdenacao>("ASC");

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalAdicionarProduto, setModalAdicionarProduto] = useState(false);
  const [modalSelecionarProduto, setModalSelecionarProduto] = useState(false);

  const [modoFormulario, setModoFormulario] =
    useState<ModoFormulario>("cadastro");

  const [receitaSelecionada, setReceitaSelecionada] =
    useState<ReceitaDetalhada | null>(null);

  const [receitaIdEdicao, setReceitaIdEdicao] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [rendimento, setRendimento] = useState("");
  const [modoPreparo, setModoPreparo] = useState("");

  const [itensReceita, setItensReceita] = useState<ItemReceitaLocal[]>([]);
  const [indiceItemEdicao, setIndiceItemEdicao] = useState<number | null>(null);

  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtosEncontrados, setProdutosEncontrados] = useState<
    ProdutoEstoque[]
  >([]);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null);
  const [quantidadeUsada, setQuantidadeUsada] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("un");

  const [scannerVisivel, setScannerVisivel] = useState(false);

  const obterNomeProduto = (produto: ProdutoEstoque) => {
    return produto.nome || produto.descricao || "Produto sem nome";
  };

  const obterQuantidadeEstoque = (produto: ProdutoEstoque) => {
    return Number(produto.quantidade || 0);
  };

  const obterUnidadeEstoque = (produto: ProdutoEstoque) => {
    return produto.unidade_medida || "un";
  };

  const formatarQuantidade = (quantidade: number, unidade: string) => {
    if (!quantidade) {
      return "";
    }

    return `${quantidade} ${unidade}`;
  };

  const extrairQuantidadeAntiga = (quantidadeTexto: string) => {
    const texto = quantidadeTexto.trim().replace(",", ".");
    const quantidadeEncontrada = texto.match(/\d+(\.\d+)?/);
    const unidadeEncontrada = texto.match(/[a-zA-Z]+/);

    const unidadeTexto = unidadeEncontrada
      ? unidadeEncontrada[0].toLowerCase()
      : "un";

    const unidadeNormalizada = unidadeTexto.startsWith("un")
      ? "un"
      : unidadeTexto;

    return {
      quantidade: quantidadeEncontrada ? Number(quantidadeEncontrada[0]) : 0,
      unidade: UNIDADES_MEDIDA.includes(unidadeNormalizada)
        ? unidadeNormalizada
        : "un",
    };
  };

  const carregarReceitas = useCallback(async () => {
    try {
      const resultado = await listarReceitas();
      setReceitas(resultado);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as receitas.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarReceitas();
    }, [carregarReceitas]),
  );

  const receitasFiltradas = useMemo(() => {
    const textoBusca = busca.trim().toLowerCase();

    const filtradas = textoBusca
      ? receitas.filter((receita) => {
          const id = String(receita.id);
          const nomeReceita = receita.nome.toLowerCase();
          const rendimentoReceita = receita.rendimento.toLowerCase();

          return (
            id.includes(textoBusca) ||
            nomeReceita.includes(textoBusca) ||
            rendimentoReceita.includes(textoBusca)
          );
        })
      : [...receitas];

    return filtradas.sort((receitaA, receitaB) => {
      const valorA = String(receitaA[ordenarPor] || "").toLowerCase();
      const valorB = String(receitaB[ordenarPor] || "").toLowerCase();
      const comparacao = valorA.localeCompare(valorB, "pt-BR");

      return direcaoOrdenacao === "ASC" ? comparacao : -comparacao;
    });
  }, [receitas, busca, ordenarPor, direcaoOrdenacao]);

  const produtosFiltrados = useMemo(() => {
    const textoBusca = buscaProduto.trim().toLowerCase();

    if (!textoBusca) {
      return produtosEncontrados;
    }

    return produtosEncontrados.filter((produto) => {
      const id = String(produto.id);
      const nomeProduto = obterNomeProduto(produto).toLowerCase();
      const codigoBarras = String(produto.codigo_barras || "").toLowerCase();

      return (
        id.includes(textoBusca) ||
        nomeProduto.includes(textoBusca) ||
        codigoBarras.includes(textoBusca)
      );
    });
  }, [produtosEncontrados, buscaProduto]);

  const ordenarReceitas = (campo: OrdenarReceitaPor) => {
    if (campo === ordenarPor) {
      setDirecaoOrdenacao((direcaoAtual) =>
        direcaoAtual === "ASC" ? "DESC" : "ASC",
      );
      return;
    }

    setOrdenarPor(campo);
    setDirecaoOrdenacao("ASC");
  };

  const obterIconeOrdenacao = (campo: OrdenarReceitaPor) => {
    if (campo !== ordenarPor) {
      return "swap-vertical-outline" as const;
    }

    return direcaoOrdenacao === "ASC"
      ? ("arrow-up-outline" as const)
      : ("arrow-down-outline" as const);
  };

  const limparFormulario = () => {
    setNome("");
    setRendimento("");
    setModoPreparo("");
    setItensReceita([]);
    setReceitaIdEdicao(null);
  };

  const limparModalProduto = () => {
    setBuscaProduto("");
    setProdutosEncontrados([]);
    setProdutoSelecionado(null);
    setQuantidadeUsada("");
    setUnidadeMedida("un");
    setIndiceItemEdicao(null);
    setModalSelecionarProduto(false);
  };

  const carregarProdutosDoEstoque = async () => {
    try {
      const resultado = await listarProdutos("nome", "ASC");
      setProdutosEncontrados(resultado);
      return resultado;
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os produtos do estoque.");
      return [] as ProdutoEstoque[];
    }
  };

  const abrirSelecaoProduto = async () => {
    setBuscaProduto("");

    if (produtosEncontrados.length === 0) {
      await carregarProdutosDoEstoque();
    }

    setModalSelecionarProduto(true);
  };

  const abrirCadastro = () => {
    setModoFormulario("cadastro");
    setReceitaSelecionada(null);
    limparFormulario();
    limparModalProduto();
    setModalFormulario(true);
  };

  const abrirDetalhes = async (receita: ReceitaDatabase) => {
    try {
      const resultado = await buscarReceitaDetalhada(receita.id);

      if (!resultado) {
        Alert.alert("Erro", "Receita não encontrada.");
        return;
      }

      setReceitaSelecionada(resultado);
      setModalDetalhes(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir os detalhes da receita.");
    }
  };

  const abrirEdicao = () => {
    if (!receitaSelecionada) {
      return;
    }

    setModoFormulario("edicao");
    setReceitaIdEdicao(receitaSelecionada.id);
    setNome(receitaSelecionada.nome);
    setRendimento(receitaSelecionada.rendimento);
    setModoPreparo(receitaSelecionada.modo_preparo || "");

    const itensFormatados: ItemReceitaLocal[] = receitaSelecionada.itens.map(
      (item) => {
        const itemComPrecificacao = item as typeof item & {
          quantidade_numero?: number;
          unidade_medida?: string;
        };

        const quantidadeAntiga = extrairQuantidadeAntiga(item.quantidade_usada);
        const quantidadeNumero =
          itemComPrecificacao.quantidade_numero || quantidadeAntiga.quantidade;
        const unidade =
          itemComPrecificacao.unidade_medida || quantidadeAntiga.unidade;

        return {
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          quantidade_usada: formatarQuantidade(quantidadeNumero, unidade),
          quantidade_numero: quantidadeNumero,
          unidade_medida: unidade,
        };
      },
    );

    setItensReceita(itensFormatados);
    limparModalProduto();

    setModalDetalhes(false);
    setModalFormulario(true);
  };

  const abrirModalAdicionarProduto = async () => {
    limparModalProduto();
    setModalAdicionarProduto(true);
    await carregarProdutosDoEstoque();
  };

  const abrirEdicaoItemReceita = async (
    item: ItemReceitaLocal,
    indice: number,
  ) => {
    setBuscaProduto("");
    setProdutosEncontrados([]);
    setProdutoSelecionado(null);
    setQuantidadeUsada(String(item.quantidade_numero).replace(".", ","));
    setUnidadeMedida(item.unidade_medida);
    setIndiceItemEdicao(indice);
    setModalAdicionarProduto(true);

    const produtos = await carregarProdutosDoEstoque();
    const produtoAtual = produtos.find(
      (produto) => produto.id === item.produto_id,
    );

    if (produtoAtual) {
      setProdutoSelecionado(produtoAtual);
    }
  };

  const pesquisarProdutos = (texto: string) => {
    setBuscaProduto(texto);
  };

  const selecionarProduto = (produto: ProdutoEstoque) => {
    setProdutoSelecionado(produto);

    const unidadeProduto = obterUnidadeEstoque(produto).toLowerCase();

    if (UNIDADES_MEDIDA.includes(unidadeProduto)) {
      setUnidadeMedida(unidadeProduto);
    }

    setModalSelecionarProduto(false);
  };

  const abrirScanner = () => {
    setScannerVisivel(true);
  };

  const aoReceberCodigo = (codigo: string) => {
    setScannerVisivel(false);
    setBuscaProduto(codigo.trim());
  };

  const salvarItemDaReceita = () => {
    if (!produtoSelecionado) {
      Alert.alert("Erro", "Selecione um produto.");
      return;
    }

    if (!quantidadeUsada.trim()) {
      Alert.alert("Erro", "Informe a quantidade usada.");
      return;
    }

    const quantidadeNumero = Number(quantidadeUsada.replace(",", "."));

    if (Number.isNaN(quantidadeNumero) || quantidadeNumero <= 0) {
      Alert.alert("Erro", "Informe uma quantidade válida.");
      return;
    }

    const jaExiste = itensReceita.some(
      (item, indice) =>
        item.produto_id === produtoSelecionado.id &&
        indice !== indiceItemEdicao,
    );

    if (jaExiste) {
      Alert.alert(
        "Erro",
        "Esse produto já foi adicionado. Edite o item existente.",
      );
      return;
    }

    const itemAtualizado: ItemReceitaLocal = {
      produto_id: produtoSelecionado.id,
      produto_nome: obterNomeProduto(produtoSelecionado),
      quantidade_usada: formatarQuantidade(quantidadeNumero, unidadeMedida),
      quantidade_numero: quantidadeNumero,
      unidade_medida: unidadeMedida,
    };

    setItensReceita((itensAtuais) => {
      if (indiceItemEdicao === null) {
        return [...itensAtuais, itemAtualizado];
      }

      return itensAtuais.map((item, indice) =>
        indice === indiceItemEdicao ? itemAtualizado : item,
      );
    });

    limparModalProduto();
    setModalAdicionarProduto(false);
  };

  const removerProdutoDaReceita = (indiceProduto: number) => {
    setItensReceita((itensAtuais) =>
      itensAtuais.filter((_, indice) => indice !== indiceProduto),
    );
  };

  const salvarReceita = async () => {
    try {
      if (!nome.trim()) {
        Alert.alert("Erro", "Informe o nome da receita.");
        return;
      }

      if (!rendimento.trim()) {
        Alert.alert("Erro", "Informe o rendimento da receita.");
        return;
      }

      if (itensReceita.length === 0) {
        Alert.alert("Erro", "Adicione pelo menos um produto à receita.");
        return;
      }

      const itensParaSalvar: NovoItemReceita[] = itensReceita.map((item) => ({
        produto_id: item.produto_id,
        quantidade_usada: item.quantidade_usada,
        quantidade_numero: item.quantidade_numero,
        unidade_medida: item.unidade_medida,
      }));

      if (modoFormulario === "cadastro") {
        await salvarReceitaCompleta(
          nome.trim(),
          rendimento.trim(),
          modoPreparo.trim(),
          itensParaSalvar,
        );
      } else {
        if (!receitaIdEdicao) {
          Alert.alert("Erro", "Receita inválida.");
          return;
        }

        await editarReceitaCompleta(
          receitaIdEdicao,
          nome.trim(),
          rendimento.trim(),
          modoPreparo.trim(),
          itensParaSalvar,
        );
      }

      limparFormulario();
      limparModalProduto();
      setModalFormulario(false);
      setReceitaSelecionada(null);
      carregarReceitas();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a receita.";

      Alert.alert("Erro", mensagem);
    }
  };

  const confirmarExclusao = () => {
    if (!receitaSelecionada) {
      return;
    }

    Alert.alert(
      "Excluir receita",
      `Deseja realmente excluir "${receitaSelecionada.nome}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await excluirReceita(receitaSelecionada.id);
              setModalDetalhes(false);
              setReceitaSelecionada(null);
              carregarReceitas();
            } catch (error) {
              const mensagem =
                error instanceof Error
                  ? error.message
                  : "Não foi possível excluir a receita.";

              Alert.alert("Erro", mensagem);
            }
          },
        },
      ],
    );
  };

  const renderReceita = ({ item }: { item: ReceitaDatabase }) => {
    return (
      <TouchableOpacity style={styles.row} onPress={() => abrirDetalhes(item)}>
        <Text style={styles.cellNome} numberOfLines={2}>
          {item.nome}
        </Text>

        <Text style={styles.cellRendimento} numberOfLines={2}>
          {item.rendimento}
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
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerTextArea}>
          <Ionicons name="restaurant-outline" size={22} color="#1a1a1a" />
          <Text style={styles.headerTitle}>RECEITAS</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, rendimento ou ID"
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={abrirCadastro}>
          <Ionicons name="add-circle-outline" size={21} color="#fff" />
          <Text style={styles.primaryButtonText}>NOVA RECEITA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <TouchableOpacity
          style={styles.headerNome}
          onPress={() => ordenarReceitas("nome")}
          activeOpacity={0.7}
        >
          <Text style={styles.headerCellText}>RECEITA</Text>
          <Ionicons
            name={obterIconeOrdenacao("nome")}
            size={15}
            color="#1a1a1a"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerRendimento}
          onPress={() => ordenarReceitas("rendimento")}
          activeOpacity={0.7}
        >
          <Text style={styles.headerCellText}>RENDIMENTO</Text>
          <Ionicons
            name={obterIconeOrdenacao("rendimento")}
            size={15}
            color="#1a1a1a"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={receitasFiltradas}
        renderItem={renderReceita}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhuma receita encontrada.</Text>
          </View>
        }
      />

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            {receitaSelecionada && (
              <>
                <Text style={styles.detailsModalTitle}>DADOS DA RECEITA</Text>

                <ScrollView
                  style={styles.detailsScroll}
                  showsVerticalScrollIndicator
                >
                  <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ID:</Text>
                      <Text style={styles.detailValue}>
                        {receitaSelecionada.id}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nome:</Text>
                      <Text style={styles.detailValue}>
                        {receitaSelecionada.nome}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, styles.detailRowLast]}>
                      <Text style={styles.detailLabel}>Rendimento:</Text>
                      <Text style={styles.detailValue}>
                        {receitaSelecionada.rendimento}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.detailSectionTitle}>Ingredientes</Text>

                    {receitaSelecionada.itens.length === 0 ? (
                      <Text style={styles.emptyTextSmall}>
                        Nenhum produto vinculado.
                      </Text>
                    ) : (
                      receitaSelecionada.itens.map((item) => (
                        <View key={item.id} style={styles.ingredienteDetalhe}>
                          <Text style={styles.ingredienteNome}>
                            {item.produto_nome}
                          </Text>
                          <Text style={styles.ingredienteQuantidade}>
                            {item.quantidade_usada}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.detailSectionTitle}>
                      Modo de preparo
                    </Text>
                    <Text style={styles.modoPreparoTexto}>
                      {receitaSelecionada.modo_preparo?.trim() ||
                        "Não informado."}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.detailsButtonsRow}>
                  <TouchableOpacity
                    style={[styles.detailsButton, styles.editButton]}
                    onPress={abrirEdicao}
                  >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={styles.detailsButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailsButton, styles.deleteButton]}
                    onPress={confirmarExclusao}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.detailsButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.detailsCloseButton, styles.cancelButton]}
                  onPress={() => {
                    setModalDetalhes(false);
                    setReceitaSelecionada(null);
                  }}
                >
                  <Ionicons name="close-outline" size={19} color="#fff" />
                  <Text style={styles.detailsButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={modalFormulario} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>
              {modoFormulario === "cadastro"
                ? "NOVA RECEITA"
                : "EDITAR RECEITA"}
            </Text>

            <ScrollView showsVerticalScrollIndicator>
              {modoFormulario === "edicao" && receitaIdEdicao && (
                <>
                  <Text style={styles.inputLabel}>ID:</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={String(receitaIdEdicao)}
                    editable={false}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Nome:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome da receita"
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.inputLabel}>Rendimento:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 30 unidades, 12 fatias, 1 bolo..."
                placeholderTextColor="#888"
                value={rendimento}
                onChangeText={setRendimento}
              />

              <Text style={styles.inputLabel}>Produtos da receita:</Text>

              <TouchableOpacity
                style={styles.addProdutoButton}
                onPress={abrirModalAdicionarProduto}
              >
                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                <Text style={styles.addProdutoButtonText}>
                  Adicionar produto
                </Text>
              </TouchableOpacity>

              <View style={styles.itensBox}>
                {itensReceita.length === 0 ? (
                  <Text style={styles.emptyTextSmall}>
                    Nenhum produto adicionado.
                  </Text>
                ) : (
                  <ScrollView
                    style={styles.itensScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    {itensReceita.map((item, indice) => (
                      <View
                        key={`${item.produto_id}-${indice}`}
                        style={styles.itemReceita}
                      >
                        <View style={styles.itemReceitaInfo}>
                          <Text style={styles.itemReceitaNome}>
                            {item.produto_nome}
                          </Text>
                          <Text style={styles.itemReceitaQuantidade}>
                            {item.quantidade_usada}
                          </Text>
                        </View>

                        <View style={styles.itemReceitaAcoes}>
                          <TouchableOpacity
                            style={styles.editItemButton}
                            onPress={() => abrirEdicaoItemReceita(item, indice)}
                          >
                            <Ionicons
                              name="create-outline"
                              size={18}
                              color="#fff"
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.removeItemButton}
                            onPress={() => removerProdutoDaReceita(indice)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <Text style={styles.inputLabel}>Modo de preparo (opcional):</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Digite o modo de preparo da receita"
                placeholderTextColor="#888"
                value={modoPreparo}
                onChangeText={setModoPreparo}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    limparFormulario();
                    limparModalProduto();
                    setModalFormulario(false);
                  }}
                >
                  <Ionicons name="close-outline" size={18} color="#fff" />
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarReceita}
                >
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalAdicionarProduto}
        transparent
        animationType="fade"
        onRequestClose={() => {
          limparModalProduto();
          setModalAdicionarProduto(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {indiceItemEdicao === null
                ? "ADICIONAR PRODUTO"
                : "EDITAR PRODUTO"}
            </Text>

            <Text style={styles.inputLabel}>Produto:</Text>

            <TouchableOpacity
              style={styles.seletorProduto}
              onPress={abrirSelecaoProduto}
              activeOpacity={0.7}
            >
              <View style={styles.seletorProdutoTextoArea}>
                <Text
                  style={
                    produtoSelecionado
                      ? styles.seletorProdutoTexto
                      : styles.seletorProdutoPlaceholder
                  }
                  numberOfLines={1}
                >
                  {produtoSelecionado
                    ? obterNomeProduto(produtoSelecionado)
                    : "Selecionar produto"}
                </Text>

                {produtoSelecionado && (
                  <Text style={styles.seletorProdutoSubtexto}>
                    Unidade do estoque:{" "}
                    {obterUnidadeEstoque(produtoSelecionado)}
                  </Text>
                )}
              </View>

              <Ionicons name="chevron-down" size={20} color="#444" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Quantidade usada:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 500, 2, 100..."
              placeholderTextColor="#888"
              value={quantidadeUsada}
              onChangeText={setQuantidadeUsada}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Unidade de medida:</Text>
            <View style={styles.unidadeContainer}>
              {UNIDADES_MEDIDA.map((unidade) => (
                <TouchableOpacity
                  key={unidade}
                  style={[
                    styles.unidadeButton,
                    unidadeMedida === unidade && styles.unidadeButtonSelected,
                  ]}
                  onPress={() => setUnidadeMedida(unidade)}
                >
                  <Text
                    style={[
                      styles.unidadeButtonText,
                      unidadeMedida === unidade &&
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
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  limparModalProduto();
                  setModalAdicionarProduto(false);
                }}
              >
                <Ionicons name="close-outline" size={18} color="#fff" />
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={salvarItemDaReceita}
              >
                <Ionicons name="checkmark-outline" size={18} color="#fff" />
                <Text style={styles.modalButtonText}>
                  {indiceItemEdicao === null ? "Adicionar" : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalSelecionarProduto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSelecionarProduto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSelecaoProdutoContent}>
            <Text style={styles.modalSelecaoProdutoTitulo}>
              SELECIONAR PRODUTO
            </Text>

            <View style={styles.buscaProdutoContainer}>
              <TextInput
                style={styles.buscaProdutoInput}
                value={buscaProduto}
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
                    <Text
                      style={styles.produtoOpcaoNome}
                      numberOfLines={1}
                    >
                      {obterNomeProduto(item)}
                    </Text>

                    <Text style={styles.produtoOpcaoEstoque}>
                      Estoque: {formatarNumero(obterQuantidadeEstoque(item))}{" "}
                      {obterUnidadeEstoque(item)}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.botaoFecharSelecao}
              onPress={() => setModalSelecionarProduto(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.botaoFecharSelecaoTexto}>FECHAR</Text>
            </TouchableOpacity>
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
    backgroundColor: "#ebebeb",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    backgroundColor: "#e0e0e0",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 12,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerTextArea: {
    paddingHorizontal: 42,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1a1a1a",
    letterSpacing: 2,
    textAlign: "center",
  },
  searchContainer: {
    minHeight: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  topButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#c8c8c8",
    borderRadius: 8,
    marginBottom: 5,
    overflow: "hidden",
  },
  headerNome: {
    flex: 2,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#b0b0b0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  headerRendimento: {
    flex: 1.4,
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },
  headerCellText: {
    fontWeight: "900",
    color: "#1a1a1a",
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 28,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    overflow: "hidden",
    minHeight: 56,
    alignItems: "center",
  },
  cellNome: {
    flex: 2,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "left",
    fontSize: 13,
  },
  cellRendimento: {
    flex: 1.4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  emptyText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyTextSmall: {
    color: "#555",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  detailsModalContent: {
    width: "92%",
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 1,
  },
  detailsScroll: {
    maxHeight: 470,
  },
  detailsCard: {
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e4",
    gap: 10,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    color: "#333",
  },
  detailValue: {
    flex: 1.3,
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "right",
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  ingredienteDetalhe: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e4",
  },
  ingredienteNome: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1a1a1a",
  },
  ingredienteQuantidade: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginTop: 2,
  },
  modoPreparoTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    lineHeight: 20,
  },
  detailsButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  detailsCloseButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  detailsButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  modalContent: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
  },
  modalContentLarge: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 11,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1a1a1a",
    marginBottom: 5,
    marginLeft: 2,
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#777",
  },
  textArea: {
    minHeight: 130,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 11,
  },
  addProdutoButton: {
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    flexDirection: "row",
    gap: 8,
  },
  addProdutoButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  itensBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 12,
  },
  itensScroll: {
    maxHeight: 210,
  },
  itemReceita: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e4",
  },
  itemReceitaInfo: {
    flex: 1,
  },
  itemReceitaNome: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1a1a1a",
  },
  itemReceitaQuantidade: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginTop: 2,
  },
  itemReceitaAcoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginLeft: 8,
  },
  editItemButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  removeItemButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#c90000",
    alignItems: "center",
    justifyContent: "center",
  },
  seletorProduto: {
    minHeight: 52,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  seletorProdutoTextoArea: {
    flex: 1,
    marginRight: 10,
  },
  seletorProdutoTexto: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  seletorProdutoPlaceholder: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
  },
  seletorProdutoSubtexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginTop: 2,
  },
  modalSelecaoProdutoContent: {
    width: "100%",
    maxHeight: "86%",
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    padding: 18,
  },
  modalSelecaoProdutoTitulo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  buscaProdutoContainer: {
    minHeight: 54,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#c7c7c7",
    borderRadius: 13,
    paddingLeft: 13,
    paddingRight: 7,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  buscaProdutoInput: {
    flex: 1,
    minHeight: 52,
    color: "#111",
    fontSize: 15,
    fontWeight: "600",
  },
  botaoScannerBusca: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  produtoListaVaziaText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  produtoOpcaoSelecao: {
    minHeight: 72,
    backgroundColor: "#fff",
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  produtoOpcaoInfo: {
    flex: 1,
    marginRight: 10,
  },
  produtoOpcaoNome: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },
  produtoOpcaoEstoque: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 5,
  },
  botaoFecharSelecao: {
    minHeight: 52,
    backgroundColor: "#d1d1d1",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoFecharSelecaoTexto: {
    color: "#111",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  unidadeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  unidadeButton: {
    flex: 1,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  unidadeButtonSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  unidadeButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1a1a1a",
  },
  unidadeButtonTextSelected: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#888",
  },
  saveButton: {
    backgroundColor: "#000",
  },
  editButton: {
    backgroundColor: "#000",
  },
  deleteButton: {
    backgroundColor: "#c90000",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
