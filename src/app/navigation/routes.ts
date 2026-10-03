import type { ComponentType } from 'react';

import LoginScreen from '../../modules/auth/presentation/screens/LoginScreen';
import MenuScreen from '../menu/MenuScreen';
import DashboardScreen from '../../modules/dashboard/presentation/screens/DashboardScreen';

import ClientesScreen from '../../modules/clientes/presentation/screens/ClientesScreen';
import ComprasScreen from '../../modules/compras/presentation/screens/ComprasScreen';
import EstoqueScreen from '../../modules/estoque/presentation/screens/EstoqueScreen';
import OrcamentosScreen from '../../modules/orcamentos/presentation/screens/OrcamentosScreen';
import ProdutosVendaScreen from '../../modules/produtosVenda/presentation/screens/ProdutosVendaScreen';
import ReceitasScreen from '../../modules/receitas/presentation/screens/ReceitasScreen';
import RelatoriosScreen from '../../modules/relatorios/presentation/screens/RelatoriosScreen';
import VendasScreen from '../../modules/vendas/presentation/screens/VendasScreen';
import AgendaScreen from '../../modules/agenda/presentation/screens/AgendaScreen';
import ContasReceberScreen from '../../modules/contasReceber/presentation/screens/ContasReceberScreen';

import type { RootStackParamList } from './types';

export type AppRoute = {
  name: keyof RootStackParamList;
  component: ComponentType<any>;
};

export const APP_ROUTES: AppRoute[] = [
  { name: 'Login', component: LoginScreen },
  { name: 'Dashboard', component: DashboardScreen },
  { name: 'Menu', component: MenuScreen },
  { name: 'Estoque', component: EstoqueScreen },
  { name: 'Compras', component: ComprasScreen },
  { name: 'Receitas', component: ReceitasScreen },
  { name: 'ProdutosVenda', component: ProdutosVendaScreen },
  { name: 'Orcamentos', component: OrcamentosScreen },
  { name: 'Vendas', component: VendasScreen },
  { name: 'Clientes', component: ClientesScreen },
  { name: 'Relatorios', component: RelatoriosScreen },
  { name: 'Agenda', component: AgendaScreen },
  { name: 'ContasReceber', component: ContasReceberScreen },
];
