export const fmt = {
  rub(n: number, opts: { sign?: boolean } = {}): string {
    const sign = opts.sign && n > 0 ? '+' : '';
    return sign + '₽' + Math.round(n).toLocaleString('ru-RU');
  },
  rubK(n: number): string {
    if (Math.abs(n) >= 1e6) return '₽' + (n / 1e6).toFixed(2).replace('.', ',') + ' млн';
    if (Math.abs(n) >= 1e3) return '₽' + (n / 1e3).toFixed(1).replace('.', ',') + ' тыс';
    return '₽' + Math.round(n);
  },
  pct(n: number, opts: { sign?: boolean } = {}): string {
    const sign = opts.sign && n > 0 ? '+' : '';
    return sign + n.toLocaleString('ru-RU') + '%';
  },
  rubFull(n: number, opts: { sign?: boolean } = {}): string {
    const sign = opts.sign && n > 0 ? '+' : '';
    return sign + n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  },
  price(n: number): string {
    const dec = Math.abs(n) >= 1000 ? 2 : 4;
    const s = n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: dec });
    return s + ' ₽';
  },
};
