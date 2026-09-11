import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import DocumentoComercialFormModal from '../../../../components/DocumentoComercialFormModal';
import {
  buscarDocumentoComercialPorId,
  calcularNecessidadesOrcamento,
  DocumentoComercialDatabase,
  DocumentoComercialDetalhado,
  excluirDocumentoComercial,
  formatarMoeda,
  listarOrcamentos,
  NecessidadeOrcamento,
} from '../../application/orcamentosApi';
import { compartilharPdfOrcamento } from '../../../../services/orcamentoPdf';
import { formatDateOnlyBR } from '../../../../core/formatters/date';

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

const COLORS = {
  primary: "#FF3B73",
  primarySoft: "#FFF0F4",
  background: "#FFFDFE",
  surface: "#FFFFFF",
  textPrimary: "#242329",
  textSecondary: "#737178",
  textMuted: "#9B98A0",
  border: "#F1E7EA",
  borderStrong: "#FFD1DD",
  success: "#2D9449",
  warning: "#DF8514",
  danger: "#D93C56",
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
      return (
        <Ionicons
          name="swap-vertical-outline"
          size={13}
          color={COLORS.textSecondary}
        />
      );
    }

    return (
      <Ionicons
        name={ordenacao.direcao === "ASC" ? "chevron-up" : "chevron-down"}
        size={14}
        color={COLORS.primary}
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
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.botaoVoltar} onPress={navigation.goBack}>
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.primary}
            />
          </Pressable>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerTextArea}>
              <Text style={styles.titulo}>Orçamentos</Text>
              <Text style={styles.headerSubtitle}>
                Propostas, valores e necessidades
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buscaContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color={COLORS.primary}
          />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar por cliente ou ID"
            placeholderTextColor={COLORS.textMuted}
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
          {!!busca && (
            <Pressable onPress={() => setBusca("")}>
              <Ionicons
                name="close-circle"
                size={21}
                color={COLORS.textMuted}
              />
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
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={orcamentosOrdenados}
            keyExtractor={(item: DocumentoComercialDatabase) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listaContent}
            ListEmptyComponent={
              <View style={styles.estadoVazio}>
                <View style={styles.estadoVazioIcone}>
                  <Ionicons
                    name="document-text-outline"
                    size={34}
                    color={COLORS.primary}
                  />
                </View>
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
            <View style={styles.modalHandle} />
            <View style={styles.detalhesHeader}>
              <Text style={styles.modalTitulo}>
                ORÇAMENTO #{orcamentoSelecionado?.id ?? ""}
              </Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalDetalhes(false)}
              >
                <Ionicons name="close" size={23} color={COLORS.primary} />
              </Pressable>
            </View>

            {carregandoDetalhes || !orcamentoSelecionado ? (
              <View style={styles.loadingDetalhesContainer}>
                <ActivityIndicator color={COLORS.primary} />
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

                  <View style={styles.infoLinha}>
                    <Text style={styles.infoLabel}>Data da encomenda</Text>
                    <Text style={styles.infoValor}>
                      {formatDateOnlyBR(orcamentoSelecionado.data_encomenda)}
                    </Text>
                  </View>

                  <View style={styles.infoLinha}>
                    <Text style={styles.infoLabel}>Finalidade</Text>
                    <Text style={styles.infoValor} numberOfLines={2}>
                      {orcamentoSelecionado.finalidade || '-'}
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
            <View style={styles.modalHandle} />
            <View style={styles.detalhesHeader}>
              <Text style={styles.modalTitulo}>LISTA DE NECESSIDADES</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={fecharNecessidades}
              >
                <Ionicons name="close" size={23} color={COLORS.primary} />
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
                    color={COLORS.success}
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
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#5A3844",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },
  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },
  headerTextArea: {
    flex: 1,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  buscaContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  buscaInput: {
    flex: 1,
    minHeight: 52,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  botaoNovo: {
    minHeight: 53,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.23,
    shadowRadius: 10,
    elevation: 5,
  },
  botaoNovoTexto: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  cabecalhoLista: {
    minHeight: 43,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFD5E0",
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
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  cabecalhoTextoAtivo: {
    color: COLORS.primary,
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
    minHeight: 68,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#5A3844",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },
  cardLinhaPrincipal: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardCliente: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  cardId: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  cardTexto: {
    fontSize: 10,
    color: COLORS.textSecondary,
    paddingHorizontal: 2,
  },
  cardTotal: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.primary,
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
    backgroundColor: "#FFF5E8",
  },
  statusConvertido: {
    backgroundColor: "#EDF8EE",
  },
  statusConcluido: {
    backgroundColor: "#EDF8EE",
  },
  statusCancelado: {
    backgroundColor: "#FFF0F3",
  },
  statusTexto: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.textPrimary,
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
  estadoVazioIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },
  estadoVazioTitulo: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginTop: 11,
  },
  estadoVazioTexto: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(24, 16, 20, 0.48)",
    justifyContent: "flex-end",
  },
  modalTitulo: {
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    backgroundColor: "#E8DDE1",
    marginTop: 9,
  },
  modalDetalhes: {
    width: "100%",
    height: "91%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  detalhesHeader: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  detalhesScroll: {
    flex: 1,
    minHeight: 0,
  },
  botaoFechar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detalhesContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  infoLinha: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F6EDF0",
  },
  infoLinhaSemBorda: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  infoValor: {
    flex: 1,
    textAlign: "right",
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 12,
  },
  detalhesSecaoTitulo: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 8,
  },
  detalheItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  detalheItemNome: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7,
  },
  detalheItemLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detalheItemTexto: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  detalheItemSubtotal: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  observacoesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: 5,
  },
  observacoesTitulo: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    marginBottom: 5,
  },
  observacoesTexto: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 20,
  },
  totalDetalhesCard: {
    minHeight: 68,
    backgroundColor: "#FFF7F9",
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 11,
  },
  totalDetalhesLabel: {
    color: COLORS.textSecondary,
    fontWeight: "900",
  },
  totalDetalhesValor: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 21,
  },
  detalhesAcoes: {
    minHeight: 45,
    flexShrink: 0,
    gap: 9,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  detalhesAcoesLinha: {
    flexDirection: "row",
    gap: 9,
  },
  detalhesBotao: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  botaoPdf: {
    backgroundColor: "#FF779B",
  },
  botaoNecessidades: {
    backgroundColor: COLORS.primary,
  },
  botaoRealizarVenda: {
    backgroundColor: COLORS.success,
  },
  botaoExcluir: {
    backgroundColor: COLORS.danger,
  },
  botaoEditar: {
    backgroundColor: COLORS.primary,
  },
  detalhesBotaoTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  modalNecessidades: {
    width: "100%",
    height: "90%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  necessidadesResumo: {
    minHeight: 70,
    marginHorizontal: 15,
    marginBottom: 8,
    paddingHorizontal: 18,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#FFF7F9",
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
    backgroundColor: COLORS.borderStrong,
  },
  necessidadeResumoValor: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.primary,
  },
  necessidadeResumoLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  necessidadesAviso: {
    marginHorizontal: 17,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  necessidadeCardFaltante: {
    borderColor: "#FFC8D7",
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
    color: COLORS.textPrimary,
  },
  necessidadeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  necessidadeBadgeOk: {
    backgroundColor: "#EDF8EE",
  },
  necessidadeBadgeFalta: {
    backgroundColor: "#FFF0F3",
  },
  necessidadeBadgeTexto: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
  },
  necessidadeDadoLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  necessidadeDadoValor: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  textoFaltante: {
    color: COLORS.danger,
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
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  necessidadesVazioTexto: {
    marginTop: 5,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  necessidadesRodape: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  botaoFecharNecessidades: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoFecharNecessidadesTexto: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  loadingDetalhesContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
});
