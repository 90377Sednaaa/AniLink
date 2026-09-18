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
  confirmed: '#2E5339',
  preparing: '#2E5339',
  ready: '#1E3926',
  delivered: '#1E3926',
  completed: '#1E3926',
  cancelled: '#B0413E'
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
          <Icon name={icon} className="w-4.5 h-4.5" />
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
      <div className="bg-white border border-[#E8E2D6] p-3 shadow-sm rounded-xl">
        <p className="font-bold text-[#1A1A1A] mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-[#8A8A8A]">{entry.name}:</span>
            <span className="font-medium text-[#1A1A1A]">
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
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/api/admin/analytics').then(res => res.data),
  });

  const chartData = useMemo(() => {
    if (!data) return { composed: [], pie: [], topFarmers: [], statusBars: [], totalGmv: 0, maxFarmerGmv: 0 };

    const composed = (data.orders_by_day || []).map(d => ({
      date: formatDate(d.date),
      rawDate: d.date,
      Orders: Number(d.count || 0),
      GMV: Number(d.gmv || 0)
    }));

    const pie = (data.gmv_by_category || []).map(d => ({
      name: d.category,
      value: Number(d.gmv || 0)
    }));
    
    const totalGmv = pie.reduce((sum, curr) => sum + curr.value, 0);

    const statusBars = STATUS_FLOW.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      rawName: status,
      Orders: Number(data.by_status?.[status] || 0),
      fill: STATUS_COLORS[status] || '#E8E2D6'
    }));

    const topFarmers = data.top_farmers || [];
    const maxFarmerGmv = topFarmers.length > 0 ? Math.max(...topFarmers.map(f => Number(f.gmv))) : 1;

    return { composed, pie, topFarmers, statusBars, totalGmv, maxFarmerGmv };
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Analytics" subtitle="Store performance and insights" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <TelemetryCardSkeleton count={4} />
        </div>
        <div className="space-y-8">
          <CardSkeleton rows={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CardSkeleton rows={4} />
            <CardSkeleton rows={4} />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Analytics" subtitle="Store performance and insights" />
        <EmptyState
          icon="alert-triangle"
          title="Failed to load analytics"
          message="There was an error fetching the analytics data. Please try again."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      </div>
    );
  }

  const { composed, pie, topFarmers, statusBars, totalGmv, maxFarmerGmv } = chartData;
  const statusHeight = Math.max(200, statusBars.length * 40 + 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader title="Analytics" subtitle="Store performance and insights" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Gross Merchandise Value"
          value={<Peso n={data.gmv} />}
          hint={`${data.total_orders} orders total`}
          icon="analytics"
          tone="text-[#2E5339]"
        />
        <KpiCard
          label="Active Farmers"
          value={data.active_farmers}
          hint={`${data.pending_verifications} pending verification${data.pending_verifications !== 1 ? 's' : ''}`}
          icon="sprout"
          tone={data.pending_verifications > 0 ? 'text-[#B0413E]' : 'text-[#1A1A1A]'}
        />
        <KpiCard
          label="Available Products"
          value={`${data.available_products}/${data.total_products}`}
          hint={`${data.buyers} buyers · ${data.total_users} total users`}
          icon="inventory"
        />
        <div className="bg-white rounded-2xl border border-[#E8E2D6] p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#8A8A8A]">Orders by Status</div>
            <span className="w-9 h-9 rounded-xl bg-[#E8F0E9] text-[#2E5339] grid place-items-center shrink-0">
              <Icon name="orders" className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map(s => {
                const count = data.by_status?.[s] || 0;
                if (!count) return null;
                return (
                  <span key={s} className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border border-[#E8E2D6] text-[#1A1A1A] bg-[#FAF8F3]">
                    {s} <span className="text-[#8A8A8A] ml-1">{count}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day GMV & Orders */}
      <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-[#1A1A1A]">7-Day Performance</h3>
        <p className="text-sm text-[#8A8A8A] mb-6">Gross Merchandise Value and Order Volume</p>

        {composed.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={composed} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8A8A8A', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(val) => `₱${(val/1000).toFixed(0)}k`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8A8A8A', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8A8A8A', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FAF8F3' }} />
                <Bar yAxisId="left" dataKey="GMV" fill="#2E5339" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#D4A017" strokeWidth={2.5} dot={{ r: 4, fill: '#D4A017' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="chart-bar" title="No data available" message="There are no orders in the last 7 days." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* GMV by Category - Donut */}
        <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A1A1A]">GMV by Category</h3>
          <p className="text-sm text-[#8A8A8A] mb-6">Sales distribution across product types</p>

          {pie.length > 0 ? (
            <div className="relative h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => fmtPeso(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #E8E2D6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <div className="text-xs text-[#8A8A8A]">Total GMV</div>
                <div className="text-sm font-bold text-[#1A1A1A]">{fmtPeso(totalGmv)}</div>
              </div>
            </div>
          ) : (
            <EmptyState icon="pie-chart" title="No sales recorded yet" message="Categories will appear here once sales are made." />
          )}
        </div>

        {/* Top Farmers */}
        <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Top Farmers</h3>
          <p className="text-sm text-[#8A8A8A] mb-6">Ranked by Gross Merchandise Value</p>

          {topFarmers.length > 0 ? (
            <div className="space-y-5">
              {topFarmers.map((farmer, idx) => {
                const isTop3 = idx < 3;
                const rankBg = idx === 0 ? 'bg-[#D4A017]' : idx === 1 ? 'bg-[#C0C0C0]' : idx === 2 ? 'bg-[#CD7F32]' : 'bg-[#F3F4F6]';
                const rankText = isTop3 ? 'text-white' : 'text-[#8A8A8A]';
                const progressWidth = `${(Number(farmer.gmv) / maxFarmerGmv) * 100}%`;

                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${rankBg} ${rankText}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="font-bold text-[#1A1A1A] truncate pr-2">{farmer.farmer}</h4>
                        <span className="font-bold text-[#2E5339] shrink-0">{fmtPeso(farmer.gmv)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#8A8A8A] mb-2">
                        <span>{farmer.farm_name}</span>
                        <span>{farmer.orders} orders</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E8F0E9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2E5339] rounded-full" style={{ width: progressWidth }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon="users" title="No farmers found" message="No farmer performance data available yet." />
          )}
        </div>
      </div>

      {/* Orders by Status Horizontal BarChart */}
      <div className="bg-white rounded-2xl border border-[#E8E2D6] p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-[#1A1A1A]">Orders by Status</h3>
        <p className="text-sm text-[#8A8A8A] mb-6">Current snapshot of order fulfillment</p>

        {statusBars.some(s => s.Orders > 0) ? (
          <div style={{ height: statusHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusBars}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D6" horizontal={true} vertical={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#8A8A8A', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#1A1A1A', fontSize: 12, fontWeight: 500 }} width={80} />
                <Tooltip
                  cursor={{ fill: '#FAF8F3' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E8E2D6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="Orders" radius={[0, 4, 4, 0]} maxBarSize={32}>
                  {statusBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="package" title="No active orders" message="Order volumes by status will appear here." />
        )}
      </div>

      {/* AniPredict Banner */}
      <div className="bg-[#FAF8F3] border border-[#D4A017]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
          <Icon name="star" className="w-5 h-5 text-[#D4A017]" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-[#1A1A1A]">AniPredict Insights</h4>
          <p className="text-sm text-[#8A8A8A] mt-1">Based on current trends, expect a 15% increase in vegetable orders next week. Consider notifying farmers to prepare stock.</p>
        </div>
      </div>
    </div>
  );
}
