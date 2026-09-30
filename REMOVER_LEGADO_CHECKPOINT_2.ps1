$itens = @(
  "src/database",
  "src/core/database/migrations",
  "src/modules/compras/infrastructure/facades",
  "src/modules/compras/infrastructure/repositories/LegacyCompraRepository.ts",
  "src/modules/compras/infrastructure/repositories/LegacyProdutoCompraRepository.ts",
  "src/modules/produtosVenda/infrastructure/facades",
  "src/modules/produtosVenda/infrastructure/repositories/LegacyProdutoVendaRepository.ts",
  "src/modules/produtosVenda/infrastructure/repositories/LegacyPrecificacaoRepository.ts",
  "src/modules/orcamentos/infrastructure/facades",
  "src/modules/orcamentos/infrastructure/repositories/LegacyOrcamentoRepository.ts",
  "src/modules/vendas/infrastructure/facades",
  "src/modules/vendas/infrastructure/repositories/LegacyVendaRepository.ts",
  "src/modules/relatorios/infrastructure/LegacyRelatorioRepository.ts",
  "src/modules/documentosComerciais/infrastructure/documentosComerciaisFacade.ts"
)

foreach ($item in $itens) {
  if (Test-Path $item) {
    Remove-Item $item -Recurse -Force
    Write-Host "Removido: $item"
  }
}

Write-Host "Limpeza do Checkpoint 2 concluída."
