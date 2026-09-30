import { ValidationError } from '../../../../core/errors';

type FamiliaUnidade = 'massa' | 'volume' | 'unidade';

type QuantidadeConvertida = {
  quantidade: number;
  unidadeDestino: string;
};

export class CalcularCompraService {
  arredondar(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  calcularSubtotal(
    quantidadeEmbalagens: number,
    valorUnitario: number
  ): number {
    return this.arredondar(
      quantidadeEmbalagens * valorUnitario
    );
  }

  calcularTotal(
    itens: Array<{
      quantidade_embalagens: number;
      valor_unitario: number;
    }>
  ): number {
    return this.arredondar(
      itens.reduce(
        (total, item) =>
          total +
          this.calcularSubtotal(
            item.quantidade_embalagens,
            item.valor_unitario
          ),
        0
      )
    );
  }

  converterQuantidade(
    quantidade: number,
    unidadeOrigem: string,
    unidadeDestino: string
  ): QuantidadeConvertida {
    const origem = this.normalizar(unidadeOrigem);
    const destino = this.normalizar(unidadeDestino);

    const familiaOrigem = this.familia(origem);
    const familiaDestino = this.familia(destino);

    if (
      !familiaOrigem ||
      !familiaDestino ||
      familiaOrigem !== familiaDestino
    ) {
      throw new ValidationError(
        `Não é possível converter ${origem} para ${destino}.`
      );
    }

    const base = this.paraBase(
      quantidade,
      origem,
      familiaOrigem
    );

    return {
      quantidade: this.daBase(
        base,
        destino,
        familiaDestino
      ),
      unidadeDestino: destino,
    };
  }

  calcularPrecoMedioPonderado(
    quantidadeAtual: number,
    precoMedioAtual: number,
    quantidadeEntrada: number,
    valorUnitarioEstoque: number
  ): number {
    const novaQuantidade =
      quantidadeAtual + quantidadeEntrada;

    if (novaQuantidade <= 0) {
      return 0;
    }

    return (
      (quantidadeAtual * precoMedioAtual +
        quantidadeEntrada * valorUnitarioEstoque) /
      novaQuantidade
    );
  }

  private normalizar(unidade: string): string {
    const valor = unidade.trim().toLowerCase();

    if (valor === 'dúzia') {
      return 'duzia';
    }

    return valor;
  }

  private familia(
    unidade: string
  ): FamiliaUnidade | null {
    if (unidade === 'g' || unidade === 'kg') {
      return 'massa';
    }

    if (unidade === 'ml' || unidade === 'l') {
      return 'volume';
    }

    if (
      unidade === 'un' ||
      unidade === 'duzia' ||
      unidade === 'caixa' ||
      unidade === 'pacote'
    ) {
      return 'unidade';
    }

    return null;
  }

  private paraBase(
    quantidade: number,
    unidade: string,
    familia: FamiliaUnidade
  ): number {
    if (familia === 'massa') {
      return unidade === 'kg'
        ? quantidade * 1000
        : quantidade;
    }

    if (familia === 'volume') {
      return unidade === 'l'
        ? quantidade * 1000
        : quantidade;
    }

    if (unidade === 'duzia') {
      return quantidade * 12;
    }

    return quantidade;
  }

  private daBase(
    quantidade: number,
    unidade: string,
    familia: FamiliaUnidade
  ): number {
    if (familia === 'massa') {
      return unidade === 'kg'
        ? quantidade / 1000
        : quantidade;
    }

    if (familia === 'volume') {
      return unidade === 'l'
        ? quantidade / 1000
        : quantidade;
    }

    if (unidade === 'duzia') {
      return quantidade / 12;
    }

    return quantidade;
  }
}
