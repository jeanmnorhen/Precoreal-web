from typing import Optional
from supabase import Client
from app.dominio.entidades.usuario import Usuario
from app.dominio.objetos_valor.endereco import Endereco
from app.dominio.repositorios.usuario_repositorio import UsuarioRepositorio

class SupabaseUsuarioRepositorio(UsuarioRepositorio):
    def __init__(self, cliente_supabase: Client):
        self.client = cliente_supabase

    async def obter_por_id(self, id: str) -> Optional[Usuario]:
        # Nota: Usamos sync.execute() do cliente padrão do Supabase Python
        resposta = self.client.table("usuarios").select("*, enderecos(*)").eq("id", id).maybe_single().execute()
        dados = resposta.data
        if not dados:
            return None

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

        return Usuario(
            id=dados["id"],
            nome=dados["nome"],
            email=dados["email"],
            tipo=dados["tipo"],
            saldo_creditos=float(dados["saldo_creditos"]),
            quantidade_diamantes=int(dados["quantidade_diamantes"]),
            endereco=endereco_vo
        )

    async def salvar(self, usuario: Usuario) -> None:
        endereco_id = None
        if usuario.endereco:
            resposta_usr = self.client.table("usuarios").select("endereco_id").eq("id", usuario.id).maybe_single().execute()
            dados_usr = resposta_usr.data
            
            dados_end = usuario.endereco.para_dicionario()
            
            if dados_usr and dados_usr.get("endereco_id"):
                endereco_id = dados_usr["endereco_id"]
                self.client.table("enderecos").update(dados_end).eq("id", endereco_id).execute()
            else:
                resposta_end = self.client.table("enderecos").insert(dados_end).execute()
                if resposta_end.data:
                    endereco_id = resposta_end.data[0]["id"]
        
        dados_usuario = {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "tipo": usuario.tipo,
            "saldo_creditos": usuario.saldo_creditos,
            "quantidade_diamantes": usuario.quantidade_diamantes,
            "endereco_id": endereco_id
        }
        self.client.table("usuarios").upsert(dados_usuario).execute()
