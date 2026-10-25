const assert = require('node:assert/strict');
const { test } = require('node:test');
const { DatabaseSync } = require('node:sqlite');
const Module = require('node:module');
const fs = require('node:fs');
const ts = require('typescript');

// Executa os módulos reais contra SQLite em memória, substituindo somente a ponte nativa Expo.
Module._extensions['.ts'] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(source.outputText, filename);
};
const sqlite = new DatabaseSync(':memory:');
const params = args => Array.isArray(args[0]) ? args[0] : args;
const db = {
  execAsync: async sql => sqlite.exec(sql),
  getAllAsync: async (sql, ...args) => sqlite.prepare(sql).all(...params(args)),
  getFirstAsync: async (sql, ...args) => sqlite.prepare(sql).get(...params(args)) ?? null,
  runAsync: async (sql, ...args) => {
    const result = sqlite.prepare(sql).run(...params(args));
    return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
  },
  withTransactionAsync: async action => {
    sqlite.exec('BEGIN');
    try { await action(); sqlite.exec('COMMIT'); }
    catch (e) { sqlite.exec('ROLLBACK'); throw e; }
  },
  closeAsync: async () => {},
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'expo-sqlite') return { openDatabaseAsync: async () => db };
  return originalLoad.call(this, request, parent, isMain);
};
const manager = require('../src/core/database/databaseManager.ts');
const documents = require('../src/modules/documentosComerciais/infrastructure/database/documentosComerciaisDatabase.ts');
const { SQLiteContaReceberRepository } = require('../src/modules/contasReceber/infrastructure/repositories/SQLiteContaReceberRepository.ts');
const { ContaReceberService } = require('../src/modules/contasReceber/application/services/ContaReceberService.ts');
const { obterStatusConta, filtrarContas } = require('../src/modules/contasReceber/domain/models/ContaReceber.ts');
const { SQLiteAgendaRepository } = require('../src/modules/agenda/infrastructure/repositories/SQLiteAgendaRepository.ts');
const { formatDateForDatabase } = require('../src/core/formatters/date.ts');
const service = new ContaReceberService(new SQLiteContaReceberRepository());

test('Produtos recalculam a sugestão sem alterar o preço de venda ou o histórico', async () => {
  await manager.initializeDatabase();
  const produtos = require('../src/modules/produtosVenda/infrastructure/database/produtosVendaDatabase.ts');
  const precificacao = require('../src/modules/produtosVenda/infrastructure/database/precificacaoDatabase.ts');
  // Uma transação isolada impede que estes dados afetem os testes financeiros.
  sqlite.exec('BEGIN');
  try {
    const insumo = Number(sqlite.prepare("INSERT INTO produtos (nome, descricao, quantidade, unidade_medida, preco_medio, quantidade_embalagem) VALUES ('Teste preço', '', 100, 'kg', 10, 1)").run().lastInsertRowid);
    const produto = Number(sqlite.prepare("INSERT INTO produtos_venda (nome, tempo_producao_minutos, preco_venda, preco_sugerido) VALUES ('Teste preço atual', 60, 8, 3)").run().lastInsertRowid);
    sqlite.prepare("INSERT INTO produto_venda_itens (produto_venda_id, produto_estoque_id, quantidade_usada, unidade_medida) VALUES (?, ?, 500, 'g')").run(produto, insumo);
    await precificacao.salvarParametrosPrecificacao(0, 100, 0);
    let atual = await produtos.buscarProdutoVendaPorId(produto);
    assert.equal(atual.preco_sugerido, 5);
    sqlite.prepare('UPDATE produtos SET preco_medio = 20 WHERE id = ?').run(insumo);
    atual = await produtos.buscarProdutoVendaPorId(produto);
    assert.equal(atual.preco_sugerido, 10);
    assert.ok(atual.preco_venda < atual.preco_sugerido);
    await precificacao.salvarParametrosPrecificacao(100, 100, 50);
    const custo = await precificacao.adicionarCustoFixo('Custo de teste', 100);
    atual = (await produtos.listarProdutosVenda('Teste preço atual'))[0];
    assert.equal(atual.preco_sugerido, 24);
    assert.equal(atual.preco_venda, 8);
    await precificacao.alterarStatusCustoFixo(custo, false);
    assert.equal((await produtos.buscarProdutoVendaDetalhado(produto)).preco_sugerido, 22);
    assert.equal(sqlite.prepare('SELECT preco_sugerido FROM produtos_venda WHERE id = ?').get(produto).preco_sugerido, 3);
  } finally {
    sqlite.exec('ROLLBACK');
  }
});

