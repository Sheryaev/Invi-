const BASE = 'https://invest-public-api.tinkoff.ru/rest';

export function moneyToNumber(m: { units: string; nano: number } | undefined): number {
  if (!m) return 0;
  return Number(m.units) + m.nano / 1e9;
}

async function tinkoffPost<T>(
  service: string,
  method: string,
  body: object,
  token: string
): Promise<T> {
  const res = await fetch(
    `${BASE}/tinkoff.public.invest.api.contract.v1.${service}/${method}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`T-Invest API error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function getAccounts(token: string) {
  return tinkoffPost<any>('UsersService', 'GetAccounts', {}, token);
}

export async function getPortfolio(token: string, accountId: string) {
  return tinkoffPost<any>(
    'OperationsService',
    'GetPortfolio',
    { accountId, currency: 'RUB' },
    token
  );
}

export async function getDividends(token: string, figi: string) {
  const from = new Date(new Date().getFullYear() - 5, 0, 1).toISOString();
  const to = new Date(new Date().getFullYear() + 1, 0, 1).toISOString();
  return tinkoffPost<any>('InstrumentsService', 'GetDividends', { figi, from, to }, token);
}

export async function getLastPrices(token: string, figis: string[]) {
  return tinkoffPost<any>('MarketDataService', 'GetLastPrices', { figi: figis }, token);
}

export async function getInstrumentBy(token: string, figi: string) {
  return tinkoffPost<any>('InstrumentsService', 'GetInstrumentBy', {
    idType: 'INSTRUMENT_ID_TYPE_FIGI',
    id: figi,
  }, token);
}

export async function getOperations(token: string, accountId: string, from: string, to: string) {
  return tinkoffPost<any>('OperationsService', 'GetOperations', {
    accountId,
    from,
    to,
    state: 'OPERATION_STATE_EXECUTED',
  }, token);
}

export async function getCandles(token: string, figi: string, from: string, to: string) {
  return tinkoffPost<any>('MarketDataService', 'GetCandles', {
    figi,
    from,
    to,
    interval: 'CANDLE_INTERVAL_DAY',
  }, token);
}
