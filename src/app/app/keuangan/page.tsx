'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Transaction = {
  id: string
  amount: number
  type: string
  status: string
  description: string
  category: string
  created_at: string
}

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function KeuanganPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', category: 'Project', type: 'income' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/masuk'); return }
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.description || !form.amount) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('transactions').insert({
      user_id: user!.id,
      amount: parseInt(form.amount),
      type: form.type,
      status: 'completed',
      description: form.description,
      category: form.category,
    })
    setForm({ description: '', amount: '', category: 'Project', type: 'income' })
    setShowForm(false)
    setSaving(false)
    loadData()
  }

  // Hitung stats
  const completed = transactions.filter(t => t.status === 'completed' && t.type === 'income')
  const pending = transactions.filter(t => t.status === 'pending' && t.type === 'income')
  const totalCompleted = completed.reduce((s, t) => s + t.amount, 0)
  const totalPending = pending.reduce((s, t) => s + t.amount, 0)
  const totalLifetime = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  // Bulan ini
  const now = new Date()
  const bulanIni = transactions.filter(t => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'income'
  }).reduce((s, t) => s + t.amount, 0)

  // Chart data — 6 bulan terakhir
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const m = d.getMonth()
    const y = d.getFullYear()
    const total = transactions
      .filter(t => { const td = new Date(t.created_at); return td.getMonth() === m && td.getFullYear() === y && t.type === 'income' && t.status === 'completed' })
      .reduce((s, t) => s + t.amount, 0)
    return { label: MONTHS[m], total }
  })
  const maxChart = Math.max(...chartData.map(d => d.total), 1)

  // Status cashflow
  const statusCashflow = bulanIni >= 1000000 ? { label: 'Aman', color: '#10B981', bg: '#152d1e' }
    : bulanIni >= 500000 ? { label: 'Waspada', color: '#FBBF24', bg: '#2a2a00' }
    : { label: 'Kritis', color: '#EF4444', bg: '#2d1515' }

  const CATEGORIES = ['Project', 'Desain Grafis', 'Web Development', 'Social Media', 'UI/UX Design', 'Penulisan', 'Lainnya']

  const inp = { width: '100%', padding: '10px 14px', backgroundColor: '#0A0E1A', border: '1px solid #1e2d4a', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', fontFamily: 'sans-serif', color: 'white' }}>
      <Navbar />
      <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>Keuangan</h1>
            <p style={{ color: '#8892a4', fontSize: '14px' }}>Pantau pemasukan dan arus kasmu</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'
          }}>+ Catat Pemasukan</button>
        </div>

        {/* Form tambah transaksi */}
        {showForm && (
          <div style={{ backgroundColor: '#131929', border: '1px solid #4F6EF7', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Catat Transaksi Baru</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#8892a4', display: 'block', marginBottom: '6px' }}>Deskripsi</label>
                <input style={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="cth: Desain logo klien A" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8892a4', display: 'block', marginBottom: '6px' }}>Jumlah (Rp)</label>
                <input style={inp} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500000" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8892a4', display: 'block', marginBottom: '6px' }}>Kategori</label>
                <select style={{ ...inp }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8892a4', display: 'block', marginBottom: '6px' }}>Tipe</label>
                <select style={{ ...inp }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', backgroundColor: '#4F6EF7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#8892a4', border: '1px solid #1e2d4a', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Bulan Ini', value: fmt(bulanIni), color: '#4F6EF7', icon: '📅' },
            { label: 'Sudah Cair', value: fmt(totalCompleted), color: '#10B981', icon: '✅' },
            { label: 'Menunggu Cair', value: fmt(totalPending), color: '#FBBF24', icon: '⏳' },
            { label: 'Total Lifetime', value: fmt(totalLifetime), color: '#22D3EE', icon: '💰' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ color: '#8892a4', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Chart */}
          <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Pemasukan 6 Bulan Terakhir</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
              {chartData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '10px', color: '#8892a4' }}>
                    {d.total > 0 ? (d.total >= 1000000 ? (d.total/1000000).toFixed(1)+'jt' : (d.total/1000)+'rb') : ''}
                  </div>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    height: `${Math.max((d.total / maxChart) * 130, d.total > 0 ? 8 : 2)}px`,
                    backgroundColor: i === 5 ? '#4F6EF7' : '#1e2d4a',
                    transition: 'height 0.3s ease',
                    position: 'relative',
                  }} />
                  <div style={{ fontSize: '11px', color: '#8892a4' }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status cashflow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#8892a4', marginBottom: '12px' }}>Status Cashflow</h3>
              <div style={{ backgroundColor: statusCashflow.bg, border: `1px solid ${statusCashflow.color}`, borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: statusCashflow.color }}>{statusCashflow.label}</div>
                <div style={{ fontSize: '12px', color: '#8892a4', marginTop: '4px' }}>Bulan ini</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#8892a4', marginBottom: '12px' }}>Proyeksi Bulan Depan</h3>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#8B5CF6' }}>{fmt(totalPending)}</div>
              <div style={{ fontSize: '12px', color: '#8892a4', marginTop: '4px' }}>dari {pending.length} proyek pending</div>
            </div>
          </div>
        </div>

        {/* Riwayat transaksi */}
        <div style={{ backgroundColor: '#131929', border: '1px solid #1e2d4a', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2d4a' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Riwayat Transaksi</h2>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8892a4' }}>Memuat...</div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#8892a4' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💸</div>
              <p>Belum ada transaksi. Catat pemasukan pertamamu!</p>
            </div>
          ) : transactions.map(t => (
            <div key={t.id} style={{ padding: '16px 24px', borderBottom: '1px solid #0d1526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: t.type === 'income' ? '#152d1e' : '#2d1515', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {t.type === 'income' ? '↑' : '↓'}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{t.description}</div>
                  <div style={{ color: '#8892a4', fontSize: '12px' }}>{t.category} · {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', backgroundColor: t.status === 'completed' ? '#152d1e' : '#2a2a00', color: t.status === 'completed' ? '#10B981' : '#FBBF24' }}>
                  {t.status === 'completed' ? 'Sudah cair' : 'Menunggu'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
