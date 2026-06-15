import { createApiClient } from '@precoreal/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export const api = createApiClient({
  baseUrl: API_BASE,
  getToken,
});
