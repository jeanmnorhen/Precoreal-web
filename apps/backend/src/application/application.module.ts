import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';
import { GeoModule } from '../geo/geo.module';
import { StripeModule } from '../stripe/stripe.module';
import { RenovarAnuncioUseCase } from './use-cases/renovar-anuncio.use-case';
import { RegistrarUsuarioUseCase } from './use-cases/registrar-usuario.use-case';
import { AutenticarUsuarioUseCase } from './use-cases/autenticar-usuario.use-case';
import { CriarLojaUseCase } from './use-cases/criar-loja.use-case';
import { ObterPerfilPublicoLojaUseCase } from './use-cases/obter-perfil-publico-loja.use-case';
import { CriarAnuncioUseCase } from './use-cases/criar-anuncio.use-case';
import { AtualizarAnuncioUseCase } from './use-cases/atualizar-anuncio.use-case';
import { ObterDashboardLojistaUseCase } from './use-cases/obter-dashboard-lojista.use-case';
import { AdicionarFuncionarioUseCase } from './use-cases/adicionar-funcionario.use-case';
import { RemoverFuncionarioUseCase } from './use-cases/remover-funcionario.use-case';
import { VerificarAcessoFuncionarioUseCase } from './use-cases/verificar-acesso-funcionario.use-case';
import { ProcessarScanUseCase } from './use-cases/processar-scan.use-case';
import { ObterUsuarioLogadoUseCase } from './use-cases/obter-usuario-logado.use-case';
import { ComprarCreditosUseCase } from './use-cases/comprar-creditos.use-case';
import { ListarFuncionariosLojaUseCase } from './use-cases/listar-funcionarios-loja.use-case';
import { AtualizarTurnosFuncionarioUseCase } from './use-cases/atualizar-turnos-funcionario.use-case';
import { ListarLojasFuncionarioUseCase } from './use-cases/listar-lojas-funcionario.use-case';
import { ListarProdutosLojaUseCase } from './use-cases/listar-produtos-loja.use-case';
import { ListarAnunciosLojaUseCase } from './use-cases/listar-anuncios-loja.use-case';
import { ObterDashboardAdminUseCase } from './use-cases/obter-dashboard-admin.use-case';
import { MonitorarPrecosUseCase } from './use-cases/monitorar-precos.use-case';
import { MonitorarUsoUseCase } from './use-cases/monitorar-uso.use-case';
import { CriarProdutoUseCase } from './use-cases/criar-produto.use-case';
import { ListarProdutosUseCase } from './use-cases/listar-produtos.use-case';
import { BuscarProdutoCodigoBarrasUseCase } from './use-cases/buscar-produto-codigo-barras.use-case';
import { BuscarProdutoPorIdUseCase } from './use-cases/buscar-produto-por-id.use-case';
import { AtualizarProdutoUseCase } from './use-cases/atualizar-produto.use-case';
import { DeletarProdutoUseCase } from './use-cases/deletar-produto.use-case';
import { ListarLojasProprietarioUseCase } from './use-cases/listar-lojas-proprietario.use-case';
import { BuscarLojaPorIdUseCase } from './use-cases/buscar-loja-por-id.use-case';
import { AtualizarLojaUseCase } from './use-cases/atualizar-loja.use-case';
import { DeletarLojaUseCase } from './use-cases/deletar-loja.use-case';
import { ListarAnunciosUseCase } from './use-cases/listar-anuncios.use-case';
import { BuscarAnuncioPorIdUseCase } from './use-cases/buscar-anuncio-por-id.use-case';
import { DeletarAnuncioUseCase } from './use-cases/deletar-anuncio.use-case';
import { BuscarUsuarioPorIdUseCase } from './use-cases/buscar-usuario-por-id.use-case';
import { AtualizarUsuarioUseCase } from './use-cases/atualizar-usuario.use-case';

@Module({
  imports: [
    RepositoriesModule,
    GeoModule,
    StripeModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'precoreal-secret-dev',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    RenovarAnuncioUseCase,
    RegistrarUsuarioUseCase,
    AutenticarUsuarioUseCase,
    CriarLojaUseCase,
    ObterPerfilPublicoLojaUseCase,
    CriarAnuncioUseCase,
    AtualizarAnuncioUseCase,
    ObterDashboardLojistaUseCase,
    AdicionarFuncionarioUseCase,
    RemoverFuncionarioUseCase,
    VerificarAcessoFuncionarioUseCase,
    ProcessarScanUseCase,
    ObterUsuarioLogadoUseCase,
    ComprarCreditosUseCase,
    ListarFuncionariosLojaUseCase,
    AtualizarTurnosFuncionarioUseCase,
    ListarLojasFuncionarioUseCase,
    ListarProdutosLojaUseCase,
    ListarAnunciosLojaUseCase,
    ObterDashboardAdminUseCase,
    MonitorarPrecosUseCase,
    MonitorarUsoUseCase,
    CriarProdutoUseCase,
    ListarProdutosUseCase,
    BuscarProdutoCodigoBarrasUseCase,
    BuscarProdutoPorIdUseCase,
    AtualizarProdutoUseCase,
    DeletarProdutoUseCase,
    ListarLojasProprietarioUseCase,
    BuscarLojaPorIdUseCase,
    AtualizarLojaUseCase,
    DeletarLojaUseCase,
    ListarAnunciosUseCase,
    BuscarAnuncioPorIdUseCase,
    DeletarAnuncioUseCase,
    BuscarUsuarioPorIdUseCase,
    AtualizarUsuarioUseCase,
  ],
  exports: [
    RenovarAnuncioUseCase,
    RegistrarUsuarioUseCase,
    AutenticarUsuarioUseCase,
    CriarLojaUseCase,
    ObterPerfilPublicoLojaUseCase,
    CriarAnuncioUseCase,
    AtualizarAnuncioUseCase,
    ObterDashboardLojistaUseCase,
    AdicionarFuncionarioUseCase,
    RemoverFuncionarioUseCase,
    VerificarAcessoFuncionarioUseCase,
    ProcessarScanUseCase,
    ObterUsuarioLogadoUseCase,
    ComprarCreditosUseCase,
    ListarFuncionariosLojaUseCase,
    AtualizarTurnosFuncionarioUseCase,
    ListarLojasFuncionarioUseCase,
    ListarProdutosLojaUseCase,
    ListarAnunciosLojaUseCase,
    ObterDashboardAdminUseCase,
    MonitorarPrecosUseCase,
    MonitorarUsoUseCase,
    CriarProdutoUseCase,
    ListarProdutosUseCase,
    BuscarProdutoCodigoBarrasUseCase,
    BuscarProdutoPorIdUseCase,
    AtualizarProdutoUseCase,
    DeletarProdutoUseCase,
    ListarLojasProprietarioUseCase,
    BuscarLojaPorIdUseCase,
    AtualizarLojaUseCase,
    DeletarLojaUseCase,
    ListarAnunciosUseCase,
    BuscarAnuncioPorIdUseCase,
    DeletarAnuncioUseCase,
    BuscarUsuarioPorIdUseCase,
    AtualizarUsuarioUseCase,
  ],
})
export class ApplicationModule {}
