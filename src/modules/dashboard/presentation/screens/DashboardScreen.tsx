import React, {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../app/navigation/types';
import { useAuth } from '../../../auth/presentation/useAuth';
import type {
  DashboardContaReceber,
  DashboardEstoqueCritico,
  DashboardProdutoMaisVendido,
  DashboardVendaRecente,
} from '../../domain/models/Dashboard';
import { useDashboard } from '../hooks/useDashboard';
import DashboardBottomNavigation from '../components/DashboardBottomNavigation';
import MonthCalendar from '../../../../shared/components/MonthCalendar';
import { formatDateOnlyBR } from '../../../../core/formatters';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Dashboard'
>;

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  textMuted: '#9B98A0',
  border: '#F1E7EA',
  success: '#29A84A',
  warning: '#F28C18',
};

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarHorario(data: string) {
  const valor = new Date(
    data.includes('T')
      ? data
      : data.replace(' ', 'T')
  );

  if (Number.isNaN(valor.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(valor);
}

function statusVenda(status: string) {
  if (status === 'CONCLUIDA') {
    return {
      label: 'Concluída',
      color: '#299447',
      background: '#EDF8EE',
    };
  }

  if (status === 'CANCELADA') {
    return {
      label: 'Cancelada',
      color: '#D93C56',
      background: '#FFF0F3',
    };
  }

  return {
    label: 'Pendente',
    color: '#DF8514',
    background: '#FFF5E8',
  };
}

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  onPress,
}: SummaryCardProps) {
  return (
    <TouchableOpacity
      style={styles.summaryCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.78 : 1}
    >
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={27}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.summaryContent}>
        <Text style={styles.summaryLabel}>
          {title}
        </Text>

        <Text
          style={styles.summaryValue}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>

        <Text style={styles.summarySubtitle}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({
  navigation,
}: Props) {
  const { logout } = useAuth();
  const {
    dados,
    carregando,
    atualizando,
    erro,
    carregar,
  } = useDashboard();

  useEffect(() => {
    carregar();
  }, [carregar]);

  useFocusEffect(
    useCallback(() => {
      carregar(true);
    }, [carregar])
  );

  const maiorVendaSemana = useMemo(() => {
    return Math.max(
      1,
      ...(dados?.vendasSemana.map(
        (item) => item.total
      ) ?? [1])
    );
  }, [dados]);

  const handleLogout = async () => {
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
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (carregando && !dados) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Carregando seu painel...
        </Text>
      </View>
    );
  }

  if (erro && !dados) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.primary}
        />

        <Text style={styles.errorTitle}>
          Não foi possível carregar o painel
        </Text>

        <Text style={styles.errorText}>
          {erro}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => carregar()}
        >
          <Text style={styles.retryText}>
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dados) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.decorationLarge} />
        <View style={styles.decorationSmall} />

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Olá, Confeiteira! 👋
            </Text>

            <Text style={styles.headerSubtitle}>
              Aqui está o resumo do seu negócio hoje.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() =>
              navigation.navigate('Estoque')
            }
            activeOpacity={0.75}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.primary}
            />

            {dados.resumo.produtosEstoqueBaixo >
              0 && (
              <View style={styles.notificationBadge}>
                <Text
                  style={styles.notificationBadgeText}
                >
                  {Math.min(
                    dados.resumo.produtosEstoqueBaixo,
                    99
                  )}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Vendas hoje"
            value={formatarMoeda(
              dados.resumo.vendasHoje
            )}
            subtitle="Vendas concluídas"
            icon="bag-handle-outline"
            onPress={() =>
              navigation.navigate('Vendas')
            }
          />

          <SummaryCard
            title="Vendas no mês"
            value={formatarMoeda(
              dados.resumo.vendasMes
            )}
            subtitle="Total do mês atual"
            icon="calendar-outline"
            onPress={() =>
              navigation.navigate('Relatorios')
            }
          />

          <SummaryCard
            title="Pedidos hoje"
            value={String(
              dados.resumo.quantidadeVendasHoje
            )}
            subtitle="Concluídos no dia"
            icon="clipboard-outline"
            onPress={() =>
              navigation.navigate('Vendas')
            }
          />

          <SummaryCard
            title="Ticket médio"
            value={formatarMoeda(
              dados.resumo.ticketMedioHoje
            )}
            subtitle="Média por venda"
            icon="cash-outline"
            onPress={() =>
              navigation.navigate('Relatorios')
            }
          />

          <SummaryCard
            title="Clientes"
            value={String(
              dados.resumo.clientesCadastrados
            )}
            subtitle="Cadastrados"
            icon="person-add-outline"
            onPress={() =>
              navigation.navigate('Clientes')
            }
          />

          <SummaryCard
            title="A receber"
            value={formatarMoeda(
              dados.resumo.valorContasReceber
            )}
            subtitle={`${dados.resumo.quantidadeContasReceber} conta(s) pendente(s)`}
            icon="wallet-outline"
            onPress={() =>
              navigation.navigate('ContasReceber')
            }
          />
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Agenda de encomendas</Text>
              <Text style={styles.cardSubtitle}>Os pontos indicam dias com pedidos</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Agenda')}>
              <Text style={styles.linkText}>Abrir agenda</Text>
            </TouchableOpacity>
          </View>

          <MonthCalendar
            markedDates={dados.datasEncomendas}
            onSelectDate={(dataSelecionada) =>
              navigation.navigate('Agenda', { dataSelecionada })
            }
          />
        </View>

        <View style={styles.receivablesCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Contas a receber</Text>
              <Text style={styles.cardSubtitle}>Saldos das vendas confirmadas</Text>
            </View>
            <View style={styles.receivablesTotalBadge}>
              <Text style={styles.receivablesTotalText}>
                {formatarMoeda(dados.resumo.valorContasReceber)}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ContasReceber')} style={{ paddingVertical: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '800' }}>Gerenciar contas a receber →</Text>
          </TouchableOpacity>
          {dados.contasReceber.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma conta pendente.</Text>
          ) : (
            dados.contasReceber.map((conta: DashboardContaReceber) => (
              <TouchableOpacity
                key={conta.id}
                style={styles.receivableRow}
                onPress={() => navigation.navigate('ContasReceber')}
                activeOpacity={0.78}
              >
                <View style={styles.rowIcon}>
                  <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{conta.clienteNome}</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {conta.descricao} · {formatDateOnlyBR(conta.dataVencimento)}
                  </Text>
                </View>
                <Text style={styles.receivableValue}>{formatarMoeda(conta.valorPendente)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Vendas dos últimos 7 dias
              </Text>

              <Text style={styles.cardSubtitle}>
                Valores de vendas concluídas
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Relatorios')
              }
            >
              <Text style={styles.linkText}>
                Ver relatório
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chart}>
            {dados.vendasSemana.map((item) => {
              const altura =
                item.total <= 0
                  ? 5
                  : Math.max(
                      16,
                      (item.total /
                        maiorVendaSemana) *
                        105
                    );

              return (
                <View
                  key={item.data}
                  style={styles.chartColumn}
                >
                  <Text
                    style={styles.chartValue}
                    numberOfLines={1}
                  >
                    {item.total > 0
                      ? formatarMoeda(item.total)
                      : '—'}
                  </Text>

                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: altura,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.chartLabel}>
                    {item.rotulo}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.shortcutsGrid}>
          <TouchableOpacity
            style={styles.shortcut}
            onPress={() =>
              navigation.navigate('Estoque')
            }
          >
            <View style={styles.shortcutIcon}>
              <Ionicons
                name="cube-outline"
                size={25}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.shortcutTitle}>
              Estoque
            </Text>

            <Text style={styles.shortcutText}>
              Gerencie seus produtos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcut}
            onPress={() =>
              navigation.navigate('Compras')
            }
          >
            <View style={styles.shortcutIcon}>
              <Ionicons
                name="cart-outline"
                size={25}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.shortcutTitle}>
              Compras
            </Text>

            <Text style={styles.shortcutText}>
              Controle suas entradas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcut}
            onPress={() =>
              navigation.navigate('Orcamentos')
            }
          >
            <View style={styles.shortcutIcon}>
              <Ionicons
                name="document-text-outline"
                size={25}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.shortcutTitle}>
              Orçamentos
            </Text>

            <Text style={styles.shortcutText}>
              {dados.resumo.orcamentosPendentes}{' '}
              pendentes
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.twoColumnSection}>
          <View style={styles.listCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Vendas recentes
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Vendas')
                }
              >
                <Text style={styles.linkText}>
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>

            {dados.vendasRecentes.length === 0 ? (
              <Text style={styles.emptyText}>
                Nenhuma venda registrada.
              </Text>
            ) : (
              dados.vendasRecentes.map(
                (
                  venda: DashboardVendaRecente
                ) => {
                  const status =
                    statusVenda(venda.status);

                  return (
                    <TouchableOpacity
                      key={venda.id}
                      style={styles.listRow}
                      onPress={() =>
                        navigation.navigate('Vendas')
                      }
                    >
                      <View style={styles.rowIcon}>
                        <Ionicons
                          name="receipt-outline"
                          size={20}
                          color={COLORS.primary}
                        />
                      </View>

                      <View style={styles.rowContent}>
                        <Text
                          style={styles.rowTitle}
                          numberOfLines={1}
                        >
                          Venda #{venda.id}
                        </Text>

                        <Text
                          style={styles.rowSubtitle}
                          numberOfLines={1}
                        >
                          {venda.clienteNome ||
                            'Cliente não informado'}
                        </Text>
                      </View>

                      <View style={styles.rowRight}>
                        <Text style={styles.rowValue}>
                          {formatarMoeda(
                            venda.valorTotal
                          )}
                        </Text>

                        <Text style={styles.rowTime}>
                          {formatarHorario(
                            venda.createdAt
                          )}
                        </Text>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                status.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: status.color,
                              },
                            ]}
                          >
                            {status.label}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }
              )
            )}
          </View>

          <View style={styles.listCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Mais vendidos
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    'ProdutosVenda'
                  )
                }
              >
                <Text style={styles.linkText}>
                  Ver produtos
                </Text>
              </TouchableOpacity>
            </View>

            {dados.produtosMaisVendidos.length ===
            0 ? (
              <Text style={styles.emptyText}>
                Ainda não há dados de vendas.
              </Text>
            ) : (
              dados.produtosMaisVendidos.map(
                (
                  produto:
                    DashboardProdutoMaisVendido,
                  index
                ) => (
                  <TouchableOpacity
                    key={produto.produtoId}
                    style={styles.rankingRow}
                    onPress={() =>
                      navigation.navigate(
                        'ProdutosVenda'
                      )
                    }
                  >
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankText}>
                        {index + 1}
                      </Text>
                    </View>

                    <View style={styles.rankingIcon}>
                      <Ionicons
                        name="restaurant-outline"
                        size={21}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.rowContent}>
                      <Text
                        style={styles.rowTitle}
                        numberOfLines={2}
                      >
                        {produto.produtoNome}
                      </Text>

                      <Text style={styles.rowSubtitle}>
                        {produto.quantidade}{' '}
                        vendidos
                      </Text>
                    </View>

                    <Text style={styles.rankingValue}>
                      {formatarMoeda(
                        produto.valorTotal
                      )}
                    </Text>
                  </TouchableOpacity>
                )
              )
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.stockAlert}
          onPress={() =>
            navigation.navigate('Estoque')
          }
          activeOpacity={0.78}
        >
          <View style={styles.stockAlertIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.stockAlertContent}>
            <Text style={styles.stockAlertTitle}>
              Alertas de estoque
            </Text>

            <Text style={styles.stockAlertText}>
              {dados.resumo.produtosEstoqueBaixo ===
              0
                ? 'Nenhum produto em nível crítico'
                : `${dados.resumo.produtosEstoqueBaixo} produto(s) com estoque baixo`}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        {dados.estoqueCritico.length > 0 && (
          <View style={styles.criticalCard}>
            <Text style={styles.cardTitle}>
              Itens que precisam de atenção
            </Text>

            {dados.estoqueCritico.map(
              (
                item: DashboardEstoqueCritico
              ) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.criticalRow}
                  onPress={() =>
                    navigation.navigate('Estoque')
                  }
                >
                  <Text
                    style={styles.criticalName}
                    numberOfLines={1}
                  >
                    {item.nome}
                  </Text>

                  <Text style={styles.criticalValue}>
                    {item.quantidade}{' '}
                    {item.unidadeMedida}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </ScrollView>

      <DashboardBottomNavigation
        onInicio={() => carregar(true)}
        onVendas={() =>
          navigation.navigate('Vendas')
        }
        onMenu={() =>
          navigation.navigate('Menu')
        }
        onRelatorios={() =>
          navigation.navigate('Relatorios')
        }
        onSair={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 28,
    overflow: 'hidden',
  },

  decorationLarge: {
    position: 'absolute',
    top: -115,
    left: -105,
    width: 400,
    height: 260,
    borderRadius: 210,
    backgroundColor: '#FFDCE7',
    opacity: 0.65,
    transform: [
      {
        rotate: '-10deg',
      },
    ],
  },

  decorationSmall: {
    position: 'absolute',
    top: 0,
    left: -120,
    width: 330,
    height: 160,
    borderRadius: 170,
    backgroundColor: '#FFF0F4',
    opacity: 0.95,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
  },

  greeting: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  notificationButton: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#FFC7D6',
  },

  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -5,
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  summaryCard: {
    width: '48.3%',
    minHeight: 122,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 13,
    shadowColor: '#6A3C4C',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },

  summaryContent: {
    flex: 1,
  },

  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },

  summarySubtitle: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 5,
  },

  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 3,
    marginBottom: 14,
  },

  calendarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 3,
    marginBottom: 14,
  },

  receivablesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },

  receivablesTotalBadge: {
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  receivablesTotalText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  receivableRow: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F7EEF1',
    paddingVertical: 10,
  },

  receivableValue: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },

  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  linkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  chart: {
    height: 155,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },

  chartValue: {
    width: '100%',
    color: COLORS.textMuted,
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 4,
  },

  chartTrack: {
    width: 18,
    height: 110,
    justifyContent: 'flex-end',
    backgroundColor: '#FFF4F7',
    borderRadius: 9,
    overflow: 'hidden',
  },

  chartBar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 9,
  },

  chartLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 7,
  },

  shortcutsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  shortcut: {
    width: '31.7%',
    minHeight: 132,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 12,
  },

  shortcutIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginBottom: 10,
  },

  shortcutTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },

  shortcutText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  twoColumnSection: {
    gap: 14,
  },

  listCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 15,
  },

  listRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F7EEF1',
    paddingVertical: 10,
  },

  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },

  rowContent: {
    flex: 1,
  },

  rowTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },

  rowSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  rowRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  rowValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },

  rowTime: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 2,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },

  statusText: {
    fontSize: 8,
    fontWeight: '800',
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 25,
  },

  rankingRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F7EEF1',
    paddingVertical: 9,
  },

  rankCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5ED',
    marginRight: 8,
  },

  rankText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  rankingIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 9,
  },

  rankingValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  stockAlert: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: '#FFC8D7',
    borderRadius: 18,
    paddingHorizontal: 14,
    marginTop: 14,
  },

  stockAlertIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 11,
  },

  stockAlertContent: {
    flex: 1,
  },

  stockAlertTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  stockAlertText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  criticalCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 15,
    marginTop: 14,
  },

  criticalRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F7EEF1',
  },

  criticalName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },

  criticalValue: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '900',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 28,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 14,
  },

  errorTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 15,
  },

  errorText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },

  retryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 22,
    marginTop: 20,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
