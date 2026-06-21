import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import DocumentoComercialFormModal from "../components/DocumentoComercialFormModal";
import {
  buscarDocumentoComercialPorId,
  calcularNecessidadesOrcamento,
  DocumentoComercialDatabase,
  DocumentoComercialDetalhado,
  excluirDocumentoComercial,
  formatarMoeda,
  listarOrcamentos,
  NecessidadeOrcamento,
} from "../database/database";
import { compartilharPdfOrcamento } from "../services/orcamentoPdf";

type Props = {
  navigation: {
    goBack: () => void;
    addListener?: (evento: string, callback: () => void) => () => void;
  };
};

type CampoOrdenacaoOrcamento =
  | "cliente_nome"
  | "created_at"
  | "valor_total"
  | "status";

type DirecaoOrdenacaoOrcamento = "ASC" | "DESC";

type OrdenacaoOrcamento = {
  campo: CampoOrdenacaoOrcamento;
  direcao: DirecaoOrdenacaoOrcamento;
};

function formatarData(data: string): string {
  if (!data) return "-";

  const normalizada = data.includes("T") ? data : data.replace(" ", "T");
  const objetoData = new Date(normalizada);

  if (Number.isNaN(objetoData.getTime())) {
    return data;
  }

  return objetoData.toLocaleDateString("pt-BR");
}

