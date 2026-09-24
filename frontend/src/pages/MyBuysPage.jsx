import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

/**
 * MyBuysPage — Full CRUD table for Bitcoin purchases.
 *
 * Props:
 *   purchases        {Array}    — current list of purchase objects
 *   onSaveEdit       {Function} — (updatedPurchase) => void  (App handles API + state)
 *   onDelete         {Function} — (id) => void               (App handles API + state)
 *   totalSpent       {number}   — total PHP Spent (purchases + historical)
 *   historicalSpent  {number}   — locked historical USD amount
 *   historicalBtc    {number}   — locked historical BTC amount
 */
export default function MyBuysPage({ purchases, onSaveEdit, onDelete, totalSpent, phpRate = 58.5 }) {

  // ── Edit state ──────────────────────────────────────────────────────────────
  // editId: the id of the row currently being edited (null = none)
  const [editId, setEditId] = useState(null);
  // editDraft: a shallow copy of the row under edit, mutated by inputs
  const [editDraft, setEditDraft] = useState({});

  // ── Delete / Confirm Dialog state ───────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const startEdit = (purchase) => {
    setEditId(purchase.id);
    setEditDraft({ ...purchase });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditDraft({});
  };

  const saveEdit = () => {
    const parsedUsd = parseFloat(editDraft.amountUsd);
    const parsedBtc = parseFloat(editDraft.receivedBtc);
    if (isNaN(parsedUsd) || parsedUsd <= 0 || isNaN(parsedBtc) || parsedBtc <= 0) return;

    const updated = {
      ...editDraft,
      amountUsd:   parsedUsd,
      receivedBtc: parsedBtc,
      // Recompute implied execution price from new values
      marketPrice: parsedUsd / parsedBtc,
    };

    // Delegate to App — it updates state AND syncs to the API
    onSaveEdit(updated);
    setEditId(null);
    setEditDraft({});
  };

  const requestDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    // Cancel any open edit if that row is being deleted
    if (editId === pendingDeleteId) cancelEdit();
    // Delegate to App — it updates state AND syncs to the API
    onDelete(pendingDeleteId);
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  // ── Shared input style ───────────────────────────────────────────────────────
  const inputCls =
    'w-full px-2 py-1.5 rounded-lg text-xs font-semibold text-brand-text-primary ' +
    'focus:outline-none focus:ring-1 transition-all ' +
    'placeholder-brand-text-tertiary';

  const inputStyle = {
    background: '#F4F5F7',
    border: '1px solid #E5E7EB',
    boxShadow: '0 0 0 0 transparent',
  };

  const inputFocusRing = { '--tw-ring-color': 'rgba(17,24,39,0.15)' };

  return (
    <>
      {/* ── Confirm Dialog ───────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Purchase?"
        message="This buy entry will be permanently removed from your ledger and portfolio calculations will update immediately. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* ── Main Card ────────────────────────────────────────────────────────── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 card-shadow">

        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-brand-text-primary tracking-tight">Full Buy History</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="px-4 py-2.5 bg-brand-bg-canvas border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary">
              Total Purchases: <span className="font-numeric text-sm whitespace-nowrap">{purchases.length}</span>
            </div>
            <div className="px-4 py-2.5 bg-brand-bg-canvas border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary">
              Total Invested: <span className="font-numeric text-sm whitespace-nowrap">{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-xs md:text-sm text-brand-text-tertiary font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-left whitespace-nowrap w-[16%]">Asset</th>
                <th className="py-3.5 px-4 text-left whitespace-nowrap w-[18%]">Date</th>
                <th className="py-3.5 px-4 text-left whitespace-nowrap w-[20%]">PHP Spent</th>
                <th className="py-3.5 px-4 text-left whitespace-nowrap w-[20%]">BTC Received</th>
                <th className="py-3.5 px-4 text-left whitespace-nowrap w-[18%]">Execution Price</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap w-[8%]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-border/60 text-xs md:text-sm font-semibold">

              {/* ── Dynamic purchase rows ─────────────────────────────────────── */}
              {purchases.map((purchase) => {
                const isEditing = editId === purchase.id;
                const displayPriceUsd = purchase.marketPrice
                  ? purchase.marketPrice
                  : purchase.receivedBtc > 0
                  ? (purchase.amountUsd / purchase.receivedBtc) / phpRate
                  : 0;

                return (
                  <tr
                    key={purchase.id}
                    className="group hover:bg-brand-bg-canvas/60 transition-colors"
                    style={isEditing ? { background: 'rgba(17,24,39,0.03)' } : {}}
                  >
                    {/* Asset column — always read-only */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-brand-bitcoin/10 flex items-center justify-center border border-brand-bitcoin/20 shrink-0">
                          <span className="text-xs font-bold text-brand-bitcoin">₿</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-text-primary">{purchase.asset}</span>
                          {purchase.isCustomRate && (
                            <span className="text-[9px] font-bold text-brand-bitcoin/80 uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                              <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Custom Rate
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDraft.date}
                          onChange={(e) => setEditDraft((d) => ({ ...d, date: e.target.value }))}
                          className={inputCls}
                          style={{ ...inputStyle, ...inputFocusRing, maxWidth: '110px' }}
                          placeholder="Oct 24, 2023"
                        />
                      ) : (
                        <span className="text-brand-text-secondary">{purchase.date}</span>
                      )}
                    </td>

                    {/* PHP Spent */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="relative" style={{ maxWidth: '100px' }}>
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-text-tertiary text-xs pointer-events-none">₱</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editDraft.amountUsd}
                            onChange={(e) => setEditDraft((d) => ({ ...d, amountUsd: e.target.value }))}
                            className={inputCls + ' pl-5'}
                            style={{ ...inputStyle, ...inputFocusRing }}
                          />
                        </div>
                      ) : (
                        <span className="text-brand-text-secondary">
                          <span className="font-numeric text-sm whitespace-nowrap">₱{purchase.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </span>
                      )}
                    </td>

                    {/* BTC Received */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="relative" style={{ maxWidth: '120px' }}>
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-bitcoin text-xs pointer-events-none font-bold">₿</span>
                          <input
                            type="number"
                            step="0.00000001"
                            min="0"
                            value={editDraft.receivedBtc}
                            onChange={(e) => setEditDraft((d) => ({ ...d, receivedBtc: e.target.value }))}
                            className={inputCls + ' pl-5'}
                            style={{ ...inputStyle, ...inputFocusRing }}
                          />
                        </div>
                      ) : (
                        <span className="text-brand-green font-numeric text-sm whitespace-nowrap">{purchase.receivedBtc.toFixed(5)}</span>
                      )}
                    </td>

                    {/* Execution Price — always derived, read-only */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-brand-text-secondary">
                          {isEditing
                            ? (() => {
                                const u = parseFloat(editDraft.amountUsd);
                                const b = parseFloat(editDraft.receivedBtc);
                                return u > 0 && b > 0
                                  ? <span className="font-numeric text-sm whitespace-nowrap">${Math.round((u / b) / phpRate).toLocaleString()} / BTC</span>
                                  : '—';
                              })()
                            : <span className="font-numeric text-sm whitespace-nowrap">${Math.round(displayPriceUsd).toLocaleString()} / BTC</span>}
                        </span>
                        {purchase.isCustomRate && !isEditing && (
                          <span className="text-[9px] text-brand-bitcoin/60 font-semibold">manual override</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        /* Save / Cancel */
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={saveEdit}
                            title="Save changes"
                            className="p-1.5 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                            style={{
                              background: 'rgba(5,150,105,0.08)',
                              border: '1px solid rgba(5,150,105,0.2)',
                              color: '#059669'
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            title="Discard changes"
                            className="p-1.5 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                            style={{
                              background: 'rgba(0,0,0,0.03)',
                              border: '1px solid #E5E7EB',
                              color: '#9CA3AF'
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* Edit / Delete — fade in on row hover */
                        <div className="inline-flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => startEdit(purchase)}
                            title="Edit this purchase"
                            className="p-1.5 hover:bg-brand-bg-canvas border border-transparent hover:border-brand-border rounded-lg text-brand-text-tertiary hover:text-brand-text-primary cursor-pointer transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => requestDelete(purchase.id)}
                            title="Delete this purchase"
                            className="p-1.5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-200 hover:bg-red-50 text-brand-text-tertiary hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}


              
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
