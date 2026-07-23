import { useCallback, useMemo, useState } from 'react';
import { getErrorMessage } from '../../../../core/errors';
import { receitaController } from '../../di/receitasContainer';
import type { ProdutoParaReceita } from '../../domain/models/ProdutoParaReceita';
import {
  UNIDADES_RECEITA,
  type DirecaoOrdenacaoReceita,
  type FormularioReceita,
  type ItemReceitaFormulario,
  type ModoFormularioReceita,
  type OrdenarReceitaPor,
  type Receita,
  type ReceitaDetalhada,
  type UnidadeReceita,
} from '../../domain/models/Receita';

const FORM_INICIAL: FormularioReceita = { nome: '', rendimento: '', modoPreparo: '', itens: [] };

export function nomeProduto(p: ProdutoParaReceita) {
  return p.nome || p.descricao || 'Produto sem nome';
}

export function useReceitas() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [busca, setBusca] = useState('');
  const [ordenarPor, setOrdenarPor] = useState<OrdenarReceitaPor>('nome');
  const [direcao, setDirecao] = useState<DirecaoOrdenacaoReceita>('ASC');
  const [detalhada, setDetalhada] = useState<ReceitaDetalhada | null>(null);
  const [modo, setModo] = useState<ModoFormularioReceita>('cadastro');
  const [form, setForm] = useState<FormularioReceita>(FORM_INICIAL);
  const [receitaIdEdicao, setReceitaIdEdicao] = useState<number | null>(null);

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalItem, setModalItem] = useState(false);
  const [modalProdutos, setModalProdutos] = useState(false);
  const [scanner, setScanner] = useState(false);

  const [produtos, setProdutos] = useState<ProdutoParaReceita[]>([]);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoParaReceita | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState<UnidadeReceita>('un');
  const [indiceEdicao, setIndiceEdicao] = useState<number | null>(null);

  const carregar = useCallback(async () => setReceitas(await receitaController.listar()), []);

  const receitasExibidas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const lista = t ? receitas.filter(r =>
      String(r.id).includes(t) || r.nome.toLowerCase().includes(t) || r.rendimento.toLowerCase().includes(t)
    ) : [...receitas];
    return lista.sort((a,b) => {
      const c = String(a[ordenarPor] ?? '').localeCompare(String(b[ordenarPor] ?? ''), 'pt-BR');
      return direcao === 'ASC' ? c : -c;
    });
  }, [receitas, busca, ordenarPor, direcao]);

  const produtosExibidos = useMemo(() => {
    const t = buscaProduto.trim().toLowerCase();
    if (!t) return produtos;
    return produtos.filter(p =>
      String(p.id).includes(t) || nomeProduto(p).toLowerCase().includes(t) ||
      String(p.codigo_barras ?? '').toLowerCase().includes(t)
    );
  }, [produtos, buscaProduto]);

  const limparItem = useCallback(() => {
    setBuscaProduto(''); setProdutoSelecionado(null); setQuantidade('');
    setUnidade('un'); setIndiceEdicao(null); setModalProdutos(false);
  }, []);

  const abrirCadastro = useCallback(() => {
    setModo('cadastro'); setReceitaIdEdicao(null); setDetalhada(null);
    setForm(FORM_INICIAL); limparItem(); setModalFormulario(true);
  }, [limparItem]);

  const abrirDetalhes = useCallback(async (id: number) => {
    setDetalhada(await receitaController.buscarDetalhada(id));
    setModalDetalhes(true);
  }, []);

  const abrirEdicao = useCallback(() => {
    if (!detalhada) return;
    setModo('edicao'); setReceitaIdEdicao(detalhada.id);
    setForm({
      nome: detalhada.nome,
      rendimento: detalhada.rendimento,
      modoPreparo: detalhada.modo_preparo ?? '',
      itens: detalhada.itens.map(i => ({
        produto_id: i.produto_id, produto_nome: i.produto_nome,
        quantidade_usada: i.quantidade_usada,
        quantidade_numero: Number(i.quantidade_numero || extrairQuantidade(i.quantidade_usada)),
        unidade_medida: normalizarUnidade(i.unidade_medida || extrairUnidade(i.quantidade_usada)),
      })),
    });
    setModalDetalhes(false); setModalFormulario(true);
  }, [detalhada]);

  const abrirNovoItem = useCallback(async () => {
    limparItem(); setModalItem(true);
    setProdutos(await receitaController.listarProdutos());
  }, [limparItem]);

  const abrirEditarItem = useCallback(async (item: ItemReceitaFormulario, indice: number) => {
    const lista = await receitaController.listarProdutos();
    setProdutos(lista); setProdutoSelecionado(lista.find(p => p.id === item.produto_id) ?? null);
    setQuantidade(String(item.quantidade_numero).replace('.', ','));
    setUnidade(normalizarUnidade(item.unidade_medida));
    setIndiceEdicao(indice); setModalItem(true);
  }, []);

  const abrirProdutos = useCallback(async () => {
    if (!produtos.length) setProdutos(await receitaController.listarProdutos());
    setBuscaProduto(''); setModalProdutos(true);
  }, [produtos.length]);

  const selecionarProduto = useCallback((p: ProdutoParaReceita) => {
    setProdutoSelecionado(p);
    const u = normalizarUnidade(p.unidade_medida);
    if (UNIDADES_RECEITA.includes(u)) setUnidade(u);
    setModalProdutos(false);
  }, []);

  const salvarItem = useCallback(() => {
    if (!produtoSelecionado) throw new Error('Selecione um produto.');
    const q = Number(quantidade.replace(',', '.'));
    if (!Number.isFinite(q) || q <= 0) throw new Error('Informe uma quantidade válida.');
    if (form.itens.some((i, idx) => i.produto_id === produtoSelecionado.id && idx !== indiceEdicao)) {
      throw new Error('Esse produto já foi adicionado. Edite o item existente.');
    }
    const novo: ItemReceitaFormulario = {
      produto_id: produtoSelecionado.id, produto_nome: nomeProduto(produtoSelecionado),
      quantidade_numero: q, unidade_medida: unidade, quantidade_usada: `${q} ${unidade}`,
    };
    setForm(atual => ({ ...atual, itens: indiceEdicao === null
      ? [...atual.itens, novo]
      : atual.itens.map((i, idx) => idx === indiceEdicao ? novo : i)
    }));
    limparItem(); setModalItem(false);
  }, [produtoSelecionado, quantidade, unidade, form.itens, indiceEdicao, limparItem]);

  const removerItem = useCallback((indice: number) => {
    setForm(atual => ({ ...atual, itens: atual.itens.filter((_,i) => i !== indice) }));
  }, []);

  const salvar = useCallback(async () => {
    const dto = {
      nome: form.nome, rendimento: form.rendimento, modo_preparo: form.modoPreparo,
      itens: form.itens.map(({ produto_nome, ...item }) => item),
    };
    if (modo === 'cadastro') await receitaController.salvar(dto);
    else {
      if (!receitaIdEdicao) throw new Error('Receita inválida.');
      await receitaController.atualizar({ id: receitaIdEdicao, ...dto });
    }
    setModalFormulario(false); setDetalhada(null); setForm(FORM_INICIAL); await carregar();
  }, [form, modo, receitaIdEdicao, carregar]);

  const excluir = useCallback(async () => {
    if (!detalhada) return;
    await receitaController.excluir(detalhada.id);
    setModalDetalhes(false); setDetalhada(null); await carregar();
  }, [detalhada, carregar]);

  const ordenar = useCallback((campo: OrdenarReceitaPor) => {
    if (campo === ordenarPor) setDirecao(d => d === 'ASC' ? 'DESC' : 'ASC');
    else { setOrdenarPor(campo); setDirecao('ASC'); }
  }, [ordenarPor]);

  return {
    receitas: receitasExibidas, busca, setBusca, ordenarPor, direcao, ordenar, carregar,
    detalhada, modo, form, setForm, modalDetalhes, setModalDetalhes,
    modalFormulario, setModalFormulario, modalItem, setModalItem,
    modalProdutos, setModalProdutos, scanner, setScanner,
    produtos: produtosExibidos, buscaProduto, setBuscaProduto,
    produtoSelecionado, quantidade, setQuantidade, unidade, setUnidade,
    abrirCadastro, abrirDetalhes, abrirEdicao, abrirNovoItem, abrirEditarItem,
    abrirProdutos, selecionarProduto, salvarItem, removerItem, salvar, excluir,
    fecharItem: () => { limparItem(); setModalItem(false); },
    receberCodigo: (codigo: string) => { setScanner(false); setBuscaProduto(codigo.trim()); },
    mensagemErro: (e: unknown, f: string) => getErrorMessage(e, f),
  };
}

function extrairQuantidade(texto: string) {
  const m = texto.replace(',', '.').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
}
function extrairUnidade(texto: string) {
  return texto.match(/[a-zA-Z]+/)?.[0] ?? 'un';
}
function normalizarUnidade(u: string): UnidadeReceita {
  const n = u.toLowerCase().startsWith('un') ? 'un' : u.toLowerCase();
  return UNIDADES_RECEITA.includes(n as UnidadeReceita) ? n as UnidadeReceita : 'un';
}
