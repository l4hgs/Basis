import { useState, useEffect } from 'react';
import { Check, Save, RefreshCw } from 'lucide-react';

/**
 * SettingsPage — persisted DCA plan + integration preferences.
 *
 * Props:
 *   dcaPlan  {Object}   — current plan from App state (API-backed)
 *   onSave   {Function} — (updatedPlan) => Promise<void>
 */
export default function SettingsPage({ dcaPlan, onSave }) {
  // Local draft — only committed on Save
  const [draft, setDraft]         = useState(dcaPlan);
  const [isSaving, setIsSaving]   = useState(false);
  const [savedOk, setSavedOk]     = useState(false);

  // Sync draft when parent plan changes (e.g., after API load)
  useEffect(() => { setDraft(dcaPlan); }, [dcaPlan]);

  const update = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedOk(false);
    await onSave(draft);
    setIsSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 3000);
  };

  // ── Shared input style ────────────────────────────────────────────────────
  const inputBase =
    'w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-text-primary ' +
    'bg-brand-bg-input border border-brand-border focus:outline-none ' +
    'focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/15 transition-all';

  const selectBase = inputBase + ' cursor-pointer appearance-none';

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* ── Row 1: Accumulation Rule + Integration ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Accumulation Rule */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 card-shadow">
          <h3 className="text-base font-bold text-brand-text-primary mb-5">Accumulation Rule</h3>

          <div className="space-y-4">

            {/* Frequency */}
            <div>
              <label className="block text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">
                Frequency
              </label>
              <div className="relative">
                <select
                  value={draft.frequency}
                  onChange={e => update('frequency', e.target.value)}
                  className={selectBase}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {/* Custom chevron */}
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-tertiary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">
                Target Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-tertiary font-bold text-sm pointer-events-none">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={draft.amount}
                  onChange={e => update('amount', parseFloat(e.target.value) || '')}
                  className={inputBase + ' pl-7'}
                  placeholder="500.00"
                />
              </div>
            </div>

            {/* Primary Asset — locked to BTC for now */}
            <div>
              <label className="block text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">
                Primary Asset
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand-bg-input border border-brand-border text-sm font-bold text-brand-text-primary select-none">
                <span className="text-brand-bitcoin font-bold">₿</span>
                Bitcoin (BTC)
                <span className="ml-auto text-[10px] font-bold text-brand-text-tertiary border border-brand-border rounded px-1.5 py-0.5 uppercase tracking-wider">Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-6 card-shadow">
          <h3 className="text-base font-bold text-brand-text-primary mb-5">Integration Settings</h3>

          <div className="space-y-4">

            {/* Auto-sync toggle */}
            <ToggleRow
              label="Auto-sync with Exchange API"
              description="Sync trades from Coinbase/Kraken weekly"
              checked={draft.autoSync}
              onChange={v => update('autoSync', v)}
            />

            {/* Email reports toggle */}
            <ToggleRow
              label="Email Reports"
              description="Receive monthly wealth summaries"
              checked={draft.emailReports}
              onChange={v => update('emailReports', v)}
            />

            {/* Wallet Key — editable */}
            <div>
              <label className="block text-xs font-bold text-brand-text-secondary uppercase tracking-wider mb-2">
                Wallet Public Key
              </label>
              <input
                type="text"
                value={draft.walletKey}
                onChange={e => update('walletKey', e.target.value)}
                placeholder="bc1q…"
                className={inputBase + ' font-mono text-xs'}
                spellCheck={false}
              />
              <p className="mt-1.5 text-[10px] text-brand-text-tertiary font-semibold">
                Read-only on-chain tracking. Never enter a private key.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save Bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-brand-bg-card border border-brand-border rounded-2xl px-6 py-4 card-shadow">
        <p className="text-xs text-brand-text-tertiary font-semibold">
          Changes are saved to your account and synced across sessions.
        </p>

        <div className="flex items-center gap-3 shrink-0">
          {/* Success toast */}
          {savedOk && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-brand-green animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer hover:bg-brand-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-accent-btn"
          >
            {isSaving
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              : <><Save className="w-3.5 h-3.5" /> Save Settings</>
            }
          </button>
        </div>
      </div>

    </form>
  );
}

// ─── Toggle row sub-component ─────────────────────────────────────────────────

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-brand-bg-canvas rounded-xl border border-brand-border">
      <div>
        <div className="text-xs font-bold text-brand-text-primary">{label}</div>
        <div className="text-[11px] text-brand-text-tertiary mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 ${
          checked ? 'bg-brand-accent' : 'bg-brand-border'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
