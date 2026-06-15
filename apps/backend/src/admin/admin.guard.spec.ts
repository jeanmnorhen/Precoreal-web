import { ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  const mockContext = (user: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as any;

  it('deve permitir acesso para admin', () => {
    const context = mockContext({ userId: '1', tipo: 'admin' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve lançar ForbiddenException para consumidor', () => {
    const context = mockContext({ userId: '2', tipo: 'consumidor' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException para lojista', () => {
    const context = mockContext({ userId: '3', tipo: 'lojista' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException para funcionário', () => {
    const context = mockContext({ userId: '4', tipo: 'funcionario' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException quando user não existe', () => {
    const context = mockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
