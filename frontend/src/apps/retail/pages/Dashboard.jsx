import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShoppingBag, TrendingUp, Receipt, AlertTriangle, ArrowRight,
  RefreshCw, Plus, Package, Eye, DollarSign
} from 'lucide-react';
import { useCore } from '../../../hooks/useCore';
import '../retail.css';

// Sub-component for KPI Card (Top Row)
const KpiCard = ({ title, value, trend, trendType, icon: Icon, color }) => (
  <div className="horizon-kpi">
    <div className="horizon-kpi__icon-wrap retail-bg-primary-subtle">
      <Icon size={24} className="retail-text-primary" />
    </div>
    <div className="horizon-kpi__content">
      <span className="retail-label">{title}</span>
      <h3 className="retail-kpi-value">{value}</h3>
      {trend && (
        <span className={`text-[10px] font-bold ${trendType === 'up' ? 'retail-text-success' : 'retail-text-danger'}`}>
          {trendType === 'up' ? '↑' : '↓'} {trend} <span className="retail-text-secondary">since last month</span>
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
    <h4 className="retail-card-title text-xs mb-1 truncate">{product.name}</h4>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-bold retail-text-primary">Rp {Number(price).toLocaleString('id-ID')}</span>
      <span className="text-[10px] font-medium retail-text-secondary">{sales} sales</span>
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
  const { getDashboard, loading: apiLoading } = useCore();
  const [data, setData] = useState(_cache || {
    total_sales: 0,
    total_transactions: 0,
    transactions: [],
    top_products: [],
    low_stock: []
  });
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    const now = Date.now();
    if (_cache && (now - _cacheTime) < CACHE_TTL) {
      setData(_cache); setLoading(false); return;
    }
    
    getDashboard().then(res => {
        if (!res) { setLoading(false); return; }
        const summary = res.summary || {};
        const sanitizedData = {
          total_sales: summary.income || 0,
          total_transactions: summary.income_count || 0,
          transactions: res.daily_stats || [],
          top_products: [], 
          low_stock: []
        };
        _cache = sanitizedData; 
        _cacheTime = Date.now(); 
        setData(sanitizedData); 
        setLoading(false); 
    }).catch(err => {
      console.error('Dashboard load failed:', err);
      setLoading(false);
    });
  }, [getDashboard]);

  if (loading) return (
    <div className="page-content">
      <div className="loading-state-premium">
        <div className="spinner-glow"></div>
        <p className="loading-text">Menyinkronkan dashboard airy...</p>
      </div>
    </div>
  );

  // Derived data for visuals
  const netSales = data.total_sales * 0.85; 
  
  const chartData = [
    { name: 'Nov', sales: 25000 }, { name: 'Dec', sales: 15000 },
    { name: 'Jan', sales: 18000 }, { name: 'Feb', sales: 35000 },
    { name: 'Mar', sales: 22000 }, { name: 'Apr', sales: 42000 },
  ];

  const pieData = [
    { name: 'Production', value: 50, color: 'var(--retail-success)' },
    { name: 'Store', value: 20, color: 'var(--retail-warning)' },
    { name: 'Stock', value: 30, color: 'var(--retail-danger)' },
  ];

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Header Section */}
      <div className="page-header py-4" style={{ border: 'none', justifyContent: 'flex-end' }}>
        <div className="flex gap-4">
          <button className="btn btn-secondary" onClick={() => { _cache = null; window.location.reload(); }}>
            <RefreshCw size={18} />
          </button>
          <button className="btn btn-primary px-8" style={{ background: 'var(--retail-success)', border: 'none' }} onClick={() => window.location.href='/retail/pos'}>
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
        <div className="airy-card">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="retail-title">Rp 37.5jt</h3>
                <span className="retail-label">Total Revenue <span className="retail-text-success font-bold">+2.45%</span></span>
             </div>
             <button className="p-3 rounded-xl retail-text-primary retail-bg-primary-subtle">
                <TrendingUp size={20} />
             </button>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--retail-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--retail-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500, fill: 'var(--retail-text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: 'var(--retail-shadow)', background: 'var(--retail-card-bg)', color: 'var(--retail-text-primary)', padding: 12 }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--retail-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="airy-card flex flex-col items-center">
           <div className="w-full flex justify-end items-center mb-6">
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
             <div className="retail-pie-center">
                <span className="retail-kpi-value">100%</span>
                <span className="retail-label">Growth</span>
             </div>
           </div>
           <div className="flex gap-4 mt-8 flex-wrap justify-center">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                   <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }}></div>
                   <span className="retail-label" style={{ fontSize: 10 }}>{d.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="airy-card">
         <div className="flex justify-end items-center mb-8">
            <button className="retail-label retail-text-primary font-bold hover:underline" onClick={()=>window.location.href='/retail/products'}>
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
            {data.top_products.length < 4 && [1,2,3,4].map(i => (
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
