import { createMockMvnaAdapter, type DemoLine } from './mvna';

export const adapter = createMockMvnaAdapter({
  rates: {},
  minimums: {},
  provisioning: { esimSupported: true },
  apiOptions: {},
});

export const plans = [
  { id: 'a', label: 'Plan option A' },
  { id: 'b', label: 'Plan option B' },
] as const;

export type PlanId = typeof plans[number]['id'];

export interface DemoAccount {
  id: string;
  plan?: PlanId;
  deviceConfirmed?: boolean;
  line?: DemoLine;
  payments: { id: string; megabytes: number }[];
}

export interface DemoState {
  accounts: DemoAccount[];
  selectedId?: string;
}

export const emptyDemo: DemoState = { accounts: [] };
export const storageKey = 'pacmac.wireless-demo.v1';

export type DemoAction =
  | { type: 'signup' }
  | { type: 'select'; id: string }
  | { type: 'plan'; id: PlanId }
  | { type: 'confirm-device' | 'provision' | 'activate' | 'deactivate' | 'usage' | 'pay' };

export function updateDemo(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'signup') {
    const id = String(state.accounts.length + 1);
    return { selectedId: id, accounts: [...state.accounts, { id, payments: [] }] };
  }
  if (action.type === 'select') {
    return state.accounts.some(account => account.id === action.id)
      ? { ...state, selectedId: action.id }
      : state;
  }

  const account = state.accounts.find(item => item.id === state.selectedId);
  if (!account) return state;
  const next = updateAccount(account, action);
  if (next === account) return state;
  return { ...state, accounts: state.accounts.map(item => item.id === next.id ? next : item) };
}

function updateAccount(account: DemoAccount, action: Exclude<DemoAction, { type: 'signup' | 'select' }>): DemoAccount {
  const { line } = account;
  switch (action.type) {
    case 'plan':
      return { ...account, plan: action.id };
    case 'confirm-device':
      return account.plan ? { ...account, deviceConfirmed: true } : account;
    case 'provision':
      return account.deviceConfirmed && !line ? { ...account, line: adapter.provisionEsim(account.id) } : account;
    case 'activate':
      return line && line.status !== 'active' ? { ...account, line: adapter.activate(line) } : account;
    case 'deactivate':
      return line?.status === 'active' ? { ...account, line: adapter.deactivate(line) } : account;
    case 'usage':
      return line?.status === 'active' ? { ...account, line: adapter.reportUsage(line, 250) } : account;
    case 'pay': {
      if (!line) return account;
      const { outstandingMb } = adapter.bill(line);
      if (!outstandingMb) return account;
      return {
        ...account,
        line: adapter.settleBill(line),
        payments: [...account.payments, { id: `DEMO-${account.id}-${account.payments.length + 1}`, megabytes: outstandingMb }],
      };
    }
  }
}
