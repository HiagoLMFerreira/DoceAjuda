# Componentes de Compras

A tela foi mantida integralmente para preservar exatamente o layout atual.

A camada `presentation/components` está reservada para a extração incremental
dos seguintes blocos:

- CompraList;
- CompraFormModal;
- CompraItemModal;
- ProdutoCompraPickerModal;
- CompraDetailsModal.

Essa extração deve ser feita em uma etapa visual isolada. As regras críticas,
transações e persistência já foram retiradas da dependência direta da Screen
por meio da facade, Controller e Services.
