import type { DashboardData } from '../models/Dashboard';

export interface IDashboardRepository {
  carregar(): Promise<DashboardData>;
}
