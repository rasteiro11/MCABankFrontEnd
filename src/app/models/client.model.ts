export interface Client {
  id?: number;
  nome: string;
  email: string;
  saldo: number;
  dataCadastro?: Date;
  ativo: boolean;
}

export interface TransactionRequest {
  amount: number;
  descricao?: string;
  idempotencyKey: string;
}