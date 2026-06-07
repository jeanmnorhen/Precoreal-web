from datetime import datetime
from typing import List, Optional
from supabase import Client
from app.dominio.entidades.compra import Compra
from app.dominio.objetos_valor.item_compra import ItemCompra
from app.dominio.objetos_valor.forma_pagamento import FormaPagamento
from app.dominio.objetos_valor.entrega import Entrega
from app.dominio.repositorios.compra_repositorio import CompraRepositorio

class SupabaseCompraRepositorio(CompraRepositorio):
    def __init__(self, cliente_supabase: Client):
        self.client = cliente_supabase

    async def obter_por_id(self, id: str) -> Optional[Compra]:
        resposta = self.client.table("compras").select("*, itens_compra(*)").eq("id", id).maybe_single().execute()
        dados = resposta.data
        if not dados:
            return None
        return self._mapear_para_entidade(dados)

    async def obter_por_comprador(self, usuario_comprador_id: str) -> List[Compra]:
        resposta = self.client.table("compras").select("*, itens_compra(*)").eq("usuario_comprador_id", usuario_comprador_id).execute()
        return [self._mapear_para_entidade(dados) for dados in resposta.data]

    async def salvar(self, compra: Compra) -> None:
        dados_compra = {
            "id": compra.id,
            "usuario_comprador_id": compra.usuario_comprador_id,
            "loja_vendedora_id": compra.loja_vendedora_id,
            "preco_total": compra.preco_total,
            "status_pedido": compra.status_pedido,
            "forma_pagamento_tipo": compra.forma_pagamento.tipo,
            "forma_pagamento_detalhes": compra.forma_pagamento.detalhes,
            "status_entrega": compra.dados_entrega.status,
            "data_entrega": compra.dados_entrega.data_entrega.isoformat() if compra.dados_entrega.data_entrega else None
        }
        self.client.table("compras").upsert(dados_compra).execute()
        
        # Sincroniza os itens da compra
        self.client.table("itens_compra").delete().eq("compra_id", compra.id).execute()
        
        itens_db = []
        for item in compra.itens:
            itens_db.append({
                "compra_id": compra.id,
                "produto_id": item.produto_id,
                "quantidade": item.quantidade,
                "preco_unitario": item.preco_unitario
            })
        if itens_db:
            self.client.table("itens_compra").insert(itens_db).execute()

    def _mapear_para_entidade(self, dados: dict) -> Compra:
        itens_vo = []
        for item in dados.get("itens_compra", []):
            itens_vo.append(
                ItemCompra(
                    produto_id=item["produto_id"],
                    quantidade=int(item["quantidade"]),
                    preco_unitario=float(item["preco_unitario"])
                )
            )
            
        forma_pgto = FormaPagamento(
            tipo=dados["forma_pagamento_tipo"],
            detalhes=dados.get("forma_pagamento_detalhes", {})
        )
        
        data_ent_str = dados.get("data_entrega")
        data_entrega = None
        if data_ent_str:
            data_entrega = datetime.fromisoformat(data_ent_str.replace("Z", "+00:00"))
            
        entrega = Entrega(
            status=dados["status_entrega"],
            data_entrega=data_entrega
        )
        
        return Compra(
            id=dados["id"],
            usuario_comprador_id=dados["usuario_comprador_id"],
            loja_vendedora_id=dados["loja_vendedora_id"],
            itens=itens_vo,
            status_pedido=dados["status_pedido"],
            forma_pagamento=forma_pgto,
            dados_entrega=entrega,
            preco_total=float(dados["preco_total"])
        )
