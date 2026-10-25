const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const fs = require('node:fs');
const ts = require('typescript');

Module._extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(result.outputText, filename);
};
let sequence = 0;
const shared = [];
class Directory {
  constructor(parent, name) { this.uri = `${parent.uri}/${name}`; }
  create() {}
}
class File {
  constructor(parent, name) { this.uri = name ? `${parent.uri}/${name}` : parent; }
  get name() { return this.uri.split('/').pop(); }
  get parentDirectory() { return { uri: this.uri.slice(0, this.uri.lastIndexOf('/')) }; }
  move(destination) { this.uri = destination.uri; }
}
const originalLoad = Module._load;
Module._load = function(request, parent, main) {
  if (request === 'expo-file-system') return { Directory, File };
  if (request === 'expo-print') return { printToFileAsync: async () => ({ uri: `file:///cache/print-${++sequence}.pdf` }) };
  if (request === 'expo-sharing') return { isAvailableAsync: async () => true, shareAsync: async (uri, options) => shared.push({ uri, options }) };
  return originalLoad.call(this, request, parent, main);
};
const { normalizePdfFileName } = require('../src/shared/pdf/pdfFileName.ts');
const { pdfService } = require('../src/shared/pdf/PdfService.ts');

test('Nomes preservam acentos e tratam datas, extensão e caracteres inválidos', () => {
  assert.equal(normalizePdfFileName('Orçamento 2 - João'), 'Orçamento 2 - João.pdf');
  assert.equal(normalizePdfFileName('Relatório de Vendas - 01/10/2026 a 31/10/2026'), 'Relatório de Vendas - 01-10-2026 a 31-10-2026.pdf');
  assert.equal(normalizePdfFileName(' Teste.PDF ' .trim()), 'Teste.pdf');
  assert.equal(normalizePdfFileName('...'), 'Documento.pdf');
  assert.ok(normalizePdfFileName('a'.repeat(300)).length <= 164);
  assert.ok(!normalizePdfFileName('../Cliente: "Maria"').includes('/'));
});

test('Compartilha o PDF com o nome escolhido em pastas isoladas', async () => {
  const options = { html: '<p>Teste</p>', fileName: 'Orçamento 2 - João', dialogTitle: 'Orçamento #2' };
  await pdfService.generateAndShare(options);
  await pdfService.generateAndShare(options);
  assert.ok(shared[0].uri.endsWith('/Orçamento 2 - João.pdf'));
  assert.notEqual(shared[0].uri, shared[1].uri);
  assert.equal(shared[0].options.mimeType, 'application/pdf');
  await pdfService.generateAndShare({ html: '<p>Teste</p>', dialogTitle: 'Necessidades do dia 01/10/2026' });
  assert.ok(shared[2].uri.endsWith('/Necessidades do dia 01-10-2026.pdf'));
});
