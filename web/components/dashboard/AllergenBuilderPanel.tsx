'use client'
import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AllergenDish } from '@/types'

interface Props {
  uid: string
  locationName?: string
  onToast: (msg: string) => void
}

const ALLERGENS = [
  { id: 'celery',      label: 'Celery',               emoji: '🌿' },
  { id: 'gluten',      label: 'Gluten',                emoji: '🌾' },
  { id: 'crustaceans', label: 'Crustaceans',           emoji: '🦐' },
  { id: 'eggs',        label: 'Eggs',                  emoji: '🥚' },
  { id: 'fish',        label: 'Fish',                  emoji: '🐟' },
  { id: 'lupin',       label: 'Lupin',                 emoji: '🌸' },
  { id: 'milk',        label: 'Milk',                  emoji: '🥛' },
  { id: 'molluscs',    label: 'Molluscs',              emoji: '🐚' },
  { id: 'mustard',     label: 'Mustard',               emoji: '🟡' },
  { id: 'nuts',        label: 'Tree nuts',             emoji: '🌰' },
  { id: 'peanuts',     label: 'Peanuts',               emoji: '🥜' },
  { id: 'sesame',      label: 'Sesame',                emoji: '⚫' },
  { id: 'soya',        label: 'Soya',                  emoji: '🫘' },
  { id: 'sulphites',   label: 'Sulphur dioxide',       emoji: '💧' },
]

const inputCls = 'w-full px-3 py-2.5 rounded-[9px] border border-[#e5e5ea] bg-[#f5f5f7] text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:bg-white transition-all'
const labelCls = 'block text-[11px] font-semibold text-[#1d1d1f] mb-1.5 uppercase tracking-wide'

function uid6() { return Math.random().toString(36).slice(2, 8) }

function blankDish(): AllergenDish {
  return { id: uid6(), name: '', description: '', allergens: [] }
}

