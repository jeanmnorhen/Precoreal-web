import pytest
from app.dominio.entidades.usuario import Usuario
from app.dominio.objetos_valor.endereco import Endereco

def test_criar_usuario_valido():
    endereco = Endereco(
        rua="Av Paulista",
        numero="1000",
        bairro="Bela Vista",
        cidade="São Paulo",
        estado="SP",
        cep="01310-100",
        latitude=-23.561,
        longitude=-46.655
    )
    usuario = Usuario(
        id="usr-123",
        nome="João Silva",
        email="joao@email.com",
        tipo="consumidor",
        saldo_creditos=10.0,
        quantidade_diamantes=5,
        endereco=endereco
    )
    assert usuario.id == "usr-123"
    assert usuario.nome == "João Silva"
    assert usuario.tipo == "consumidor"
    assert usuario.saldo_creditos == 10.0
    assert usuario.quantidade_diamantes == 5
    assert usuario.endereco == endereco

def test_usuario_tipo_invalido():
    with pytest.raises(ValueError, match="Tipo de usuário inválido"):
        Usuario(id="1", nome="A", email="a@a.com", tipo="admin")

def test_adicionar_creditos():
    usuario = Usuario(id="1", nome="A", email="a@a.com", tipo="lojista", saldo_creditos=10.0)
    usuario.adicionar_creditos(5.5)
    assert usuario.saldo_creditos == 15.5

def test_deduzir_creditos():
    usuario = Usuario(id="1", nome="A", email="a@a.com", tipo="lojista", saldo_creditos=10.0)
    usuario.deduzir_creditos(4.0)
    assert usuario.saldo_creditos == 6.0

def test_deduzir_creditos_insuficientes():
    usuario = Usuario(id="1", nome="A", email="a@a.com", tipo="lojista", saldo_creditos=5.0)
    with pytest.raises(ValueError, match="Saldo de créditos insuficiente"):
        usuario.deduzir_creditos(6.0)
