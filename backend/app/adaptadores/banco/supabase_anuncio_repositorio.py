from datetime import datetime
from typing import List, Optional
from supabase import Client
from app.dominio.entidades.anuncio import Anuncio
from app.dominio.repositorios.anuncio_repositorio import AnuncioRepositorio

class SupabaseAnuncioRepositorio(AnuncioRepositorio):
    def __init__(self, cliente_supabase: Client):
        self.client = cliente_supabase

    async def obter_por_id(self, id: str) -> Optional[Anuncio]:
        resposta = self.client.table("anuncios").select("*").eq("id", id).maybe_single().execute()
        dados = resposta.data
        if not dados:
            return None
        return self._mapear_para_entidade(dados)

    async def buscar_ativos(self) -> List[Anuncio]:
        agora = datetime.utcnow().isoformat()
        resposta = self.client.table("anuncios").select("*").eq("status", "ativo").gt("data_fim", agora).execute()
        return [self._mapear_para_entidade(dados) for dados in resposta.data]

    async def buscar_por_loja(self, loja_id: str) -> List[Anuncio]:
        resposta = self.client.table("anuncios").select("*").eq("loja_id", loja_id).execute()
        return [self._mapear_para_entidade(dados) for dados in resposta.data]

    async def salvar(self, anuncio: Anuncio) -> None:
        dados = {
            "id": anuncio.id,
            "loja_id": anuncio.loja_id,
            "produto_id": anuncio.produto_id,
            "titulo": anuncio.titulo,
            "descricao": anuncio.descricao,
            "raio_alcance": anuncio.raio_alcance,
            "custo_creditos": anuncio.custo_creditos,
            "data_inicio": anuncio.data_inicio.isoformat(),
            "data_fim": anuncio.data_fim.isoformat(),
            "status": anuncio.status
        }
        self.client.table("anuncios").upsert(dados).execute()

    def _mapear_para_entidade(self, dados: dict) -> Anuncio:
        # Corrige possíveis sufixos Z ou +00:00 para parsing de datetime
        data_ini_str = dados["data_inicio"].replace("Z", "+00:00")
        data_fim_str = dados["data_fim"].replace("Z", "+00:00")
        return Anuncio(
            id=dados["id"],
            loja_id=dados["loja_id"],
            produto_id=dados["produto_id"],
            titulo=dados["titulo"],
            descricao=dados.get("descricao"),
            raio_alcance=float(dados["raio_alcance"]),
            custo_creditos=float(dados["custo_creditos"]),
            data_inicio=datetime.fromisoformat(data_ini_str),
            data_fim=datetime.fromisoformat(data_fim_str),
            status=dados["status"]
        )
