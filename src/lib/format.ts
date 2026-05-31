export const fmt = {
  rub(n: number, opts: { sign?: boolean } = {}): string {
    const sign = opts.sign && n > 0 ? '+' : '';
    return sign + Math.round(n).toLocaleString('ru-RU') + ' ₽';
  },
  rubK(n: number, opts: { sign?: boolean } = {}): string {
    const sign = opts.sign && n > 0 ? '+' : '';
    return sign + Math.round(n).toLocaleString('ru-RU') + ' ₽';
  },
  pct(n: number, opts: { sign?: boolean } = {}): string {
    const sign = opts.sign && n > 0 ? '+' : '';
    return sign + n.toLocaleString('ru-RU') + '%';
  },
  rubFull(n: number, opts: { sign?: boolean } = {}): string {
    const sign = opts.sign && n > 0 ? '+' : '';
    return sign + Math.round(n).toLocaleString('ru-RU') + ' ₽';
  },
  price(n: number): string {
    const dec = Math.abs(n) >= 1000 ? 2 : 4;
    const s = n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: dec });
    return s + ' ₽';
  },
};
