'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { TrendingUp, AlertTriangle, AlertCircle, Sparkles, Calendar, CheckCircle, Clock, Wallet, ArrowUp, ArrowDown } from 'lucide-react'
import { theme } from '@/lib/theme'

const { colors: C, radius: R } = theme

const STATUS_RED   = '#EF4444'
const STATUS_AMBER = '#F59E0B'

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
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const incomeLast30 = incomeTransactions.filter(t => new Date(t.created_at) >= thirtyDaysAgo)
  const incomeLast14 = incomeTransactions.filter(t => new Date(t.created_at) >= fourteenDaysAgo)
  const avg3Months = (() => {
    const totals = [1, 2, 3].map(i => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      return incomeTransactions
        .filter(t => { const td = new Date(t.created_at); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() })
        .reduce((s, t) => s + t.amount, 0)
    })
    return totals.reduce((a, b) => a + b, 0) / 3
  })()

  const statusCashflow = incomeTransactions.length === 0
    ? { label: 'Mulai',   color: C.primary,    bg: C.primaryTint,       desc: 'Selesaikan proyek pertamamu untuk mulai melacak cashflow.', Icon: Sparkles       }
    : incomeLast30.length === 0
    ? { label: 'Kritis',  color: STATUS_RED,   bg: STATUS_RED + '18',   desc: 'Tidak ada pemasukan 30 hari terakhir. Yuk lamar proyek baru.', Icon: AlertCircle  }
    : incomeLast14.length === 0 || bulanIni < avg3Months
    ? { label: 'Waspada', color: STATUS_AMBER, bg: STATUS_AMBER + '18', desc: 'Belum ada pemasukan baru belakangan ini. Cek lamaran aktifmu.', Icon: AlertTriangle }
    : { label: 'Aman',    color: C.success,    bg: C.successTint,       desc: 'Ada pemasukan bulan ini. Terus pertahankan!', Icon: TrendingUp                }

  const CATEGORIES = ['Project', 'Desain Grafis', 'Web Development', 'Social Media', 'UI/UX Design', 'Penulisan', 'Lainnya']

  const inp = { width: '100%', padding: '10px 14px', backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.sm, color: C.textDark, fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }

  const statCards = [
    { label: 'Bulan Ini',      value: fmt(bulanIni),       color: C.primary,    iconBg: C.primaryTint,       Icon: Calendar    },
    { label: 'Sudah Cair',     value: fmt(totalCompleted), color: C.success,    iconBg: C.successTint,       Icon: CheckCircle },
    { label: 'Menunggu Cair',  value: fmt(totalPending),   color: STATUS_AMBER, iconBg: STATUS_AMBER + '18', Icon: Clock       },
    { label: 'Total Lifetime', value: fmt(totalLifetime),  color: C.primary,    iconBg: C.primaryTint,       Icon: TrendingUp  },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgWhite, fontFamily: theme.fonts.body, color: C.textDark }}>
      <style>{`
        @media (max-width: 767px) {
          .keu-stat-grid  { grid-template-columns: 1fr 1fr !important; }
          .keu-chart-grid { grid-template-columns: 1fr !important; }
          .keu-form-grid  { grid-template-columns: 1fr !important; }
          .keu-header     { flex-wrap: wrap; gap: 12px; }
        }
      `}</style>
      <Navbar />
      <div style={{ padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div className="keu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, marginBottom: '4px', color: C.textDark, fontFamily: theme.fonts.headline }}>Keuangan</h1>
            <p style={{ color: C.textMuted, fontSize: '14px', margin: 0 }}>Pantau pemasukan dan arus kasmu</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '10px 20px', backgroundColor: C.primary, color: 'white',
            border: 'none', borderRadius: R.sm, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>+ Catat Pemasukan</button>
        </div>

        {/* Form tambah transaksi */}
        {showForm && (
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.primary}`, borderRadius: R.md, padding: 'clamp(16px, 4vw, 24px)', marginBottom: '24px', boxShadow: theme.shadow.card }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: C.textDark }}>Catat Transaksi Baru</h3>
            <div className="keu-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: C.textMuted, display: 'block', marginBottom: '6px' }}>Deskripsi</label>
                <input style={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="cth: Desain logo klien A" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: C.textMuted, display: 'block', marginBottom: '6px' }}>Jumlah (Rp)</label>
                <input style={inp} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500000" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: C.textMuted, display: 'block', marginBottom: '6px' }}>Kategori</label>
                <select style={{ ...inp }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: C.textMuted, display: 'block', marginBottom: '6px' }}>Tipe</label>
                <select style={{ ...inp }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: R.sm, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: R.sm, fontSize: '14px', cursor: 'pointer' }}>
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="keu-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {statCards.map(s => (
            <div key={s.label} style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px', boxShadow: theme.shadow.card }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <s.Icon size={20} strokeWidth={1.5} color={s.color} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: s.color, marginBottom: '4px', fontFamily: theme.fonts.mono }}>{s.value}</div>
              <div style={{ color: C.textMuted, fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="keu-chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Chart */}
          <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '24px', boxShadow: theme.shadow.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.textDark, margin: 0 }}>Pemasukan 6 Bulan Terakhir</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
              {chartData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '10px', color: C.textMuted }}>
                    {d.total > 0 ? (d.total >= 1000000 ? (d.total/1000000).toFixed(1)+'jt' : (d.total/1000)+'rb') : ''}
                  </div>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    height: `${Math.max((d.total / maxChart) * 130, d.total > 0 ? 8 : 2)}px`,
                    backgroundColor: i === 5 ? C.primary : C.bgLavenderStrong,
                    transition: 'height 0.3s ease',
                    position: 'relative',
                  }} />
                  <div style={{ fontSize: '11px', color: C.textMuted }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status cashflow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px', boxShadow: theme.shadow.card }}>
              <h3 style={{ fontSize: '14px', color: C.textMuted, margin: '0 0 12px' }}>Status Cashflow</h3>
              <div style={{ backgroundColor: statusCashflow.bg, border: `1px solid ${statusCashflow.color}33`, borderRadius: R.sm, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <statusCashflow.Icon size={20} color={statusCashflow.color} strokeWidth={1.5} />
                  <div style={{ fontSize: '22px', fontWeight: 800, color: statusCashflow.color, fontFamily: theme.fonts.mono }}>{statusCashflow.label}</div>
                </div>
                <div style={{ fontSize: '13px', color: C.textMuted, textAlign: 'center' }}>{statusCashflow.desc}</div>
              </div>
            </div>
            <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, padding: '20px', boxShadow: theme.shadow.card }}>
              <h3 style={{ fontSize: '14px', color: C.textMuted, margin: '0 0 12px' }}>Proyeksi Bulan Depan</h3>
              <div style={{ fontSize: '22px', fontWeight: 800, color: C.primary, fontFamily: theme.fonts.mono }}>{fmt(totalPending)}</div>
              <div style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>dari {pending.length} proyek pending</div>
            </div>
          </div>
        </div>

        {/* Riwayat transaksi */}
        <div style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.border}`, borderRadius: R.md, overflow: 'hidden', boxShadow: theme.shadow.card }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.textDark, margin: 0 }}>Riwayat Transaksi</h2>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: C.textMuted }}>Memuat...</div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', opacity: 0.3 }}>
                <Wallet size={40} strokeWidth={1} color={C.textDark} />
              </div>
              <p>Belum ada transaksi. Catat pemasukan pertamamu!</p>
            </div>
          ) : transactions.map(t => (
            <div key={t.id} style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 36, height: 36, borderRadius: R.sm, backgroundColor: t.type === 'income' ? C.successTint : STATUS_RED + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.type === 'income'
                    ? <ArrowUp size={16} strokeWidth={2} color={C.success} />
                    : <ArrowDown size={16} strokeWidth={2} color={STATUS_RED} />
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: C.textDark }}>{t.description}</div>
                  <div style={{ color: C.textMuted, fontSize: '12px' }}>{t.category} · {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: t.type === 'income' ? C.success : STATUS_RED, fontFamily: theme.fonts.mono }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', backgroundColor: t.status === 'completed' ? C.successTint : STATUS_AMBER + '18', color: t.status === 'completed' ? C.success : STATUS_AMBER }}>
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
