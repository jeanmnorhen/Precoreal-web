"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geohash = void 0;
class Geohash {
    static BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    /**
     * Codifica coordenadas latitude/longitude em uma string Geohash
     */
    static encode(latitude, longitude, precision = 5) {
        let isEven = true;
        let latMin = -90, latMax = 90;
        let lonMin = -180, lonMax = 180;
        let geohash = '';
        let bit = 0;
        let ch = 0;
        while (geohash.length < precision) {
            let mid;
            if (isEven) {
                mid = (lonMin + lonMax) / 2;
                if (longitude > mid) {
                    ch |= 1 << (4 - bit);
                    lonMin = mid;
                }
                else {
                    lonMax = mid;
                }
            }
            else {
                mid = (latMin + latMax) / 2;
                if (latitude > mid) {
                    ch |= 1 << (4 - bit);
                    latMin = mid;
                }
                else {
                    latMax = mid;
                }
            }
            isEven = !isEven;
            if (bit < 4) {
                bit++;
            }
            else {
                geohash += this.BASE32[ch];
                bit = 0;
                ch = 0;
            }
        }
        return geohash;
    }
    /**
     * Obtém a lista dos 9 Geohashes (o central mais os 8 vizinhos) para evitar o efeito de borda
     */
    static get9Neighbors(latitude, longitude) {
        // Para precisão 5, o tamanho da célula é de aproximadamente 4.89 km x 4.89 km
        // correspondente a 0.043945 graus em latitude e longitude
        const latStep = 0.043945;
        const lonStep = 0.043945;
        const hashes = [];
        const offsets = [-1, 0, 1];
        for (const dLat of offsets) {
            for (const dLon of offsets) {
                const hash = this.encode(latitude + dLat * latStep, longitude + dLon * lonStep, 5);
                if (!hashes.includes(hash)) {
                    hashes.push(hash);
                }
            }
        }
        return hashes;
    }
}
exports.Geohash = Geohash;
