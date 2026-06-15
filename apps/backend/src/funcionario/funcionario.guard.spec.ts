import { ForbiddenException } from '@nestjs/common';
import { FuncionarioGuard } from './funcionario.guard';

describe('FuncionarioGuard', () => {
  let guard: FuncionarioGuard;

  beforeEach(() => {
    guard = new FuncionarioGuard();
  });

  const mockContext = (user: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as any;

  it('deve permitir acesso para funcionário', () => {
    const context = mockContext({ userId: '1', tipo: 'funcionario' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve permitir acesso para lojista', () => {
    const context = mockContext({ userId: '2', tipo: 'lojista' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve lançar ForbiddenException para consumidor', () => {
    const context = mockContext({ userId: '3', tipo: 'consumidor' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException para admin', () => {
    const context = mockContext({ userId: '4', tipo: 'admin' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException quando user não existe', () => {
    const context = mockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
