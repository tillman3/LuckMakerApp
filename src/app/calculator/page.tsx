'use client';

import { useState } from 'react';
import Link from 'next/link';

const STATES: Record<string, { name: string; rate: number }> = {
  TX: { name: 'Texas', rate: 0 },
  CA: { name: 'California', rate: 0 }, // CA doesn't tax lottery
  FL: { name: 'Florida', rate: 0 },
  WA: { name: 'Washington', rate: 0 },
  WY: { name: 'Wyoming', rate: 0 },
  TN: { name: 'Tennessee', rate: 0 },
  SD: { name: 'South Dakota', rate: 0 },
  NH: { name: 'New Hampshire', rate: 0 },
  NV: { name: 'Nevada', rate: 0 },
  AK: { name: 'Alaska', rate: 0 },
  NY: { name: 'New York', rate: 0.109 },
  MD: { name: 'Maryland', rate: 0.0875 },
  DC: { name: 'Washington DC', rate: 0.0875 },
  NJ: { name: 'New Jersey', rate: 0.08 },
  OR: { name: 'Oregon', rate: 0.08 },
  MN: { name: 'Minnesota', rate: 0.0775 },
  WI: { name: 'Wisconsin', rate: 0.0765 },
  ID: { name: 'Idaho', rate: 0.058 },
  CO: { name: 'Colorado', rate: 0.044 },
  IL: { name: 'Illinois', rate: 0.0495 },
  PA: { name: 'Pennsylvania', rate: 0.0307 },
  MI: { name: 'Michigan', rate: 0.0425 },
  OH: { name: 'Ohio', rate: 0.04 },
  GA: { name: 'Georgia', rate: 0.055 },
  NC: { name: 'North Carolina', rate: 0.0475 },
  VA: { name: 'Virginia', rate: 0.0575 },
  MA: { name: 'Massachusetts', rate: 0.05 },
  AZ: { name: 'Arizona', rate: 0.0459 },
  IN: { name: 'Indiana', rate: 0.0305 },
  SC: { name: 'South Carolina', rate: 0.065 },
  other: { name: 'Other (5% est.)', rate: 0.05 },
};

const FEDERAL_RATE = 0.37;
const LUMP_SUM_FACTOR = 0.60;

