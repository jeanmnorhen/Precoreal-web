from typing import List, Optional
from supabase import Client
from app.dominio.entidades.produto import Produto
from app.dominio.repositorios.produto_repositorio import ProdutoRepositorio

class SupabaseProdutoRepositorio(ProdutoRepositorio):
    def __init__(self, cliente_supabase: Client):
        self.client = cliente_supabase

    async def obter_por_id(self, id: str) -> Optional[Produto]:
        resposta = self.client.table("produtos").select("*").eq("id", id).maybe_single().execute()
        dados = resposta.data
        if not dados:
            return None
        return self._mapear_para_entidade(dados)

    async def buscar_todos(self) -> List[Produto]:
        resposta = self.client.table("produtos").select("*").execute()
        return [self._mapear_para_entidade(dados) for dados in resposta.data]

    async def buscar_por_categoria(self, categoria: str) -> List[Produto]:
        resposta = self.client.table("produtos").select("*").eq("categoria", categoria).execute()
        return [self._mapear_para_entidade(dados) for dados in resposta.data]

    async def salvar(self, produto: Produto) -> None:
        dados = produto.para_dicionario()
        self.client.table("produtos").upsert(dados).execute()

    def _mapear_para_entidade(self, dados: dict) -> Produto:
        return Produto(
            id=dados["id"],
            nome=dados["nome"],
            descricao=dados.get("descricao"),
            categoria=dados["categoria"],
            marca=dados.get("marca"),
            preco=float(dados["preco"]),
            estoque=int(dados["estoque"]),
            imagens=dados.get("imagens", []),
            avaliacoes=dados.get("avaliacoes", [])
        )
