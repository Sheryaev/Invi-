'use client';
import { useState, useEffect } from 'react';
import type { Portfolio } from '@/types';

interface TinkoffAccount {
  id: string;
  name: string;
  type: string;
}

async function apiFetch(path: string, body: object, token: string) {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function useTinkoffPortfolio(token: string | null) {
  const [accounts, setAccounts] = useState<TinkoffAccount[]>([]);
  const [portfolioData, setPortfolioData] = useState<Partial<Portfolio> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setAccounts([]);
      setPortfolioData(null);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const acctData = await apiFetch('/api/tinkoff/accounts', {}, token!);
        if (cancelled) return;

        const accts: TinkoffAccount[] = (acctData.accounts || []).map((a: any) => ({
          id: a.id,
          name: a.name || 'Счёт ' + a.id.slice(-4),
          type: a.type,
        }));
        setAccounts(accts);

        if (accts.length === 0) { setLoading(false); return; }

        const firstAccountId = accts[0].id;
        const [portData, divData] = await Promise.all([
          apiFetch('/api/tinkoff/portfolio', { accountId: firstAccountId }, token!),
          apiFetch('/api/tinkoff/dividends', { accountId: firstAccountId }, token!).catch(() => null),
        ]);

        if (cancelled) return;

        const months = divData?.months || [];
        let paid = 0, announced = 0, forecast = 0;
        months.forEach((m: any) => { paid += m.paid || 0; announced += m.announced || 0; forecast += m.forecast || 0; });

        setPortfolioData({
          totalValue: portData.totalValue,
          invested: portData.invested,
          dayChange: portData.dayChange ?? 0,
          dayChangePct: portData.dayChangePct ?? 0,
          totalReturnPct: portData.totalReturnPct ?? 0,
          holdings: portData.holdings ?? [],
          gainers: portData.gainers ?? [],
          losers: portData.losers ?? [],
          months: months.length > 0 ? months : undefined,
          sum: { paid, announced, forecast, total: paid + announced + forecast },
          upcoming: divData?.upcoming ?? [],
        });
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [token]);

  return { accounts, portfolioData, loading, error };
}
