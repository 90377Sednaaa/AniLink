import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PageHeader, TelemetryCardSkeleton, CardSkeleton, EmptyState, Icon } from '../../shared/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart, PieChart, Pie, Cell, Legend } from 'recharts';

function Peso({ n }) {
  return <>{Number(n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</>;
}

const fmtPeso = (n) => Number(n ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'];

const CATEGORY_COLORS = ['#2E5339', '#4A7C59', '#D4A017', '#8A6A0A', '#6B8F71', '#1E3926'];

const STATUS_COLORS = {
  pending: '#D4A017',
  confirmed: '#4A7C59',
  preparing: '#4A7C59',
  ready: '#2E5339',
  delivered: '#2E5339',
  completed: '#2E5339',
  cancelled: '#B0413E',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return dateStr;
};

function KpiCard({ label, value, hint, tone = 'text-[#1A1A1A]', icon }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D6] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold tracking-widest uppercase text-[#8A8A8A]">{label}</div>
        <span className="w-9 h-9 rounded-xl bg-[#E8F0E9] text-[#2E5339] grid place-items-center shrink-0">
          <Icon name={icon} className="w-4 h-4" />
        </span>
      </div>
      <div className={`mt-2.5 text-2xl font-extrabold ${tone}`}>{value}</div>
      {hint && <div className="text-xs text-[#8A8A8A] mt-1.5">{hint}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E8E2D6] p-3 shadow-md rounded-xl">
        <p className="font-bold text-[#1A1A1A] mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-[#8A8A8A]">{entry.name}:</span>
            <span className="font-semibold text-[#1A1A1A]">
              {entry.name === 'GMV' ? fmtPeso(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: api.analytics,
  });

  const chartData = useMemo(() => {
    if (!data) return { composed: [], pie: [], topFarmers: [], statusBars: [], totalGmv: 0, maxFarmerGmv: 0 };

    const composed = (data.orders_by_day || []).map(d => ({
      date: formatDate(d.date),
      rawDate: d.date,
      Orders: Number(d.count || 0),
      GMV: Number(d.gmv || 0),
    }));

    const pie = (data.gmv_by_category || []).map(d => ({
      name: d.category,
      value: Number(d.gmv || 0),
    }));

    const totalGmv = pie.reduce((sum, curr) => sum + curr.value, 0);

    const statusBars = STATUS_FLOW.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      rawName: status,
      Orders: Number(data.by_status?.[status] || 0),
      fill: STATUS_COLORS[status] || '#E8E2D6',
    }));

    const topFarmers = data.top_farmers || [];
    const maxFarmerGmv = topFarmers.length > 0 ? Math.max(...topFarmers.map(f => Number(f.gmv || 0)), 1) : 1;

    return { composed, pie, topFarmers, statusBars, totalGmv, maxFarmerGmv };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform analytics" desc="Marketplace health at a glance — sales, active farmers, and the order queue." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TelemetryCardSkeleton count={4} />
        </div>
        <div className="space-y-6">
          <CardSkeleton rows={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton rows={4} />
            <CardSkeleton rows={4} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform analytics" desc="Marketplace health at a glance — sales, active farmers, and the order queue." />
        <div className="bg-white rounded-2xl border border-[#E8C6C6] p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FDEDEC] text-[#B0413E] mx-auto flex items-center justify-center mb-3 shadow-sm">
            <Icon name="alert" className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">Failed to load analytics</h3>
          <p className="text-sm text-[#8A8A8A] mt-1 max-w-md mx-auto">{error.message || 'There was an error fetching the analytics data.'}</p>
          <button
            onClick={() => refetch()}
            className="mt-5 px-6 py-2.5 rounded-xl bg-[#2E5339] text-white font-semibold text-sm hover:bg-[#24412D] transition shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { composed, pie, topFarmers, statusBars, totalGmv, maxFarmerGmv } = chartData;
  const statusHeight = Math.max(220, statusBars.length * 36 + 60);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform analytics"
        desc="Marketplace health at a glance — sales, active farmers, and the order queue."
      >
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 px-4 rounded-xl border border-[#E8E2D6] bg-white text-sm font-semibold hover:bg-[#FAF8F3] inline-flex items-center gap-2 disabled:opacity-60 transition shadow-sm"
        >
          <Icon name="refresh" className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="GMV (ex-cancelled)"
          value={<Peso n={data.gmv} />}
          hint={`${data.total_orders ?? 0} orders total`}
          icon="analytics"
          tone="text-[#2E5339]"
        />
        <KpiCard
          label="Active Farmers"
          value={data.active_farmers ?? 0}
          hint={`${data.pending_verifications ?? 0} pending verification${(data.pending_verifications ?? 0) !== 1 ? 's' : ''}`}
          icon="sprout"
          tone={(data.pending_verifications ?? 0) > 0 ? 'text-[#B0413E]' : 'text-[#1A1A1A]'}
        />
        <KpiCard
          label="Available Products"
          value={`${data.available_products ?? 0} / ${data.total_products ?? 0}`}
          hint={`${data.buyers ?? 0} buyers · ${data.total_users ?? 0} users`}
          icon="inventory"
        />
        <div className="bg-white rounded-2xl border border-[#E8E2D6] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#8A8A8A]">Orders by Status</div>
              <span className="w-9 h-9 rounded-xl bg-[#E8F0E9] text-[#2E5339] grid place-items-center shrink-0">
                <Icon name="orders" className="w-4 h-4" />
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {STATUS_FLOW.map(s => {
                const count = data.by_status?.[s] || 0;
                if (!count) return null;
                return (
                  <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-bold capitalize border border-[#E8E2D6] text-[#1A1A1A] bg-[#FAF8F3]">
                    {s} <span className="text-[#8A8A8A] ml-0.5">· {count}</span>
                  </span>
                );
              })}
              {Object.keys(data.by_status || {}).length === 0 && (
                <span className="text-xs text-[#8A8A8A]">No active orders</span>
              )}
            </div>
          </div>
          <div className="text-xs text-[#8A8A8A] mt-2">Pending → completed queue</div>
        </div>
      </div>

      {/* 7-Day GMV & Orders Chart */}
      <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Last 7 Days — Performance</h3>
            <p className="text-xs text-[#8A8A8A] mt-0.5">GMV sales volume (bars) and order count (gold line)</p>
          </div>
        </div>

        {composed.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={composed} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E8E2D6' }}
                  tick={{ fill: '#8A8A8A', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(val) => `₱${Number(val).toLocaleString('en-PH')}`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8A8A8A', fontSize: 11 }}
                  width={70}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#D4A017', fontSize: 11 }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FAF8F3' }} />
                <Bar yAxisId="left" dataKey="GMV" fill="#2E5339" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#D4A017" strokeWidth={3} dot={{ r: 4, fill: '#D4A017' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="analytics" title="No order activity yet" hint="Sales and order volume for the past 7 days will be charted here." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GMV by Category - Donut */}
        <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">GMV by Category</h3>
            <p className="text-xs text-[#8A8A8A] mt-0.5">Sales distribution across crop types</p>
          </div>

          {pie.length > 0 ? (
            <div className="relative h-[260px] my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => fmtPeso(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #E8E2D6', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                  <Legend verticalAlign="bottom" height={32} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <div className="text-[11px] font-medium text-[#8A8A8A]">Total GMV</div>
                <div className="text-sm font-extrabold text-[#2E5339]">{fmtPeso(totalGmv)}</div>
              </div>
            </div>
          ) : (
            <div className="py-6">
              <EmptyState icon="grid" title="No category sales recorded" hint="Category distribution appears once completed orders exist." />
            </div>
          )}
        </div>

        {/* Top Farmers */}
        <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Top Farmers by GMV</h3>
              <p className="text-xs text-[#8A8A8A] mt-0.5">Leading producers on the AniLink cooperative</p>
            </div>
          </div>

          {topFarmers.length > 0 ? (
            <div className="space-y-4">
              {topFarmers.map((farmer, idx) => {
                const rankBg = idx === 0 ? 'bg-[#D4A017] text-[#1A1A1A]' : idx === 1 ? 'bg-[#C5D9C7] text-[#2E5339]' : idx === 2 ? 'bg-[#E8F0E9] text-[#2E5339]' : 'bg-[#FAF8F3] text-[#8A8A8A] border border-[#E8E2D6]';
                const progressWidth = `${Math.min(100, (Number(farmer.gmv || 0) / maxFarmerGmv) * 100)}%`;

                return (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E8E2D6] flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${rankBg}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="font-semibold text-sm text-[#1A1A1A] truncate pr-2">{farmer.farmer || 'Unknown Farmer'}</h4>
                        <span className="font-bold text-sm text-[#2E5339] shrink-0">{fmtPeso(farmer.gmv)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#8A8A8A] mb-2">
                        <span className="truncate">{farmer.farm_name || 'Individual Farm'}</span>
                        <span className="shrink-0">{farmer.orders} order{Number(farmer.orders) === 1 ? '' : 's'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E8E2D6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2E5339] rounded-full transition-all duration-500" style={{ width: progressWidth }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6">
              <EmptyState icon="users" title="No farmer sales yet" hint="Top performing farmers will be ranked here by sales volume." />
            </div>
          )}
        </div>
      </div>

      {/* Orders by Status Horizontal BarChart */}
      <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1A1A1A]">Order Pipeline Distribution</h3>
        <p className="text-xs text-[#8A8A8A] mt-0.5 mb-4">Volume breakdown across all order lifecycle states</p>

        {statusBars.some(s => s.Orders > 0) ? (
          <div style={{ height: statusHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusBars}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" horizontal={true} vertical={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={{ stroke: '#E8E2D6' }} tick={{ fill: '#8A8A8A', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#1A1A1A', fontSize: 12, fontWeight: 600 }} width={90} />
                <Tooltip
                  cursor={{ fill: '#FAF8F3' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E8E2D6', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="Orders" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {statusBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="orders" title="No active orders" hint="Order volume by fulfillment stage will appear here." />
        )}
      </div>

      {/* AniPredict Banner */}
      <div className="bg-[#FFF4D6] border border-[#F2D98A] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#D4A017] text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-sm">
          <Icon name="star" className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-[#8A6A0A] text-sm">AniPredict — Market Intelligence</h4>
          <p className="text-xs text-[#8A6A0A] leading-5 mt-0.5">
            Historical price trends and seasonal demand forecasts will appear here as transaction volume grows, helping co-op managers balance supply and fair farmgate prices.
          </p>
        </div>
      </div>
    </div>
  );
}
