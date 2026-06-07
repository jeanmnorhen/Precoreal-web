from supabase import create_client, Client
from app.infraestrutura.configuracao import Configuracao
from app.dominio.repositorios.usuario_repositorio import UsuarioRepositorio
from app.dominio.repositorios.produto_repositorio import ProdutoRepositorio
from app.dominio.repositorios.loja_repositorio import LojaRepositorio
from app.dominio.repositorios.anuncio_repositorio import AnuncioRepositorio
from app.dominio.repositorios.compra_repositorio import CompraRepositorio

from app.adaptadores.banco.supabase_usuario_repositorio import SupabaseUsuarioRepositorio
from app.adaptadores.banco.supabase_produto_repositorio import SupabaseProdutoRepositorio
from app.adaptadores.banco.supabase_loja_repositorio import SupabaseLojaRepositorio
from app.adaptadores.banco.supabase_anuncio_repositorio import SupabaseAnuncioRepositorio
from app.adaptadores.banco.supabase_compra_repositorio import SupabaseCompraRepositorio

from testes.repositorios_memoria import (
    MemoriaUsuarioRepositorio,
    MemoriaProdutoRepositorio,
    MemoriaLojaRepositorio,
    MemoriaAnuncioRepositorio,
    MemoriaCompraRepositorio
)

# Inicializar repositórios em memória para modo offline
_usuario_mem = MemoriaUsuarioRepositorio()
_produto_mem = MemoriaProdutoRepositorio()
_loja_mem = MemoriaLojaRepositorio()
_anuncio_mem = MemoriaAnuncioRepositorio()
_compra_mem = MemoriaCompraRepositorio()

_modo_offline = False
_cliente_supabase = None

# Tentar inicializar o cliente Supabase se as chaves estiverem presentes
if Configuracao.SUPABASE_URL and Configuracao.SUPABASE_KEY:
    try:
        _cliente_supabase = create_client(Configuracao.SUPABASE_URL, Configuracao.SUPABASE_KEY)
        print("Conectado ao Supabase com sucesso.")
    except Exception as e:
        print(f"Erro ao conectar ao Supabase: {e}. Executando em modo OFFLINE.")
        _modo_offline = True
else:
    print("Credenciais do Supabase ausentes no arquivo .env. Executando em modo OFFLINE.")
    _modo_offline = True

def obter_usuario_repositorio() -> UsuarioRepositorio:
    if _modo_offline:
        return _usuario_mem
    return SupabaseUsuarioRepositorio(_cliente_supabase)

def obter_produto_repositorio() -> ProdutoRepositorio:
    if _modo_offline:
        return _produto_mem
    return SupabaseProdutoRepositorio(_cliente_supabase)

def obter_loja_repositorio() -> LojaRepositorio:
    if _modo_offline:
        return _loja_mem
    return SupabaseLojaRepositorio(_cliente_supabase)

def obter_anuncio_repositorio() -> AnuncioRepositorio:
    if _modo_offline:
        return _anuncio_mem
    return SupabaseAnuncioRepositorio(_cliente_supabase)

def obter_compra_repositorio() -> CompraRepositorio:
    if _modo_offline:
        return _compra_mem
    return SupabaseCompraRepositorio(_cliente_supabase)

def modo_offline_ativo() -> bool:
    return _modo_offline
