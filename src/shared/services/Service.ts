export interface Service<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export interface ServiceWithoutInput<TOutput> {
  execute(): Promise<TOutput>;
}
