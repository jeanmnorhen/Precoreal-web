from app.dominio.servicos.geolocalizacao import calcular_distancia_haversine

def test_calcular_distancia_mesmo_ponto():
    dist = calcular_distancia_haversine(-23.561, -46.655, -23.561, -46.655)
    assert dist == 0.0

def test_calcular_distancia_pontos_diferentes():
    # Distância aproximada entre MASP (São Paulo) e Cristo Redentor (Rio de Janeiro) é de cerca de 350-365km
    masp_lat, masp_lon = -23.561, -46.655
    cristo_lat, cristo_lon = -22.951, -43.210
    dist = calcular_distancia_haversine(masp_lat, masp_lon, cristo_lat, cristo_lon)
    assert 350.0 <= dist <= 365.0
