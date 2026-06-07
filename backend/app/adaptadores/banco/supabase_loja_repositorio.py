from typing import List, Optional
from supabase import Client
from app.dominio.entidades.loja import Loja
from app.dominio.objetos_valor.endereco import Endereco
from app.dominio.repositorios.loja_repositorio import LojaRepositorio

class SupabaseLojaRepositorio(LojaRepositorio):
    def __init__(self, cliente_supabase: Client):
        self.client = cliente_supabase

    async def obter_por_id(self, id: str) -> Optional[Loja]:
        resposta = self.client.table("lojas").select("*, enderecos(*)").eq("id", id).maybe_single().execute()
        dados = resposta.data
        if not dados:
            return None
        return self._mapear_para_entidade(dados)

    async def obter_por_proprietario(self, usuario_proprietario_id: str) -> List[Loja]:
        resposta = self.client.table("lojas").select("*, enderecos(*)").eq("usuario_proprietario_id", usuario_proprietario_id).execute()
        return [self._mapear_para_entidade(dados) for dados in resposta.data]

    async def salvar(self, loja: Loja) -> None:
        endereco_id = None
        if loja.endereco:
            resposta_loja = self.client.table("lojas").select("endereco_id").eq("id", loja.id).maybe_single().execute()
            dados_loja = resposta_loja.data
            
            dados_end = loja.endereco.para_dicionario()
            
            if dados_loja and dados_loja.get("endereco_id"):
                endereco_id = dados_loja["endereco_id"]
                self.client.table("enderecos").update(dados_end).eq("id", endereco_id).execute()
            else:
                resposta_end = self.client.table("enderecos").insert(dados_end).execute()
                if resposta_end.data:
                    endereco_id = resposta_end.data[0]["id"]
                    
        dados_loja_db = {
            "id": loja.id,
            "nome": loja.nome,
            "descricao": loja.descricao,
            "usuario_proprietario_id": loja.usuario_proprietario_id,
            "tabloide_ofertas": loja.tabloide_ofertas,
            "endereco_id": endereco_id
        }
        self.client.table("lojas").upsert(dados_loja_db).execute()

    def _mapear_para_entidade(self, dados: dict) -> Loja:
        endereco_vo = None
        if dados.get("enderecos"):
            e = dados["enderecos"]
            endereco_vo = Endereco(
                rua=e["rua"],
                numero=e["numero"],
                complemento=e.get("complemento"),
                bairro=e["bairro"],
                cidade=e["cidade"],
                estado=e["estado"],
                cep=e["cep"],
                latitude=float(e["latitude"]),
                longitude=float(e["longitude"])
            )
            
        return Loja(
            id=dados["id"],
            nome=dados["nome"],
            descricao=dados.get("descricao"),
            usuario_proprietario_id=dados["usuario_proprietario_id"],
            endereco=endereco_vo,
            tabloide_ofertas=dados.get("tabloide_ofertas", [])
        )