test('Contas a receber: fluxo integrado com dados isolados', async t => {
  await manager.initializeDatabase();
  sqlite.exec(`INSERT INTO clientes (nome) VALUES ('Cliente de teste');
    INSERT INTO produtos (nome, descricao, quantidade, unidade_medida, preco_medio) VALUES ('Insumo', 'Insumo', 100, 'un', 2);
    INSERT INTO produtos_venda (nome, preco_venda) VALUES ('Doce', 100);
    INSERT INTO produto_venda_itens (produto_venda_id, produto_estoque_id, quantidade_usada, unidade_medida) VALUES (1, 1, 1, 'un');`);
  const venda = { tipo: 'VENDA', cliente_id: 1, forma_pagamento: 'Pix', sinal_pagamento: 30, data_encomenda: '2026-10-03', finalidade: 'Aniversário', itens: [{ produto_venda_id: 1, quantidade: 1 }] };
  let id;
  let conta;
  await t.test('Venda com sinal cria saldo independente da data de entrega', async () => {
    id = await documents.salvarDocumentoComercialCompleto(venda);
    [conta] = await service.listar();
    assert.equal(conta.valor_pendente, 70);
    assert.equal(conta.data_vencimento, '');
    assert.equal(obterStatusConta(conta, '2026-10-03'), 'NAO_DEFINIDO');
    assert.equal(sqlite.prepare('SELECT quantidade FROM produtos WHERE id=1').get().quantidade, 99);
  });
  await t.test('Migração do formato anterior preserva saldo e é idempotente', async () => {
    sqlite.exec('ALTER TABLE contas_receber DROP COLUMN forma_pagamento; ALTER TABLE contas_receber DROP COLUMN data_pagamento;');
    await manager.aplicarMigracoesDocumentosComerciais();
    await manager.aplicarMigracoesDocumentosComerciais();
    [conta] = await service.listar();
    assert.equal(conta.valor_pendente, 70);
    assert.equal(conta.forma_pagamento, '');
    assert.equal(conta.data_pagamento, '');
  });
  await t.test('Salvar somente a data atualiza o status e os filtros sem exigir meio de pagamento', async () => {
    await service.definir({ id: conta.id, dataVencimento: '2026-10-03', formaPagamento: '' });
    [conta] = await service.listar();
    assert.equal(conta.forma_pagamento, '');
    assert.equal(obterStatusConta(conta, '2026-10-02'), 'A_RECEBER');
    assert.equal(obterStatusConta(conta, '2026-10-03'), 'A_RECEBER');
    assert.equal(obterStatusConta(conta, '2026-10-04'), 'ATRASADO');
    assert.equal(filtrarContas([conta], ['NAO_DEFINIDO'], false, '2026-10-03').length, 0);
    assert.equal(filtrarContas([conta], ['A_RECEBER'], false, '2026-10-03').length, 1);
    assert.equal(filtrarContas([conta], ['ATRASADO'], false, '2026-10-04').length, 1);
    await service.definir({ id: conta.id, dataVencimento: '', formaPagamento: 'Pix' });
    assert.equal(obterStatusConta((await service.listar())[0], '2026-10-03'), 'NAO_DEFINIDO');
    await service.definir({ id: conta.id, dataVencimento: '2026-10-03', formaPagamento: ' Pix ' });
    [conta] = await service.listar();
    assert.equal(conta.forma_pagamento, 'Pix');
    assert.equal(obterStatusConta(conta, '2026-10-03'), 'A_RECEBER');
    assert.equal(obterStatusConta(conta, '2026-10-04'), 'ATRASADO');
  });
  await t.test('Filtros combinam status e incluem finalizados de forma independente', () => {
    const items = [conta, { ...conta, id: 2, data_vencimento: '' }, { ...conta, id: 3, data_vencimento: '2026-10-01' }, { ...conta, id: 4, status: 'PAGO' }];
    const ids = (...args) => filtrarContas(items, ...args).map(c => c.id);
    assert.deepEqual(ids([], true, '2026-10-03'), [1, 2, 3, 4]);
    assert.deepEqual(ids(['NAO_DEFINIDO', 'ATRASADO'], false, '2026-10-03'), [2, 3]);
    assert.deepEqual(ids(['ATRASADO'], true, '2026-10-03'), [3, 4]);
    assert.deepEqual(ids([], false, '2026-10-03'), [1, 2, 3]);
  });
  const pagamento = { id: conta.id, dataVencimento: '2026-10-03', formaPagamento: 'Pix', dataPagamento: formatDateForDatabase(new Date()) };
  await t.test('Validação impede datas inválidas, pagamento futuro e baixa sem definição', async () => {
    await assert.rejects(async () => service.baixar({ ...pagamento, dataVencimento: '' }));
    await assert.rejects(async () => service.baixar({ ...pagamento, formaPagamento: '' }));
    await assert.rejects(async () => service.baixar({ ...pagamento, dataPagamento: '2099-12-31' }));
    await assert.rejects(async () => service.definir({ ...pagamento, dataVencimento: '2026-02-30' }));
    assert.equal((await service.listar())[0].valor_pendente, 70);
  });
  await t.test('Baixa quita saldo, preserva sinal e atualiza venda e agenda', async () => {
    await service.baixar(pagamento);
    [conta] = await service.listar();
    assert.equal(conta.valor_pendente, 0);
    assert.equal(conta.valor_sinal, 30);
    assert.equal(conta.data_pagamento, pagamento.dataPagamento);
    assert.equal(obterStatusConta(conta, '2099-01-01'), 'FINALIZADO');
    assert.equal((await documents.buscarDocumentoComercialPorId(id)).saldo_receber, 0);
    const agenda = await new SQLiteAgendaRepository().buscarDetalhes(id);
    assert.equal(agenda.valorPago, 100);
    assert.equal(agenda.valorReceber, 0);
    assert.equal(sqlite.prepare("SELECT COALESCE(SUM(valor_pendente),0) AS saldo FROM contas_receber WHERE status='PENDENTE'").get().saldo, 0);
  });
  await t.test('Baixa duplicada e edição após baixa são rejeitadas', async () => {
    await assert.rejects(service.baixar(pagamento));
    await assert.rejects(service.definir(pagamento));
  });
  await t.test('Venda sem sinal e sinal integral não criam saldo', async () => {
    await documents.salvarDocumentoComercialCompleto({ ...venda, sinal_pagamento: 0 });
    await documents.salvarDocumentoComercialCompleto({ ...venda, sinal_pagamento: 100 });
    assert.equal((await service.listar()).length, 1);
  });
  await t.test('Conversão cria saldo e cancelamento invalida conta', async () => {
    const orcamentoId = await documents.salvarDocumentoComercialCompleto({ ...venda, tipo: 'ORCAMENTO', sinal_pagamento: 0 });
    const vendaId = await documents.converterOrcamentoEmVenda(orcamentoId, venda);
    const nova = (await service.listar()).find(c => c.venda_id === vendaId);
    assert.equal(nova.valor_pendente, 70);
    assert.equal(nova.data_vencimento, '');
    await documents.cancelarVenda(vendaId);
    assert.equal((await service.listar()).some(c => c.id === nova.id), false);
    await assert.rejects(service.baixar({ ...pagamento, id: nova.id }));
  });
  sqlite.close();
});
