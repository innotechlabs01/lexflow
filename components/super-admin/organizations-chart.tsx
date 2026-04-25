'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface OrganizationsChartProps {
  data: { date: string; count: number }[]
  period: 'week' | 'month' | 'year'
  setPeriod: (period: 'week' | 'month' | 'year') => void
  onNavigate: (direction: 'prev' | 'next') => void
  currentLabel: string
}

export function OrganizationsChart({ data, period, setPeriod, onNavigate, currentLabel }: OrganizationsChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (period === 'week') {
      return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
    }
    if (period === 'month') {
      return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
    }
    return date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
  }

  return (
    <div className="space-y-4">
      {/* Navigation and Period Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('prev')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{currentLabel}</span>
          </div>
          
          <button
            onClick={() => onNavigate('next')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Siguiente"
            disabled={period === 'week'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              period === 'week'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              period === 'month'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              period === 'year'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Año
          </button>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {data.length > 10 ? (
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                labelFormatter={(date) => new Date(date).toLocaleDateString('es-CO')}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#004ac6" 
                strokeWidth={2}
                dot={{ fill: '#004ac6', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                labelFormatter={(date) => new Date(date).toLocaleDateString('es-CO')}
              />
              <Bar 
                dataKey="count" 
                fill="#004ac6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}