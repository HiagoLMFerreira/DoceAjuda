import { CarregarDashboardService } from '../application/services/CarregarDashboardService';
import { SQLiteDashboardRepository } from '../infrastructure/repositories/SQLiteDashboardRepository';

const dashboardRepository =
  new SQLiteDashboardRepository();

export const carregarDashboardService =
  new CarregarDashboardService(
    dashboardRepository
  );