export default function AllergenBuilderPanel({ uid, locationName, onToast }: Props) {
  const [dishes,      setDishes]      = useState<AllergenDish[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showMatrix,  setShowMatrix]  = useState(false)
  const [showModal,   setShowModal]   = useState(false)
  const [editDish,    setEditDish]    = useState<AllergenDish>(blankDish())
  const [isNew,       setIsNew]       = useState(true)
  const [saving,      setSaving]      = useState(false)
  const matrixRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setDishes(Array.isArray(d.allergenDishes) ? d.allergenDishes : [])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [uid])

  const saveDishes = async (next: AllergenDish[]) => {
    await updateDoc(doc(db, 'users', uid), { allergenDishes: next }).catch(() => {})
    setDishes(next)
  }

  const openAdd = () => { setEditDish(blankDish()); setIsNew(true); setShowModal(true) }
  const openEdit = (d: AllergenDish) => { setEditDish({ ...d, allergens: [...d.allergens] }); setIsNew(false); setShowModal(true) }

  const toggleAllergen = (id: string) =>
    setEditDish(p => ({ ...p, allergens: p.allergens.includes(id) ? p.allergens.filter(a => a !== id) : [...p.allergens, id] }))

  const handleSave = async () => {
    if (!editDish.name.trim()) { onToast('Please enter a dish name'); return }
    setSaving(true)
    const next = isNew
      ? [...dishes, editDish]
      : dishes.map(d => d.id === editDish.id ? editDish : d)
    await saveDishes(next)
    setSaving(false)
    setShowModal(false)
    onToast(isNew ? 'Dish added ✓' : 'Dish updated ✓')
  }

  const handleDelete = async (id: string) => {
    await saveDishes(dishes.filter(d => d.id !== id))
    onToast('Dish removed')
  }

  const handlePrint = () => {
    const el = matrixRef.current
    if (!el) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>Allergen Menu — ${locationName || 'Food Business'}</title>
    <style>
      body { font-family: -apple-system, sans-serif; padding: 24px; color: #1d1d1f; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      p.sub { color: #6e6e73; font-size: 12px; margin: 0 0 16px; }
      .note { font-size: 11px; color: #6e6e73; margin-bottom: 16px; padding: 8px 12px; background: #f5f5f7; border-radius: 6px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { text-align: center; padding: 6px 4px; border: 1px solid #e5e5ea; font-size: 10px; writing-mode: vertical-lr; transform: rotate(180deg); height: 80px; background: #f5f5f7; }
      th.dish-col { writing-mode: horizontal-tb; transform: none; height: auto; text-align: left; min-width: 140px; padding: 8px 10px; }
      td { padding: 6px 4px; border: 1px solid #e5e5ea; text-align: center; }
      td.dish-name { text-align: left; padding: 8px 10px; font-weight: 600; }
      td.dish-desc { font-size: 10px; color: #6e6e73; font-weight: normal; }
      .has { background: #ffebeb; color: #b80000; font-weight: bold; }
      .none { color: #d2d2d7; }
      @media print { body { padding: 12px; } }
    </style></head><body>`)
    w.document.write(el.innerHTML)
    w.document.write('</body></html>')
    w.document.close()
    w.print()
  }

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-40"><div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-5 flex-1">

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#a1a1a6]">Build your allergen matrix and generate a print-ready allergen menu for Owen&apos;s Law compliance.</p>
        <div className="flex gap-2 shrink-0">
          {dishes.length > 0 && (
            <>
              <button
                onClick={() => { setShowMatrix(v => !v) }}
                className={`px-3 py-2 rounded-[9px] text-[13px] font-medium border cursor-pointer transition-colors ${showMatrix ? 'bg-[#0071e3] text-white border-[#0071e3]' : 'bg-white text-[#6e6e73] border-[#e5e5ea] hover:bg-[#f5f5f7]'}`}
              >
                {showMatrix ? 'Dish list' : 'Allergen matrix'}
              </button>
              {showMatrix && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] border border-[#e5e5ea] text-[13px] text-[#6e6e73] font-medium bg-white hover:bg-[#f5f5f7] cursor-pointer transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print
                </button>
              )}
            </>
          )}
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0071e3] text-white rounded-[9px] text-[13px] font-semibold hover:bg-[#0058b0] transition-colors border-0 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add dish
          </button>
        </div>
      </div>

      {/* Owen's Law notice */}
      <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[12px] p-3.5 mb-4 text-[12px] text-[#78350f]">
        <strong>Owen&apos;s Law:</strong> Written allergen menus are expected to become mandatory for England under new legislation (anticipated 2027–2028). Building your allergen matrix now means you&apos;re ready — and it&apos;s already best practice under current FSA guidance.
      </div>

      {dishes.length === 0 ? (
        <div className="text-center py-14 bg-white border border-[#e5e5ea] rounded-[14px]">
          <div className="text-[32px] mb-2">🥗</div>
          <div className="text-[14px] font-medium text-[#6e6e73] mb-1">No dishes yet</div>
          <div className="text-[12px] text-[#a1a1a6] mb-4 max-w-[280px] mx-auto">Add your menu items and mark which of the 14 regulated allergens each contains.</div>
          <button onClick={openAdd} className="px-4 py-2 bg-[#0071e3] text-white border-0 rounded-[9px] text-[13px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors">
            Add first dish
          </button>
        </div>
      ) : showMatrix ? (
        /* Allergen matrix */
        <div>
          <div ref={matrixRef}>
            <h1>Allergen Information — {locationName || 'Our Menu'}</h1>
            <p className="sub">Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div className="note">
              If you have a food allergy or intolerance, please speak to a member of staff before ordering. Dishes are prepared in a kitchen that handles all 14 regulated allergens. While every care is taken, we cannot guarantee that any dish is completely free from allergens due to the risk of cross-contamination.
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th className="dish-col">Dish</th>
                    {ALLERGENS.map(a => <th key={a.id}>{a.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {dishes.map(dish => (
                    <tr key={dish.id}>
                      <td className="dish-name">
                        {dish.name}
                        {dish.description && <div className="dish-desc">{dish.description}</div>}
                      </td>
                      {ALLERGENS.map(a => (
                        <td key={a.id} className={dish.allergens.includes(a.id) ? 'has' : 'none'}>
                          {dish.allergens.includes(a.id) ? '●' : '○'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Dish list */
        <div className="flex flex-col gap-3">
          {dishes.map(dish => (
            <div key={dish.id} className="bg-white border border-[#e5e5ea] rounded-[14px] p-4">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <div className="text-[14px] font-bold text-[#1d1d1f]">{dish.name}</div>
                  {dish.description && <div className="text-[12px] text-[#a1a1a6] mt-0.5">{dish.description}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(dish)} className="text-[12px] text-[#0071e3] bg-transparent border-0 cursor-pointer font-medium hover:text-[#0058b0]">Edit</button>
                  <button onClick={() => handleDelete(dish.id)} className="text-[12px] text-[#ff3b30] bg-transparent border-0 cursor-pointer font-medium hover:text-[#b80000]">Remove</button>
                </div>
              </div>
              {dish.allergens.length === 0 ? (
                <span className="badge badge-green">No declared allergens</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {dish.allergens.map(id => {
                    const a = ALLERGENS.find(al => al.id === id)
                    return a ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(255,59,48,.08)] border border-[rgba(255,59,48,.2)] rounded-full text-[11px] font-semibold text-[#b80000]">
                        {a.emoji} {a.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[18px] w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea] sticky top-0 bg-white z-10">
              <span className="text-[15px] font-bold text-[#1d1d1f]">{isNew ? 'Add Dish' : 'Edit Dish'}</span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] border-0 cursor-pointer text-[14px] hover:bg-[#e5e5ea] transition-colors">✕</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Dish name *</label>
                <input className={inputCls} placeholder="e.g. Grilled Chicken Caesar Salad" value={editDish.name} onChange={e => setEditDish(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Description <span className="font-normal normal-case text-[#a1a1a6] tracking-normal">optional</span></label>
                <input className={inputCls} placeholder="Brief description of ingredients" value={editDish.description || ''} onChange={e => setEditDish(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Allergens present in this dish</label>
                <p className="text-[11px] text-[#a1a1a6] mb-3">Select all that apply, including trace amounts from shared equipment or cross-contamination risk.</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALLERGENS.map(a => (
                    <label key={a.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] cursor-pointer transition-colors border ${
                      editDish.allergens.includes(a.id)
                        ? 'border-[#ff3b30] bg-[rgba(255,59,48,.05)]'
                        : 'border-[#e5e5ea] hover:bg-[#f5f5f7]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={editDish.allergens.includes(a.id)}
                        onChange={() => toggleAllergen(a.id)}
                        className="w-4 h-4 accent-[#ff3b30] cursor-pointer"
                      />
                      <span className="text-[13px]">{a.emoji}</span>
                      <span className={`text-[12px] font-medium ${editDish.allergens.includes(a.id) ? 'text-[#b80000]' : 'text-[#1d1d1f]'}`}>{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#0071e3] text-white border-0 rounded-[10px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : isNew ? 'Add dish' : 'Save changes'}
                </button>
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-[#e5e5ea] rounded-[10px] text-[14px] text-[#6e6e73] cursor-pointer bg-white hover:bg-[#f5f5f7] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
