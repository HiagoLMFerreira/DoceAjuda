import type { DashboardData } from '../../domain/models/Dashboard';
import type { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';

export class CarregarDashboardService {
  constructor(
    private readonly repository: IDashboardRepository
  ) {}

  executar(): Promise<DashboardData> {
    return this.repository.carregar();
  }
}
