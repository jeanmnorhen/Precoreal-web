export interface LoginRequest {
  email: string;
  senha?: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha?: string;
  tipo: 'consumidor' | 'lojista' | 'funcionario';
}

export interface UserResponse {
  id: string;
  nome: string;
  email: string;
  tipo: 'consumidor' | 'lojista' | 'funcionario' | 'admin';
  saldoCreditos?: number;
  quantidadeDiamantes?: number;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}
