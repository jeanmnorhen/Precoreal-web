from datetime import datetime
from app.dominio.entidades.anuncio import Anuncio
from app.dominio.repositorios.usuario_repositorio import UsuarioRepositorio
from app.dominio.repositorios.anuncio_repositorio import AnuncioRepositorio

class ImpulsionarAnuncio:
    def __init__(self, usuario_repo: UsuarioRepositorio, anuncio_repo: AnuncioRepositorio):
        self.usuario_repo = usuario_repo
        self.anuncio_repo = anuncio_repo

    async def executar(
        self,
        anuncio_id: str,
        loja_id: str,
        produto_id: str,
        titulo: str,
        descricao: str,
        raio_alcance: float,
        data_inicio: datetime,
        data_fim: datetime,
        usuario_proprietario_id: str
    ) -> Anuncio:
        """
        Cria um anúncio deduzindo créditos do lojista com base no raio de alcance pretendido.
        Fórmula: custo = raio_alcance * 5.0 créditos.
        """
        # Calcular custo do anúncio (5 créditos por km de raio de alcance)
        custo_creditos = round(raio_alcance * 5.0, 2)
        
        # Obter o usuário proprietário da loja
        usuario = await self.usuario_repo.obter_por_id(usuario_proprietario_id)
        if not usuario:
            raise ValueError("Usuário proprietário não encontrado")
            
        if usuario.tipo != "lojista":
            raise ValueError("Apenas usuários do tipo lojista podem impulsionar anúncios")
            
        # Tentar deduzir os créditos (isso lança ValueError se for insuficiente)
        usuario.deduzir_creditos(custo_creditos)
        
        # Criar o anúncio
        anuncio = Anuncio(
            id=anuncio_id,
            loja_id=loja_id,
            produto_id=produto_id,
            titulo=titulo,
            descricao=descricao,
            raio_alcance=raio_alcance,
            custo_creditos=custo_creditos,
            data_inicio=data_inicio,
            data_fim=data_fim,
            status="ativo"
        )
        
        # Salvar o anúncio e o usuário atualizado no repositório
        await self.anuncio_repo.salvar(anuncio)
        await self.usuario_repo.salvar(usuario)
        
        return anuncio