function obterTimestamp(data: string): number {
  if (!data) return 0;

  const normalizada = data.includes("T") ? data : data.replace(" ", "T");
  const timestamp = new Date(normalizada).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatarQuantidade(valor: number): string {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

function obterTextoStatus(
  status: DocumentoComercialDatabase["status"],
): string {
  switch (status) {
    case "PENDENTE":
      return "Pendente";
    case "CONVERTIDO":
      return "Convertido";
    case "CANCELADA":
      return "Cancelado";
    case "CONCLUIDA":
      return "Concluído";
    default:
      return status;
  }
}

export default function OrcamentosScreen({ navigation }: Props) {
  const [orcamentos, setOrcamentos] = useState<DocumentoComercialDatabase[]>(
    [],
  );
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoOrcamento>({
    campo: "created_at",
    direcao: "DESC",
  });
  const [carregando, setCarregando] = useState(true);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalConversao, setModalConversao] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] =
    useState<DocumentoComercialDetalhado | null>(null);
  const [orcamentoEdicao, setOrcamentoEdicao] =
    useState<DocumentoComercialDetalhado | null>(null);
  const [orcamentoConversao, setOrcamentoConversao] =
    useState<DocumentoComercialDetalhado | null>(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [modalNecessidades, setModalNecessidades] = useState(false);
  const [necessidades, setNecessidades] = useState<NecessidadeOrcamento[]>([]);
  const [carregandoNecessidades, setCarregandoNecessidades] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const carregarOrcamentos = useCallback(async () => {
    try {
      setCarregando(true);
      // A ordenação é aplicada localmente para permitir ordenar também
      // por status sem exigir alteração no database.ts.
      const resultado = await listarOrcamentos(busca, "created_at", "DESC");
      setOrcamentos(resultado);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os orçamentos.",
      );
    } finally {
      setCarregando(false);
    }
  }, [busca]);

  const orcamentosOrdenados = useMemo(() => {
    const multiplicador = ordenacao.direcao === "ASC" ? 1 : -1;

    return [...orcamentos].sort((a, b) => {
      let comparacao = 0;

      switch (ordenacao.campo) {
        case "cliente_nome":
          comparacao = a.cliente_nome.localeCompare(b.cliente_nome, "pt-BR", {
            sensitivity: "base",
          });
          break;
        case "created_at":
          comparacao =
            obterTimestamp(a.created_at) - obterTimestamp(b.created_at);
          break;
        case "valor_total":
          comparacao = Number(a.valor_total) - Number(b.valor_total);
          break;
        case "status":
          comparacao = obterTextoStatus(a.status).localeCompare(
            obterTextoStatus(b.status),
            "pt-BR",
            { sensitivity: "base" },
          );
          break;
      }

      if (comparacao === 0) {
        comparacao = a.id - b.id;
      }

      return comparacao * multiplicador;
    });
  }, [orcamentos, ordenacao]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void carregarOrcamentos();
    }, 250);

    return () => clearTimeout(timeout);
  }, [carregarOrcamentos]);

  useEffect(() => {
    if (!navigation.addListener) return;

    const removerListener = navigation.addListener("focus", () => {
      void carregarOrcamentos();
    });

    return removerListener;
  }, [navigation, carregarOrcamentos]);

  function alternarOrdenacao(campo: CampoOrdenacaoOrcamento) {
    setOrdenacao((ordenacaoAtual) => {
      if (ordenacaoAtual.campo === campo) {
        return {
          campo,
          direcao: ordenacaoAtual.direcao === "ASC" ? "DESC" : "ASC",
        };
      }

      return {
        campo,
        direcao:
          campo === "created_at" || campo === "valor_total" ? "DESC" : "ASC",
      };
    });
  }

  function renderizarIconeOrdenacao(campo: CampoOrdenacaoOrcamento) {
    if (ordenacao.campo !== campo) {
      return <Ionicons name="swap-vertical-outline" size={13} color="#777" />;
    }

    return (
      <Ionicons
        name={ordenacao.direcao === "ASC" ? "chevron-up" : "chevron-down"}
        size={14}
        color="#111"
      />
    );
  }

  function abrirNovoOrcamento() {
    setOrcamentoEdicao(null);
    setModalFormulario(true);
  }

  async function abrirDetalhes(id: number) {
    try {
      setCarregandoDetalhes(true);
      const detalhes = await buscarDocumentoComercialPorId(id);

      if (!detalhes) {
        Alert.alert("Erro", "Orçamento não encontrado.");
        return;
      }

      setOrcamentoSelecionado(detalhes);
      setModalDetalhes(true);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o orçamento.",
      );
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  function abrirEdicao() {
    if (!orcamentoSelecionado) return;

    if (orcamentoSelecionado.status !== "PENDENTE") {
      Alert.alert(
        "Orçamento bloqueado",
        "Somente orçamentos pendentes podem ser editados.",
      );
      return;
    }

    setOrcamentoEdicao(orcamentoSelecionado);
    setModalDetalhes(false);
    setModalFormulario(true);
  }

  function abrirConversaoVenda() {
    if (!orcamentoSelecionado) return;

    if (orcamentoSelecionado.status !== "PENDENTE") {
      Alert.alert(
        "Orçamento bloqueado",
        "Somente orçamentos pendentes podem ser transformados em venda.",
      );
      return;
    }

    setOrcamentoConversao(orcamentoSelecionado);
    setModalDetalhes(false);
    setModalConversao(true);
  }

  async function abrirNecessidades() {
    if (!orcamentoSelecionado) return;

    try {
      setCarregandoNecessidades(true);
      const resultado = await calcularNecessidadesOrcamento(
        orcamentoSelecionado.id,
      );

      setNecessidades(resultado);
      setModalDetalhes(false);
      setModalNecessidades(true);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível calcular as necessidades do orçamento.",
      );
    } finally {
      setCarregandoNecessidades(false);
    }
  }

  function fecharNecessidades() {
    setModalNecessidades(false);
    setModalDetalhes(true);
  }

  async function compartilharPdf() {
    if (!orcamentoSelecionado || gerandoPdf) return;

    try {
      setGerandoPdf(true);
      await compartilharPdfOrcamento(orcamentoSelecionado);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível gerar ou compartilhar o PDF.",
      );
    } finally {
      setGerandoPdf(false);
    }
  }

  function confirmarExclusao() {
    if (!orcamentoSelecionado) return;

    if (orcamentoSelecionado.status !== "PENDENTE") {
      Alert.alert(
        "Orçamento bloqueado",
        "Somente orçamentos pendentes podem ser excluídos.",
      );
      return;
    }

    Alert.alert(
      "Excluir orçamento",
      `Deseja excluir o orçamento #${orcamentoSelecionado.id}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => void excluirOrcamento(),
        },
      ],
    );
  }

  async function excluirOrcamento() {
    if (!orcamentoSelecionado) return;

    try {
      await excluirDocumentoComercial(orcamentoSelecionado.id);
      setModalDetalhes(false);
      setOrcamentoSelecionado(null);
      await carregarOrcamentos();
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o orçamento.",
      );
    }
  }

  async function aposSalvar() {
    setOrcamentoSelecionado(null);
    setOrcamentoEdicao(null);
    await carregarOrcamentos();
  }

  async function aposConverterVenda() {
    setModalConversao(false);
    setOrcamentoSelecionado(null);
    setOrcamentoConversao(null);
    await carregarOrcamentos();

    Alert.alert(
      "Venda realizada",
      "O orçamento foi transformado em venda com sucesso.",
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.botaoVoltar} onPress={navigation.goBack}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.titulo}>ORÇAMENTOS</Text>
          <View style={styles.espacoHeader} />
        </View>

        <View style={styles.buscaContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar por cliente ou ID"
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
          {!!busca && (
            <Pressable onPress={() => setBusca("")}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.botaoNovo} onPress={abrirNovoOrcamento}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.botaoNovoTexto}>Novo Orçamento</Text>
        </Pressable>

        <View style={styles.cabecalhoLista}>
          <Pressable
            style={[styles.cabecalhoOrdenavel, styles.colunaCliente]}
            onPress={() => alternarOrdenacao("cliente_nome")}
          >
            <Text
              style={[
                styles.cabecalhoTexto,
                ordenacao.campo === "cliente_nome" &&
                  styles.cabecalhoTextoAtivo,
              ]}
            >
              CLIENTE
            </Text>
            {renderizarIconeOrdenacao("cliente_nome")}
          </Pressable>

          <Pressable
            style={[
              styles.cabecalhoOrdenavel,
              styles.cabecalhoCentralizado,
              styles.colunaData,
            ]}
            onPress={() => alternarOrdenacao("created_at")}
          >
            <Text
              style={[
                styles.cabecalhoTexto,
                ordenacao.campo === "created_at" && styles.cabecalhoTextoAtivo,
              ]}
            >
              DATA
            </Text>
            {renderizarIconeOrdenacao("created_at")}
          </Pressable>

          <Pressable
            style={[
              styles.cabecalhoOrdenavel,
              styles.cabecalhoDireita,
              styles.colunaTotal,
            ]}
            onPress={() => alternarOrdenacao("valor_total")}
          >
            <Text
              style={[
                styles.cabecalhoTexto,
                ordenacao.campo === "valor_total" && styles.cabecalhoTextoAtivo,
              ]}
            >
              VALOR
            </Text>
            {renderizarIconeOrdenacao("valor_total")}
          </Pressable>

          <Pressable
            style={[
              styles.cabecalhoOrdenavel,
              styles.cabecalhoDireita,
              styles.colunaStatus,
            ]}
            onPress={() => alternarOrdenacao("status")}
          >
            <Text
              style={[
                styles.cabecalhoTexto,
                ordenacao.campo === "status" && styles.cabecalhoTextoAtivo,
              ]}
            >
              STATUS
            </Text>
            {renderizarIconeOrdenacao("status")}
          </Pressable>
        </View>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#111" />
          </View>
        ) : (
          <FlatList
            data={orcamentosOrdenados}
            keyExtractor={(item: DocumentoComercialDatabase) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listaContent}
            ListEmptyComponent={
              <View style={styles.estadoVazio}>
                <Ionicons name="document-text-outline" size={48} color="#777" />
                <Text style={styles.estadoVazioTitulo}>
                  Nenhum orçamento encontrado
                </Text>
                <Text style={styles.estadoVazioTexto}>
                  Cadastre um novo orçamento para começar.
                </Text>
              </View>
            }
            renderItem={({ item }: { item: DocumentoComercialDatabase }) => (
              <Pressable
                style={styles.card}
                onPress={() => void abrirDetalhes(item.id)}
              >
                <View style={styles.cardLinhaPrincipal}>
                  <View style={styles.colunaCliente}>
                    <Text style={styles.cardCliente} numberOfLines={1}>
                      {item.cliente_nome}
                    </Text>
                    <Text style={styles.cardId}>#{item.id}</Text>
                  </View>

                  <Text
                    style={[
                      styles.cardTexto,
                      styles.colunaData,
                      styles.textoCentralizado,
                    ]}
                    numberOfLines={1}
                  >
                    {formatarData(item.created_at)}
                  </Text>

                  <Text
                    style={[
                      styles.cardTotal,
                      styles.colunaTotal,
                      styles.textoDireita,
                    ]}
                    numberOfLines={1}
                  >
                    {formatarMoeda(item.valor_total)}
                  </Text>

                  <View style={[styles.colunaStatus, styles.statusColuna]}>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === "PENDENTE"
                          ? styles.statusPendente
                          : item.status === "CONVERTIDO"
                            ? styles.statusConvertido
                            : item.status === "CONCLUIDA"
                              ? styles.statusConcluido
                              : styles.statusCancelado,
                      ]}
                    >
                      <Text style={styles.statusTexto} numberOfLines={1}>
                        {obterTextoStatus(item.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      <Modal
        visible={modalDetalhes}
        transparent
        animationType="fade"
        onRequestClose={() => setModalDetalhes(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDetalhes}>
            <View style={styles.detalhesHeader}>
              <Text style={styles.modalTitulo}>
                ORÇAMENTO #{orcamentoSelecionado?.id ?? ""}
              </Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalDetalhes(false)}
              >
                <Ionicons name="close" size={23} color="#111" />
              </Pressable>
            </View>

            {carregandoDetalhes || !orcamentoSelecionado ? (
              <View style={styles.loadingDetalhesContainer}>
                <ActivityIndicator color="#111" />
              </View>
            ) : (
              <ScrollView
                style={styles.detalhesScroll}
                contentContainerStyle={styles.detalhesContent}
                showsVerticalScrollIndicator
                nestedScrollEnabled
              >
                <View style={styles.infoCard}>
                  <View style={styles.infoLinha}>
                    <Text style={styles.infoLabel}>Cliente</Text>
                    <Text style={styles.infoValor} numberOfLines={2}>
                      {orcamentoSelecionado.cliente_nome}
                    </Text>
                  </View>

                  <View style={styles.infoLinha}>
                    <Text style={styles.infoLabel}>Data</Text>
                    <Text style={styles.infoValor}>
                      {formatarData(orcamentoSelecionado.created_at)}
                    </Text>
                  </View>

                  <View style={styles.infoLinha}>
                    <Text style={styles.infoLabel}>Validade</Text>
                    <Text style={styles.infoValor}>
                      {orcamentoSelecionado.data_validade || "-"}
                    </Text>
                  </View>

                  <View style={styles.infoLinhaSemBorda}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={styles.infoValor}>
                      {obterTextoStatus(orcamentoSelecionado.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detalhesSecaoTitulo}>ITENS</Text>

                {orcamentoSelecionado.itens.map((item) => (
                  <View key={String(item.id)} style={styles.detalheItemCard}>
                    <Text style={styles.detalheItemNome} numberOfLines={2}>
                      {item.produto_nome}
                    </Text>

                    <View style={styles.detalheItemLinha}>
                      <Text style={styles.detalheItemTexto}>
                        {item.quantidade} × {formatarMoeda(item.valor_unitario)}
                      </Text>
                      <Text style={styles.detalheItemSubtotal}>
                        {formatarMoeda(item.subtotal)}
                      </Text>
                    </View>
                  </View>
                ))}

                {!!orcamentoSelecionado.observacoes && (
                  <View style={styles.observacoesCard}>
                    <Text style={styles.observacoesTitulo}>Observações</Text>
                    <Text style={styles.observacoesTexto}>
                      {orcamentoSelecionado.observacoes}
                    </Text>
                  </View>
                )}

                <View style={styles.totalDetalhesCard}>
                  <Text style={styles.totalDetalhesLabel}>TOTAL</Text>
                  <Text style={styles.totalDetalhesValor}>
                    {formatarMoeda(orcamentoSelecionado.valor_total)}
                  </Text>
                </View>
              </ScrollView>
            )}

            {!!orcamentoSelecionado && (
              <View style={styles.detalhesAcoes}>
                <View style={styles.detalhesAcoesLinha}>
                  <Pressable
                    style={[styles.detalhesBotao, styles.botaoPdf]}
                    onPress={() => void compartilharPdf()}
                    disabled={gerandoPdf}
                  >
                    {gerandoPdf ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons
                        name="share-social-outline"
                        size={19}
                        color="#fff"
                      />
                    )}
                    <Text style={styles.detalhesBotaoTexto}>
                      {gerandoPdf ? "Gerando..." : "Compartilhar PDF"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.detalhesBotao, styles.botaoNecessidades]}
                    onPress={() => void abrirNecessidades()}
                    disabled={carregandoNecessidades}
                  >
                    {carregandoNecessidades ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="list-outline" size={20} color="#fff" />
                    )}
                    <Text style={styles.detalhesBotaoTexto}>Necessidades</Text>
                  </Pressable>
                </View>

                {orcamentoSelecionado.status === "PENDENTE" && (
                  <>
                    <Pressable
                      style={[styles.detalhesBotao, styles.botaoRealizarVenda]}
                      onPress={abrirConversaoVenda}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={21}
                        color="#fff"
                      />
                      <Text style={styles.detalhesBotaoTexto}>
                        Realizar Venda
                      </Text>
                    </Pressable>

                    <View style={styles.detalhesAcoesLinha}>
                      <Pressable
                        style={[styles.detalhesBotao, styles.botaoExcluir]}
                        onPress={confirmarExclusao}
                      >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                        <Text style={styles.detalhesBotaoTexto}>Excluir</Text>
                      </Pressable>

                      <Pressable
                        style={[styles.detalhesBotao, styles.botaoEditar]}
                        onPress={abrirEdicao}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.detalhesBotaoTexto}>Editar</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalNecessidades}
        transparent
        animationType="fade"
        onRequestClose={fecharNecessidades}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalNecessidades}>
            <View style={styles.detalhesHeader}>
              <Text style={styles.modalTitulo}>LISTA DE NECESSIDADES</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={fecharNecessidades}
              >
                <Ionicons name="close" size={23} color="#111" />
              </Pressable>
            </View>

            <View style={styles.necessidadesResumo}>
              <View style={styles.necessidadeResumoItem}>
                <Text style={styles.necessidadeResumoValor}>
                  {necessidades.length}
                </Text>
                <Text style={styles.necessidadeResumoLabel}>Itens</Text>
              </View>

              <View style={styles.necessidadeResumoDivisor} />

              <View style={styles.necessidadeResumoItem}>
                <Text
                  style={[styles.necessidadeResumoValor, styles.textoFaltante]}
                >
                  {
                    necessidades.filter((item) => !item.estoque_suficiente)
                      .length
                  }
                </Text>
                <Text style={styles.necessidadeResumoLabel}>Em falta</Text>
              </View>
            </View>

            <Text style={styles.necessidadesAviso}>
              Esta consulta não movimenta o estoque.
            </Text>

            <FlatList
              data={necessidades}
              keyExtractor={(item: NecessidadeOrcamento) =>
                String(item.produto_id)
              }
              style={styles.necessidadesLista}
              contentContainerStyle={styles.necessidadesListaContent}
              showsVerticalScrollIndicator
              ListEmptyComponent={
                <View style={styles.necessidadesVazio}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={42}
                    color="#2e7d32"
                  />
                  <Text style={styles.necessidadesVazioTitulo}>
                    Nenhuma necessidade encontrada
                  </Text>
                  <Text style={styles.necessidadesVazioTexto}>
                    Verifique se os produtos do orçamento possuem composição
                    cadastrada.
                  </Text>
                </View>
              }
              renderItem={({ item }: { item: NecessidadeOrcamento }) => (
                <View
                  style={[
                    styles.necessidadeCard,
                    !item.estoque_suficiente && styles.necessidadeCardFaltante,
                  ]}
                >
                  <View style={styles.necessidadeCardHeader}>
                    <Text style={styles.necessidadeNome} numberOfLines={2}>
                      {item.produto_nome}
                    </Text>
                    <View
                      style={[
                        styles.necessidadeBadge,
                        item.estoque_suficiente
                          ? styles.necessidadeBadgeOk
                          : styles.necessidadeBadgeFalta,
                      ]}
                    >
                      <Text style={styles.necessidadeBadgeTexto}>
                        {item.estoque_suficiente ? "SUFICIENTE" : "EM FALTA"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.necessidadeGrid}>
                    <View style={styles.necessidadeDado}>
                      <Text style={styles.necessidadeDadoLabel}>
                        Necessário
                      </Text>
                      <Text style={styles.necessidadeDadoValor}>
                        {formatarQuantidade(item.quantidade_necessaria)}{" "}
                        {item.unidade_medida}
                      </Text>
                    </View>

                    <View style={styles.necessidadeDado}>
                      <Text style={styles.necessidadeDadoLabel}>
                        Em estoque
                      </Text>
                      <Text style={styles.necessidadeDadoValor}>
                        {formatarQuantidade(item.quantidade_estoque)}{" "}
                        {item.unidade_medida}
                      </Text>
                    </View>

                    <View style={styles.necessidadeDado}>
                      <Text style={styles.necessidadeDadoLabel}>Faltante</Text>
                      <Text
                        style={[
                          styles.necessidadeDadoValor,
                          !item.estoque_suficiente && styles.textoFaltante,
                        ]}
                      >
                        {formatarQuantidade(item.quantidade_faltante)}{" "}
                        {item.unidade_medida}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />

            <View style={styles.necessidadesRodape}>
              <Pressable
                style={styles.botaoFecharNecessidades}
                onPress={fecharNecessidades}
              >
                <Text style={styles.botaoFecharNecessidadesTexto}>
                  Voltar ao orçamento
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <DocumentoComercialFormModal
        visible={modalFormulario}
        tipo="ORCAMENTO"
        documentoEdicao={orcamentoEdicao}
        onClose={() => {
          setModalFormulario(false);
          setOrcamentoEdicao(null);
        }}
        onSaved={aposSalvar}
      />

      <DocumentoComercialFormModal
        visible={modalConversao}
        tipo="VENDA"
        documentoOrigem={orcamentoConversao}
        onClose={() => {
          setModalConversao(false);
          setOrcamentoConversao(null);
        }}
        onSaved={aposConverterVenda}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ebebeb",
  },
  container: {
    flex: 1,
    backgroundColor: "#ebebeb",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    height: 58,
    backgroundColor: "#d7d7d7",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  espacoHeader: {
    width: 40,
  },
  buscaContainer: {
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 13,
    marginBottom: 11,
  },
  buscaInput: {
    flex: 1,
    height: "100%",
    color: "#111",
    fontSize: 15,
  },
  botaoNovo: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  botaoNovoTexto: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  cabecalhoLista: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "#d2d2d2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  cabecalhoOrdenavel: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  cabecalhoCentralizado: {
    justifyContent: "center",
  },
  cabecalhoDireita: {
    justifyContent: "flex-end",
  },
  cabecalhoTexto: {
    fontSize: 10,
    fontWeight: "800",
    color: "#555",
  },
  cabecalhoTextoAtivo: {
    color: "#111",
    fontWeight: "900",
  },
  colunaCliente: {
    flex: 1.4,
    minWidth: 0,
  },
  colunaData: {
    flex: 0.9,
    minWidth: 0,
  },
  colunaTotal: {
    flex: 1,
    minWidth: 0,
  },
  colunaStatus: {
    flex: 1,
    minWidth: 0,
  },
  textoCentralizado: {
    textAlign: "center",
  },
  textoDireita: {
    textAlign: "right",
  },
  listaContent: {
    paddingBottom: 35,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 13,
    marginBottom: 9,
  },
  cardLinhaPrincipal: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardCliente: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
  },
  cardId: {
    fontSize: 10,
    color: "#777",
    marginTop: 3,
  },
  cardTexto: {
    fontSize: 10,
    color: "#555",
    paddingHorizontal: 2,
  },
  cardTotal: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111",
    paddingHorizontal: 2,
  },
  statusColuna: {
    alignItems: "flex-end",
    paddingLeft: 4,
  },
  statusBadge: {
    maxWidth: "100%",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPendente: {
    backgroundColor: "#fff0bf",
  },
  statusConvertido: {
    backgroundColor: "#d9ead3",
  },
  statusConcluido: {
    backgroundColor: "#d9ead3",
  },
  statusCancelado: {
    backgroundColor: "#f4cccc",
  },
  statusTexto: {
    fontSize: 9,
    fontWeight: "800",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  estadoVazio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  estadoVazioTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
    marginTop: 11,
  },
  estadoVazioTexto: {
    textAlign: "center",
    color: "#777",
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
    justifyContent: "center",
    padding: 18,
  },
  modalTitulo: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
    color: "#111",
    marginBottom: 13,
  },
  modalDetalhes: {
    display: "flex",
    width: "100%",
    height: "94%",
    maxHeight: 700,
    backgroundColor: "#ebebeb",
    borderRadius: 22,
    overflow: "hidden",
  },
  detalhesHeader: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    flexShrink: 0,
  },
  detalhesScroll: {
    flex: 1,
    minHeight: 0,
    maxHeight:'62%',
  },
  botaoFechar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#d4d4d4",
    alignItems: "center",
    justifyContent: "center",
  },
  detalhesContent: {
    paddingHorizontal: 15,
    paddingBottom: 18,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  infoLinha: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ededed",
  },
  infoLinhaSemBorda: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: "#666",
    fontWeight: "600",
  },
  infoValor: {
    flex: 1,
    textAlign: "right",
    color: "#111",
    fontWeight: "800",
    marginLeft: 12,
  },
  detalhesSecaoTitulo: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  detalheItemCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
  },
  detalheItemNome: {
    color: "#111",
    fontWeight: "800",
    marginBottom: 7,
  },
  detalheItemLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detalheItemTexto: {
    color: "#666",
  },
  detalheItemSubtotal: {
    color: "#111",
    fontWeight: "800",
  },
  observacoesCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 13,
    marginTop: 5,
  },
  observacoesTitulo: {
    color: "#111",
    fontWeight: "800",
    marginBottom: 5,
  },
  observacoesTexto: {
    color: "#555",
    lineHeight: 20,
  },
  totalDetalhesCard: {
    minHeight: 68,
    backgroundColor: "#111",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 11,
  },
  totalDetalhesLabel: {
    color: "#fff",
    fontWeight: "800",
  },
  totalDetalhesValor: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 21,
  },
  detalhesAcoes: {
    flexShrink: 0,
    gap: 9,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#d1d1d1",
    backgroundColor: "#ebebeb",
  },
  detalhesAcoesLinha: {
    flexDirection: "row",
    gap: 9,
  },
  detalhesBotao: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  botaoPdf: {
    backgroundColor: "#444",
  },
  botaoNecessidades: {
    backgroundColor: "#1565c0",
  },
  botaoRealizarVenda: {
    backgroundColor: "#2e7d32",
  },
  botaoExcluir: {
    backgroundColor: "#c62828",
  },
  botaoEditar: {
    backgroundColor: "#111",
  },
  detalhesBotaoTexto: {
    color: "#fff",
    fontWeight: "800",
  },
  modalNecessidades: {
    width: "100%",
    height: "88%",
    maxHeight: 720,
    backgroundColor: "#ebebeb",
    borderRadius: 22,
    overflow: "hidden",
  },
  necessidadesResumo: {
    minHeight: 70,
    marginHorizontal: 15,
    marginBottom: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  necessidadeResumoItem: {
    flex: 1,
    alignItems: "center",
  },
  necessidadeResumoDivisor: {
    width: 1,
    height: 38,
    backgroundColor: "#dddddd",
  },
  necessidadeResumoValor: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111",
  },
  necessidadeResumoLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },
  necessidadesAviso: {
    marginHorizontal: 17,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },
  necessidadesLista: {
    flex: 1,
    minHeight: 0,
  },
  necessidadesListaContent: {
    paddingHorizontal: 15,
    paddingBottom: 14,
  },
  necessidadeCard: {
    padding: 13,
    marginBottom: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dddddd",
    backgroundColor: "#fff",
  },
  necessidadeCardFaltante: {
    borderColor: "#ef9a9a",
  },
  necessidadeCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  necessidadeNome: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
  },
  necessidadeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  necessidadeBadgeOk: {
    backgroundColor: "#d9ead3",
  },
  necessidadeBadgeFalta: {
    backgroundColor: "#f4cccc",
  },
  necessidadeBadgeTexto: {
    fontSize: 9,
    fontWeight: "900",
    color: "#333",
  },
  necessidadeGrid: {
    flexDirection: "row",
    gap: 7,
  },
  necessidadeDado: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
  },
  necessidadeDadoLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#777",
    textTransform: "uppercase",
  },
  necessidadeDadoValor: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
  },
  textoFaltante: {
    color: "#c62828",
  },
  necessidadesVazio: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  necessidadesVazioTitulo: {
    marginTop: 9,
    fontSize: 15,
    fontWeight: "900",
    color: "#222",
    textAlign: "center",
  },
  necessidadesVazioTexto: {
    marginTop: 5,
    color: "#666",
    textAlign: "center",
  },
  necessidadesRodape: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: "#d1d1d1",
  },
  botaoFecharNecessidades: {
    minHeight: 47,
    borderRadius: 13,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoFecharNecessidadesTexto: {
    color: "#fff",
    fontWeight: "900",
  },
  loadingDetalhesContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
});