export default function CalculatorPage() {
  const [jackpot, setJackpot] = useState('500000000');
  const [state, setState] = useState('TX');
  const [paymentType, setPaymentType] = useState<'lump' | 'annuity'>('lump');
  const [calculated, setCalculated] = useState(false);

  const jackpotNum = parseInt(jackpot) || 0;
  const stateInfo = STATES[state];
  const stateRate = stateInfo?.rate || 0;

  // Calculations
  const lumpSum = jackpotNum * LUMP_SUM_FACTOR;
  const annuityTotal = jackpotNum;
  const annuityYearly = annuityTotal / 30;

  const baseAmount = paymentType === 'lump' ? lumpSum : annuityYearly;
  const federalTax = baseAmount * FEDERAL_RATE;
  const stateTax = baseAmount * stateRate;
  const afterTax = baseAmount - federalTax - stateTax;
  const totalTaxRate = FEDERAL_RATE + stateRate;

  const annuityAfterTaxYearly = paymentType === 'annuity' ? afterTax : 0;
  const annuityAfterTax30yr = annuityAfterTaxYearly * 30;

  const lumpAfterTax = paymentType === 'lump' ? afterTax : 0;

  // Fun comparisons
  const houses = Math.floor(afterTax / 350000);
  const lambos = Math.floor(afterTax / 300000);
  const yearsRetired = Math.floor(afterTax / 80000);
  const pizzas = Math.floor(afterTax / 15);

  function fmt(n: number): string {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight animate-fade-in-up">
        💰 What If I <span className="text-gold text-glow-gold">Win?</span>
      </h1>
      <p className="text-gray-500 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        See exactly what you&apos;d take home after taxes. Spoiler: the government takes a lot.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card">
            <h2 className="font-black text-lg mb-4 tracking-tight">Your Hypothetical Win</h2>

            <label className="block text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5">Jackpot Amount</label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={jackpot}
                onChange={e => setJackpot(e.target.value)}
                className="input-premium pl-7"
              />
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: '$100M', val: '100000000' },
                { label: '$500M', val: '500000000' },
                { label: '$1B', val: '1000000000' },
                { label: '$1.5B', val: '1500000000' },
                { label: '$2B', val: '2000000000' },
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setJackpot(p.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    jackpot === p.val
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <label className="block text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5">Your State</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="input-premium mb-4"
            >
              {Object.entries(STATES)
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name} ({info.rate === 0 ? 'No state tax!' : `${(info.rate * 100).toFixed(1)}%`})
                  </option>
                ))}
            </select>

            <label className="block text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Payment Type</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setPaymentType('lump')}
                className={`p-3 rounded-xl text-sm font-bold border transition-all ${
                  paymentType === 'lump'
                    ? 'border-gold/30 bg-gold/10 text-gold'
                    : 'border-white/5 bg-white/[0.02] text-gray-400'
                }`}
              >
                💵 Lump Sum
              </button>
              <button
                onClick={() => setPaymentType('annuity')}
                className={`p-3 rounded-xl text-sm font-bold border transition-all ${
                  paymentType === 'annuity'
                    ? 'border-neon/30 bg-neon/10 text-neon'
                    : 'border-white/5 bg-white/[0.02] text-gray-400'
                }`}
              >
                📅 Annuity (30yr)
              </button>
            </div>
          </div>

          {stateRate === 0 && (
            <div className="glass-card border-neon/10 text-center">
              <p className="text-neon font-bold text-sm">🎉 {stateInfo.name} has no state lottery tax!</p>
              <p className="text-xs text-gray-500 mt-1">You keep more of your winnings here.</p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card">
            <h2 className="font-black text-lg mb-4">
              {paymentType === 'lump' ? '💵 Lump Sum Breakdown' : '📅 Annuity Breakdown'}
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Advertised Jackpot</span>
                <span className="text-white font-bold text-lg">{fmt(jackpotNum)}</span>
              </div>

              {paymentType === 'lump' && (
                <div className="flex justify-between items-center py-2 border-t border-white/5">
                  <span className="text-gray-400">Lump Sum (≈60%)</span>
                  <span className="text-white font-bold">{fmt(lumpSum)}</span>
                </div>
              )}

              {paymentType === 'annuity' && (
                <div className="flex justify-between items-center py-2 border-t border-white/5">
                  <span className="text-gray-400">Annual Payment (30 years)</span>
                  <span className="text-white font-bold">{fmt(annuityYearly)}/yr</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-t border-white/5">
                <span className="text-danger">Federal Tax (37%)</span>
                <span className="text-danger font-bold">-{fmt(federalTax)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-white/5">
                <span className={stateRate === 0 ? 'text-neon' : 'text-danger'}>
                  State Tax ({stateInfo.name}: {(stateRate * 100).toFixed(1)}%)
                </span>
                <span className={`font-bold ${stateRate === 0 ? 'text-neon' : 'text-danger'}`}>
                  {stateRate === 0 ? '$0 🎉' : `-${fmt(stateTax)}`}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-t-2 border-gold/20 bg-gold/5 -mx-5 sm:-mx-6 px-5 sm:px-6 rounded-b-2xl mt-3">
                <span className="text-gold font-black text-lg">
                  {paymentType === 'lump' ? 'You Take Home' : 'You Get Per Year'}
                </span>
                <span className="jackpot-massive text-2xl">{fmt(afterTax)}</span>
              </div>

              {paymentType === 'annuity' && (
                <div className="text-center text-xs text-gray-500 mt-2">
                  Total over 30 years: <span className="text-gold font-bold">{fmt(annuityAfterTax30yr)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tax comparison */}
          <div className="glass-card">
            <h3 className="font-black text-sm mb-3">Tax Bite Summary</h3>
            <div className="h-6 rounded-full overflow-hidden flex mb-2">
              <div className="bg-gold/80 h-full" style={{ width: `${((1 - totalTaxRate) * (paymentType === 'lump' ? 60 : 100))}%` }} />
              <div className="bg-danger/60 h-full" style={{ width: `${(FEDERAL_RATE * (paymentType === 'lump' ? 60 : 100))}%` }} />
              <div className="bg-danger/30 h-full" style={{ width: `${(stateRate * (paymentType === 'lump' ? 60 : 100))}%` }} />
              {paymentType === 'lump' && (
                <div className="bg-gray-700 h-full" style={{ width: '40%' }} />
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span><span className="inline-block w-2 h-2 rounded-full bg-gold/80 mr-1" />You keep</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-danger/60 mr-1" />Federal</span>
              {stateRate > 0 && <span><span className="inline-block w-2 h-2 rounded-full bg-danger/30 mr-1" />State</span>}
              {paymentType === 'lump' && <span><span className="inline-block w-2 h-2 rounded-full bg-gray-700 mr-1" />Lump sum discount</span>}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Effective tax rate on advertised jackpot: <span className="text-danger font-bold">
                {paymentType === 'lump'
                  ? `${(100 - (afterTax / jackpotNum) * 100).toFixed(1)}%`
                  : `${(totalTaxRate * 100).toFixed(1)}%`
                }
              </span>
            </p>
          </div>

          {/* Fun with money */}
          {afterTax > 0 && (
            <div className="glass-card border-gold/10">
              <h3 className="font-black text-sm text-gold mb-3">
                🎉 What {fmt(afterTax)} {paymentType === 'annuity' ? '/year ' : ''}Gets You
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                  <div className="text-2xl mb-1">🏠</div>
                  <div className="text-lg font-black text-white">{houses.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Average homes</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                  <div className="text-2xl mb-1">🏎️</div>
                  <div className="text-lg font-black text-white">{lambos.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Lamborghinis</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                  <div className="text-2xl mb-1">🏖️</div>
                  <div className="text-lg font-black text-white">{yearsRetired.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Years retired ($80K/yr)</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                  <div className="text-2xl mb-1">🍕</div>
                  <div className="text-lg font-black text-white">{pizzas.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Pizzas</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <p className="text-xs text-gray-500">
          ⚠️ Estimates based on 2025 federal tax brackets and published state lottery tax rates.
          Actual take-home depends on filing status, deductions, investment income, and whether
          your state taxes lottery winnings differently from regular income. Consult a tax professional
          before claiming any large prize.
        </p>
      </div>
    </div>
  );
}
