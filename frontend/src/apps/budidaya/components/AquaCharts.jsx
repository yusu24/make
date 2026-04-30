import React from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

/**
 * 4. INTERACTIVE CHARTS
 * Using Recharts to replace static SVG mocks.
 * Maintains existing color palette.
 */

// Custom Tooltip Style to match AquaGrow UI
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#FFFFFF',
        padding: '12px 16px',
        border: '1px solid #E9F0EC',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#1A1C1A', margin: '0 0 4px 0' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ fontSize: '13px', color: entry.color, margin: 0, fontWeight: '600' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AquaLineChart({ data }) {
  return (
    <div style={{ width: '100%', height: '240px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            name="Kolam A"
            type="monotone" 
            dataKey="kolamA" 
            stroke="#1B4332" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#1B4332', strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            name="Kolam B"
            type="monotone" 
            dataKey="kolamB" 
            stroke="#64748B" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AquaBarChart({ data }) {
  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <Tooltip cursor={{ fill: '#F8FAFC' }} content={<CustomTooltip />} />
          <Bar dataKey="val" radius={[8, 8, 4, 4]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isHighest ? '#1B4332' : '#C1F2D8'} />
            ))}
          </Bar>
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
            dy={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
