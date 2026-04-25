import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShoppingBag, TrendingUp, Receipt, AlertTriangle, ArrowRight,
  RefreshCw, Plus, Package, Eye, DollarSign
} from 'lucide-react';
import '../retail.css';

// Sub-component for KPI Card (Top Row)
// Modified for Horizon UI Style
const KpiCard = ({ title, value, trend, trendType, icon: Icon, color }) => (
  <div className="horizon-kpi">
    <div className="horizon-kpi__icon-wrap" style={{ background: 'var(--airy-bg)' }}>
      <Icon size={24} style={{ color: 'var(--horizon-primary)' }} />
    </div>
    <div className="horizon-kpi__content">
      <span className="horizon-kpi__title">{title}</span>
      <h3 className="horizon-kpi__value">{value}</h3>
      {trend && (
        <span className={`text-[10px] font-700 ${trendType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trendType === 'up' ? '↑' : '↓'} {trend} <span className="text-slate-400 font-500">since last month</span>
        </span>
      )}
    </div>
  </div>
);

// Sub-component for Product Card (Bottom Row)
const ProductCard = ({ product, sales, price, progress }) => (
  <div className="airy-product-card">
    <img 
      src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80&idx=${product.id}`} 
      alt={product.name} 
      className="airy-product-thumb" 
    />
    <h4 className="font-600 text-xs mb-1 truncate">{product.name}</h4>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-700 text-primary-600">Rp {Number(price).toLocaleString('id-ID')}</span>
      <span className="text-[10px] font-500 text-muted">{sales} sales</span>
    </div>
    <div className="airy-progress-bar">
      <div className="airy-progress-fill" style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000;

export default function RetailDashboard() {
  const [data, setData] = useState(_cache || null);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    const now = Date.now();
    if (_cache && (now - _cacheTime) < CACHE_TTL) {
      setData(_cache); setLoading(false); return;
    }
    api.get('/retail/reports').then(res => {
        const sanitizedData = {
          total_sales: res.data?.total_sales || 0,
          total_transactions: res.data?.total_transactions || 0,
          transactions: res.data?.transactions || [],
          top_products: res.data?.top_products || [],
          low_stock: res.data?.low_stock || []
        };
        _cache = sanitizedData; 
        _cacheTime = Date.now(); 
        setData(sanitizedData); 
        setLoading(false); 
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) return (
    <div className="page-content">
      <div className="loading-state-premium">
        <div className="spinner-glow"></div>
        <p className="loading-text">Menyinkronkan dashboard airy...</p>
      </div>
    </div>
  );

  // Derived data for visuals
  const netSales = data.total_sales * 0.85; // Placeholder logic
  const totalVariants = 50 + (data.top_products.length * 5); // Placeholder
  
  const chartData = [
    { name: 'Nov', sales: 25000 }, { name: 'Dec', sales: 15000 },
    { name: 'Jan', sales: 18000 }, { name: 'Feb', sales: 35000 },
    { name: 'Mar', sales: 22000 }, { name: 'Apr', sales: 42000 },
  ];

  const pieData = [
    { name: 'Production', value: 50, color: 'var(--success-600)' },
    { name: 'Store', value: 20, color: 'var(--warning-500)' },
    { name: 'Stock', value: 30, color: 'var(--danger-500)' },
  ];

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Header Section */}
      <div className="page-header py-8" style={{ border: 'none' }}>
        <div>
          <h2 className="page-title">Main Dashboard</h2>
          <p className="text-sm font-500" style={{ color: 'var(--airy-text-light)' }}>Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={() => { _cache = null; window.location.reload(); }}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary px-8" style={{ background: 'var(--success-600)', border: 'none' }} onClick={() => window.location.href='/retail/pos'}>
            <Plus size={18} /> <span>Open POS</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="airy-kpi-grid">
        <KpiCard title="Total Sales" value={`Rp ${data.total_sales.toLocaleString('id-ID')}`} trend="0.5%" trendType="down" icon={DollarSign} />
        <KpiCard title="Total Order" value={data.total_transactions} trend="1.0%" trendType="up" icon={ShoppingBag} />
        <KpiCard title="Spend this month" value={`Rp ${netSales.toLocaleString('id-ID')}`} trend="1.0%" trendType="up" icon={Receipt} />
        <KpiCard title="Your Balance" value="Rp 1.24jt" trend="2.5%" trendType="down" icon={DollarSign} />
      </div>

      {/* Row 2: Charts & Deep Analysis */}
      <div className="airy-main-grid">
        {/* Statistics Card */}
        <div className="airy-card">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-2xl font-700 tracking-tight" style={{ color: 'var(--airy-text-bold)' }}>Rp 37.5jt</h3>
                <span className="text-xs font-500 text-slate-400">Total Revenue <span className="text-green-500 font-700">+2.45%</span></span>
             </div>
             <button className="p-3 rounded-xl text-primary-600" style={{ background: 'var(--airy-bg)' }}>
                <TrendingUp size={20} />
             </button>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--horizon-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--horizon-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500, fill: '#A3AED0'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: 'var(--airy-shadow)', padding: 12 }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--horizon-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Unit Donut */}
        <div className="airy-card flex flex-col items-center">
           <div className="w-full flex justify-between items-center mb-6">
              <h3 className="font-700 text-lg" style={{ color: 'var(--airy-text-bold)' }}>Stock Unit</h3>
           </div>
           <div style={{ position: 'relative', width: '100%', height: 200 }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span className="text-2xl font-700 block" style={{ color: 'var(--airy-text-bold)' }}>100%</span>
                <span className="text-[10px] font-500 text-slate-400 uppercase tracking-wider">Growth</span>
             </div>
           </div>
           <div className="flex gap-4 mt-8 flex-wrap justify-center">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                   <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }}></div>
                   <span className="text-[10px] font-700 text-slate-400">{d.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Row 3: Most Selling Products */}
      <div className="airy-card">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-700" style={{ color: 'var(--airy-text-bold)' }}>Most Selling Product</h3>
            <button className="font-700 text-sm" style={{ color: 'var(--horizon-primary)' }} onClick={()=>window.location.href='/retail/products'}>
               See all
            </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.top_products.slice(0,4).map((tp, idx) => (
              <ProductCard 
                key={idx} 
                product={tp.product} 
                sales={tp.total_qty} 
                price={tp.product?.price_sell || 400000} 
                progress={100 - (idx * 15)}
              />
            ))}
            {/* Pad with placeholders if few products */}
            {data.top_products.length < 4 && [1,2].map(i => (
              <ProductCard 
                key={`p-${i}`} 
                product={{ id: `p-${i}`, name: 'New Arrival Item' }} 
                sales={Math.floor(Math.random()*200)} 
                price={450000} 
                progress={40 + i*10} 
              />
            ))}
         </div>
      </div>
    </div>
  );
}
