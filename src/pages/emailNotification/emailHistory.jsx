import React, { useEffect, useMemo, useState } from 'react';
import {
  History,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export const AlertsHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]); // optional, for rule name fallback
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Date range (default: last 24h)
  const now = useMemo(() => new Date(), []);
  const twentyFourHoursAgo = useMemo(() => new Date(Date.now() - 24 * 60 * 60 * 1000), []);
  const [from, setFrom] = useState(toLocalInputValue(twentyFourHoursAgo));
  const [to, setTo] = useState(toLocalInputValue(now));

  // Sorting & pagination
  const [sortBy, setSortBy] = useState({ key: 'occurredAt', dir: 'desc' }); // 'asc' | 'desc'
  const [page, setPage] = useState(1);
  const pageSize = 25; // fixed page size as requested minimal UI

  const rulesMap = useMemo(() => {
    const m = new Map();
    rules.forEach(r => m.set(r.id, r));
    return m;
  }, [rules]);

  const fetchRules = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/emailNotification/rules`);
      const rulesArray=res.data?.rules || []
      setRules(rulesArray);
      const historyArray = rulesArray.map(rule => ({
    name: rule.name,
    history: rule.history,
    emailRecipients: rule.emails,
    subject: rule.subject
    }));
    setAlerts(historyArray);
    } catch (e) {
      // Non-blocking for history view
      console.warn('Failed to load rules list:', e?.message || e);
    }finally{
      setLoading(false)
    }
  };

  const refresh = async () => {
    await Promise.all([fetchRules()]);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Derivations ----
  const normalizedAlerts = useMemo(() => {
    // Normalize common field name variants so the UI is resilient
    return alerts.map(a => {
      const ruleName =
        a.ruleName ||
        a.rule?.name ||
        rulesMap.get(a.ruleId)?.name ||
        '—';
      const tagName =
        a.tagName ||
        a.tag?.name ||
        a.variable?.name ||
        a.variableName ||
        '—';
      const value =
        a.value ?? a.currentValue ?? a.reading ?? '—';
      const occurredAt =
        a.occurredAt || a.timestamp || a.createdAt || a.time || null;
      const occurredDate = occurredAt ? new Date(occurredAt) : null;

      return {
        id: a.id ?? `${ruleName}-${tagName}-${occurredAt}-${Math.random()}`,
        ruleId: a.ruleId ?? a.rule?.id,
        ruleName,
        tagName,
        value,
        occurredAt,
        occurredDate,
        raw: a,
      };
    });
  }, [alerts, rulesMap]);

  // Only date filtering (no search / rule filters)
  const filtered = useMemo(() => {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    return normalizedAlerts.filter(a => {
      let dateOk = true;
      if (a.occurredDate) {
        if (fromDate && a.occurredDate < fromDate) dateOk = false;
        if (toDate && a.occurredDate > toDate) dateOk = false;
      }
      return dateOk;
    });
  }, [normalizedAlerts, from, to]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortBy.dir === 'asc' ? 1 : -1;

      switch (sortBy.key) {
        case 'ruleName':
          return dir * a.ruleName.localeCompare(b.ruleName);
        case 'tagName':
          return dir * a.tagName.localeCompare(b.tagName);
        case 'value': {
          const av = toNum(a.value);
          const bv = toNum(b.value);
          if (av === bv) return 0;
          return dir * (av < bv ? -1 : 1);
        }
        case 'occurredAt':
        default: {
          const at = a.occurredDate ? a.occurredDate.getTime() : 0;
          const bt = b.occurredDate ? b.occurredDate.getTime() : 0;
          if (at === bt) return 0;
          return dir * (at < bt ? -1 : 1);
        }
      }
    });
    return arr;
  }, [filtered, sortBy]);

  const total = sorted.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, lastPage);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // Reset to page 1 when date filters change
  useEffect(() => {
    setPage(1);
  }, [from, to]);

  // ---- Handlers ----
  const setSort = (key) => {
    setSortBy(prev => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: key === 'occurredAt' ? 'desc' : 'asc' };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-800">Alert History</h1>
          </div>

          {/* Top-right controls: ONLY date filter + refresh */}
          <div className="flex items-end gap-3">
            <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-lg p-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={fetchRules}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCcw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Alerts</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th
                    title="Rule"
                    active={sortBy.key === 'ruleName'}
                    dir={sortBy.dir}
                    onClick={() => setSort('ruleName')}
                  />
                  <Th
                    title="Tag"
                    active={sortBy.key === 'tagName'}
                    dir={sortBy.dir}
                    onClick={() => setSort('tagName')}
                  />
                  <Th
                    title="Value"
                    active={sortBy.key === 'value'}
                    dir={sortBy.dir}
                    onClick={() => setSort('value')}
                  />
                  <Th
                    title="Time"
                    active={sortBy.key === 'occurredAt'}
                    dir={sortBy.dir}
                    onClick={() => setSort('occurredAt')}
                  />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <SkeletonRows />
                ) : err ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span>{err}</span>
                      </div>
                    </td>
                  </tr>
                ) : pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-500">
                      No alerts found for selected date range.
                    </td>
                  </tr>
                ) : (
                  pageSlice.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                        {a.ruleName}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <TagIcon className="w-4 h-4 text-gray-500" />
                          <span className="truncate max-w-[240px] inline-block align-middle">{a.tagName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                        {formatValue(a.value)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {a.occurredDate ? (
                          <time title={a.occurredDate.toISOString()}>
                            {a.occurredDate.toLocaleString()}
                          </time>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {total === 0
                ? '0 results'
                : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                    currentPage * pageSize,
                    total
                  )} of ${total}`}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <div className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </div>
              </button>
              <div className="text-sm text-gray-700">
                Page {currentPage} / {lastPage}
              </div>
              <button
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage}
              >
                <div className="flex items-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ---------- Small presentational pieces ---------- */

const Th = ({ title, active, dir, onClick }) => (
  <th
    scope="col"
    className="px-4 py-3 text-left font-semibold text-gray-700 select-none"
  >
    <button
      className={`inline-flex items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-700'}`}
      onClick={onClick}
      title={`Sort by ${title}`}
    >
      {title}
      <span className={`text-xs ${active ? 'opacity-100' : 'opacity-40'}`}>
        {active ? (dir === 'asc' ? '▲' : '▼') : '▲'}
      </span>
    </button>
  </th>
);

const SkeletonRows = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-48" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-40" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-24" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-56" />
        </td>
      </tr>
    ))}
  </>
);

/* ---------- Helpers ---------- */

function toLocalInputValue(date) {
  // Returns YYYY-MM-DDTHH:mm for datetime-local
  const pad = n => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

function formatValue(v) {
  if (typeof v === 'number') return v;
  const n = Number(v);
  if (!Number.isNaN(n) && Number.isFinite(n)) return n;
  return String(v ?? '—');
}
