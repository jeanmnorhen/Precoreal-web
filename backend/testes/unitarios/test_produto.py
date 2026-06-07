import pytest
from app.dominio.entidades.produto import Produto

def test_criar_produto_valido():
    produto = Produto(
        id="prod-1",
        nome="Arroz 5kg",
        categoria="Alimentos",
        preco=25.99,
        estoque=50
    )
    assert produto.id == "prod-1"
    assert produto.nome == "Arroz 5kg"
    assert produto.preco == 25.99
    assert produto.estoque == 50

def test_produto_preco_invalido():
    with pytest.raises(ValueError, match="O preço do produto não pode ser negativo"):
        Produto(id="1", nome="A", categoria="B", preco=-1.0)

def test_atualizar_preco():
    produto = Produto(id="1", nome="A", categoria="B", preco=10.0)
    produto.atualizar_preco(12.50)
    assert produto.preco == 12.50

def test_adicionar_estoque():
    produto = Produto(id="1", nome="A", categoria="B", preco=10.0, estoque=5)
    produto.adicionar_estoque(10)
    assert produto.estoque == 15

def test_remover_estoque():
    produto = Produto(id="1", nome="A", categoria="B", preco=10.0, estoque=10)
    produto.remover_estoque(4)
    assert produto.estoque == 6

def test_remover_estoque_insuficiente():
    produto = Produto(id="1", nome="A", categoria="B", preco=10.0, estoque=3)
    with pytest.raises(ValueError, match="Estoque insuficiente"):
        produto.remover_estoque(4)
