import React, { useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ShieldCheck, Smartphone } from 'lucide-react';
import { adapter, emptyDemo, plans, storageKey, updateDemo, type DemoState } from '../demo/wirelessDemo';

const panel = 'rounded-2xl border border-white/15 bg-neutral-950 p-5 sm:p-7';
const button = 'inline-flex items-center justify-center rounded-lg bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-200 disabled:opacity-40';
const secondary = 'inline-flex items-center justify-center rounded-lg border border-white/25 px-4 py-2.5 text-sm font-medium hover:bg-white/10';
const field = 'rounded-lg border border-white/25 bg-neutral-900 px-3 py-2 text-sm';

function loadDemo(): DemoState {
  try {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : emptyDemo;
  } catch {
    return emptyDemo;
  }
}

export default function WirelessDemo({ admin = false }: { admin?: boolean }) {
  const [state, dispatch] = useReducer(updateDemo, emptyDemo, loadDemo);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      setStorageError(true);
    }
  }, [state]);

  const account = state.accounts.find(item => item.id === state.selectedId);
  const line = account?.line;
  const balance = line ? adapter.bill(line).outstandingMb : 0;
  const nextActivationStep = !account?.deviceConfirmed ? 'confirm-device' : !line ? 'provision' : 'activate';

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-10">
      <header className="mb-8 max-w-3xl">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
          <Radio size={17} aria-hidden="true" /> Nebraska-first prepaid wireless
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {admin ? 'Wireless OS demo admin' : 'Wireless OS demo'}
        </h1>
        <p className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          Simulation only. Accounts, carrier provisioning, eSIMs, usage, and payments are fictional.
          Lifeline and Nebraska NTAP enrollment are unavailable in this demo.
        </p>
        <p className="mt-3 text-sm text-neutral-400">
          Demo records stay in this browser tab, including on refresh. {admin ? 'This view displays only those fictional records.' : 'Use the generated account to walk through prepaid service.'}
        </p>
        {storageError && <p role="alert" className="mt-3 text-sm text-amber-200">Browser storage is unavailable. Demo changes may be lost when you leave this page.</p>}
        <Link className="mt-4 inline-block text-sm text-emerald-300 underline underline-offset-4" to={admin ? '/wireless-demo' : '/wireless-demo/admin'}>
          {admin ? 'Switch to customer demo' : 'View simulated admin dashboard'}
        </Link>
      </header>

      {admin ? (
        <section className={panel} aria-labelledby="records">
          <h2 id="records" className="mb-4 text-xl font-semibold">Simulated customers and lines</h2>
          <p className="mb-4 text-sm text-neutral-300">
            {state.accounts.length} demo accounts · {state.accounts.filter(item => item.line?.status === 'active').length} active demo lines
          </p>
          {state.accounts.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-neutral-400"><tr>
                  {['Customer', 'Prepaid plan', 'eSIM status', 'Usage', 'Payments'].map(label => (
                    <th key={label} scope="col" className="border-b border-white/15 px-3 py-3">{label}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {state.accounts.map(item => (
                    <tr key={item.id} className="border-b border-white/10">
                      <th scope="row" className="px-3 py-3 font-medium">Demo customer {item.id}</th>
                      <td className="px-3 py-3">{plans.find(plan => plan.id === item.plan)?.label ?? 'Unselected'}</td>
                      <td className="px-3 py-3 capitalize">{item.line?.status ?? 'Not provisioned'}</td>
                      <td className="px-3 py-3">{item.line?.usageMb ?? 0} MB</td>
                      <td className="px-3 py-3">{item.payments.length} simulated</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p>Start in the customer demo to create the first account.</p>}
          <h3 className="mt-7 font-semibold">Demo plan catalog</h3>
          <ul className="mt-2 space-y-2 text-sm text-neutral-300">
            {plans.map(plan => <li key={plan.id}>{plan.label} · Name and price TBD</li>)}
          </ul>
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <section className={panel} aria-labelledby="demo-account">
            <h2 id="demo-account" className="text-xl font-semibold">Demo account</h2>
            <p className="mt-2 text-sm text-neutral-300">Create a fictional account without entering personal information.</p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <button className={button} onClick={() => dispatch({ type: 'signup' })}>Create demo account</button>
              {account && <label className="grid gap-1 text-sm">Current account
                <select className={field} value={account.id} onChange={event => dispatch({ type: 'select', id: event.target.value })}>
                  {state.accounts.map(item => <option key={item.id} value={item.id}>Demo customer {item.id}</option>)}
                </select>
              </label>}
            </div>
          </section>

          <section className={panel} aria-labelledby="demo-plan">
            <h2 id="demo-plan" className="text-xl font-semibold">Prepaid plan</h2>
            <p className="mt-2 text-sm text-neutral-300">Plan names and prices are TBD pending wholesale rates.</p>
            {account ? (
              <fieldset className="mt-4 grid gap-2">
                <legend className="mb-2 text-sm">{account.plan ? 'Change demo plan' : 'Choose a demo plan'}</legend>
                {plans.map(plan => (
                  <label key={plan.id} className="flex items-center gap-3 rounded-lg border border-white/15 p-3 text-sm">
                    <input type="radio" name="demo-plan" checked={account.plan === plan.id} onChange={() => dispatch({ type: 'plan', id: plan.id })} />
                    {plan.label} · Price TBD
                  </label>
                ))}
              </fieldset>
            ) : <p className="mt-4 text-sm text-neutral-400">Create an account to choose a plan.</p>}
          </section>

          <section className={panel} aria-labelledby="demo-esim">
            <h2 id="demo-esim" className="flex items-center gap-2 text-xl font-semibold"><Smartphone size={20} aria-hidden="true" /> Simulated eSIM</h2>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-neutral-300">
              <li>Confirm an eSIM-capable demo device</li>
              <li>Generate a fictional eSIM profile</li>
              <li>Simulate installation and line activation</li>
            </ol>
            <p className="mt-4 text-sm capitalize" role="status">Line status · {line?.status ?? 'Not provisioned'}</p>
            {line && <p className="mt-1 break-all font-mono text-xs text-neutral-300">Demo profile ID · {line.profile}</p>}
            <div className="mt-4">
              {line?.status === 'active' ? (
                <button className={secondary} onClick={() => dispatch({ type: 'deactivate' })}>Simulate deactivation</button>
              ) : (
                <button className={button} disabled={!account?.plan} onClick={() => dispatch({ type: nextActivationStep })}>
                  {!account?.deviceConfirmed ? 'Confirm demo device' : !line ? 'Simulate eSIM provisioning' : line.status === 'deactivated' ? 'Simulate reactivation' : 'Simulate installation and activation'}
                </button>
              )}
            </div>
          </section>

          <section className={panel} aria-labelledby="demo-billing">
            <h2 id="demo-billing" className="text-xl font-semibold">Simulated usage and billing</h2>
            <dl className="my-4 grid grid-cols-2 gap-3 text-sm" aria-live="polite">
              <dt className="text-neutral-300">Total usage</dt><dd>{line?.usageMb ?? 0} MB</dd>
              <dt className="text-neutral-300">Unsettled usage</dt><dd>{balance} MB</dd>
              <dt className="text-neutral-300">Monetary balance</dt><dd>TBD</dd>
            </dl>
            <div className="flex flex-wrap gap-3">
              <button className={secondary + ' disabled:opacity-40'} disabled={line?.status !== 'active'} onClick={() => dispatch({ type: 'usage' })}>Simulate 250 MB usage</button>
              <button className={button} disabled={!balance} onClick={() => dispatch({ type: 'pay' })}>Simulate payment</button>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-300" aria-live="polite">
              {account?.payments.map(payment => <li key={payment.id}>{payment.id} · Simulated payment settled {payment.megabytes} MB</li>)}
            </ul>
          </section>

          <section className={panel + ' md:col-span-2'} aria-labelledby="demo-packie">
            <h2 id="demo-packie" className="flex items-center gap-2 text-xl font-semibold"><ShieldCheck size={20} aria-hidden="true" /> PackieAI scam-call protection</h2>
            <p className="mt-2 text-sm text-neutral-300">See how PackieAI screens unfamiliar callers in PacMac Mobile’s existing experience.</p>
            <Link className={secondary + ' mt-4'} to="/packieai">Explore PackieAI</Link>
          </section>
        </div>
      )}
    </div>
  );
}
