import type { ComponentType } from 'react';
import type { RootStackParamList } from './types';

import LoginScreen from '../../screens/LoginScreen';
import MenuScreen from '../../screens/MenuScreen';
import EstoqueScreen from '../../screens/EstoqueScreen';
import ComprasScreen from '../../screens/ComprasScreen';
import ReceitasScreen from '../../screens/ReceitasScreen';
import ProdutosVendaScreen from '../../screens/ProdutosVendaScreen';
import OrcamentosScreen from '../../screens/OrcamentosScreen';
import VendasScreen from '../../screens/VendasScreen';
import ClientesScreen from '../../screens/ClientesScreen';
import RelatoriosScreen from '../../screens/RelatoriosScreen';

export type AppRoute = {
  name: keyof RootStackParamList;
  component: ComponentType<any>;
};

export const APP_ROUTES: AppRoute[] = [
  { name: 'Login', component: LoginScreen },
  { name: 'Menu', component: MenuScreen },
  { name: 'Estoque', component: EstoqueScreen },
  { name: 'Compras', component: ComprasScreen },
  { name: 'Receitas', component: ReceitasScreen },
  {
    name: 'ProdutosVenda',
    component: ProdutosVendaScreen,
  },
  {
    name: 'Orcamentos',
    component: OrcamentosScreen,
  },
  { name: 'Vendas', component: VendasScreen },
  { name: 'Clientes', component: ClientesScreen },
  {
    name: 'Relatorios',
    component: RelatoriosScreen,
  },
];
