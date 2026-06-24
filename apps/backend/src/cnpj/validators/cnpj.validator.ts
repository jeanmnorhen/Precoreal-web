export function validarCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/[^\d]/g, '');

  if (digits.length !== 14) return false;

  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigito = (base: string, pesos: number[]): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digito1 = calcDigito(digits.slice(0, 12), pesos1);
  if (digito1 !== parseInt(digits[12], 10)) return false;

  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digito2 = calcDigito(digits.slice(0, 13), pesos2);
  if (digito2 !== parseInt(digits[13], 10)) return false;

  return true;
}
