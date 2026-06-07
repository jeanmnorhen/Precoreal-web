from app.dominio.repositorios.usuario_repositorio import UsuarioRepositorio

class AdquirirCreditos:
    def __init__(self, usuario_repo: UsuarioRepositorio):
        self.usuario_repo = usuario_repo

    async def executar(self, usuario_id: str, quantidade_creditos: float, valor_pago: float) -> float:
        """
        Adiciona créditos ao usuário após confirmação de pagamento.
        Fórmula: 1 crédito = R$ 1,00.
        """
        if quantidade_creditos <= 0:
            raise ValueError("A quantidade de créditos deve ser maior que zero")
        if valor_pago < quantidade_creditos:
            raise ValueError("O valor pago é insuficiente para a quantidade de créditos solicitada")

        usuario = await self.usuario_repo.obter_por_id(usuario_id)
        if not usuario:
            raise ValueError("Usuário não encontrado")

        usuario.adicionar_creditos(quantidade_creditos)
        await self.usuario_repo.salvar(usuario)
        return usuario.saldo_creditos
