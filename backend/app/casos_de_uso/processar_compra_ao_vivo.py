from typing import List, Dict, Any, Optional
from app.dominio.repositorios.produto_repositorio import ProdutoRepositorio
from app.dominio.objetos_valor.item_compra import ItemCompra

class ProcessarCompraAoVivo:
    def __init__(self, produto_repo: ProdutoRepositorio):
        self.produto_repo = produto_repo

    async def identificar_produto_por_imagem_ou_codigo(self, codigo_ou_termo: str) -> Optional[Dict[str, Any]]:
        """
        Simula o reconhecimento de imagem ou escaneamento de código de barras.
        Se o código corresponder a um ID ou nome parcial de produto, retorna suas informações.
        """
        # Tenta buscar pelo ID exato
        produto = await self.produto_repo.obter_por_id(codigo_ou_termo)
        if produto:
            return produto.para_dicionario()
            
        # Caso contrário, busca por correspondência de nome parcial (simulando reconhecimento de rótulo)
        todos = await self.produto_repo.buscar_todos()
        for p in todos:
            if codigo_ou_termo.lower() in p.nome.lower():
                return p.para_dicionario()
        return None

    def calcular_total_carrinho(self, itens_carrinho: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcula o total acumulado do carrinho com base nos itens escaneados.
        Cada item deve conter: produto_id, quantidade, preco_unitario.
        """
        total = 0.0
        itens_processados = []
        for item in itens_carrinho:
            prod_id = item["produto_id"]
            qtd = item["quantidade"]
            preco_unitario = item["preco_unitario"]
            
            item_vo = ItemCompra(produto_id=prod_id, quantidade=qtd, preco_unitario=preco_unitario)
            total += item_vo.preco_total
            
            itens_processados.append({
                "produto_id": prod_id,
                "quantidade": qtd,
                "preco_unitario": preco_unitario,
                "preco_total": item_vo.preco_total
            })
            
        return {
            "itens": itens_processados,
            "preco_total": round(total, 2)
        }
