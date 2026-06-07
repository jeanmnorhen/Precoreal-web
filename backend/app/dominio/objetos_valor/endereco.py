from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class Endereco:
    rua: str
    numero: str
    bairro: str
    cidade: str
    estado: str
    cep: str
    latitude: float
    longitude: float
    complemento: Optional[str] = None

    def para_dicionario(self) -> dict:
        return {
            "rua": self.rua,
            "numero": self.numero,
            "complemento": self.complemento,
            "bairro": self.bairro,
            "cidade": self.cidade,
            "estado": self.estado,
            "cep": self.cep,
            "latitude": self.latitude,
            "longitude": self.longitude
        }
