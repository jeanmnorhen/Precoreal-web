import { ValidationError } from '../errors';

export class Geolocalizacao {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}

  static create(latitude: number, longitude: number): Geolocalizacao {
    const erros = Geolocalizacao.validar(latitude, longitude);
    if (erros.length > 0) throw erros[0];
    return new Geolocalizacao(latitude, longitude);
  }

  static validar(latitude: number, longitude: number): ValidationError[] {
    const erros: ValidationError[] = [];
    if (latitude < -90 || latitude > 90) erros.push(new ValidationError('Latitude inválida', 'latitude'));
    if (longitude < -180 || longitude > 180) erros.push(new ValidationError('Longitude inválida', 'longitude'));
    return erros;
  }

  toWKT(): string {
    return `SRID=4326;POINT(${this.longitude} ${this.latitude})`;
  }

  static fromWKT(wkt: string): Geolocalizacao {
    const match = wkt.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    if (!match) throw new Error(`Formato WKT inválido: ${wkt}`);
    return new Geolocalizacao(parseFloat(match[2]), parseFloat(match[1]));
  }
}
