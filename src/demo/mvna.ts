export interface MvnaConfiguration {
  rates: { perLine?: number; perGb?: number; esim?: number };
  minimums: { monthlySpend?: number; lines?: number };
  provisioning: { esimSupported?: boolean; method?: string };
  apiOptions: { documentation?: string; sandbox?: boolean; webhooks?: boolean };
}

export interface DemoLine {
  profile: string;
  status: 'provisioned' | 'active' | 'deactivated';
  usageMb: number;
  settledMb: number;
}

export interface MvnaAdapter {
  provisionEsim(accountId: string): DemoLine;
  activate(line: DemoLine): DemoLine;
  deactivate(line: DemoLine): DemoLine;
  reportUsage(line: DemoLine, megabytes: number): DemoLine;
  bill(line: DemoLine): { outstandingMb: number };
  settleBill(line: DemoLine): DemoLine;
}

export function createMockMvnaAdapter(config: MvnaConfiguration): MvnaAdapter {
  const bill = (line: DemoLine) => ({ outstandingMb: line.usageMb - line.settledMb });
  return {
    provisionEsim(accountId) {
      if (config.provisioning.esimSupported === false) throw new Error('Demo eSIM provisioning is unavailable.');
      return { profile: `SIMULATION-${accountId}`, status: 'provisioned', usageMb: 0, settledMb: 0 };
    },
    activate(line) {
      return { ...line, status: 'active' };
    },
    deactivate(line) {
      return { ...line, status: 'deactivated' };
    },
    reportUsage(line, megabytes) {
      if (line.status !== 'active' || !Number.isSafeInteger(megabytes) || megabytes <= 0) {
        throw new Error('An active demo line and positive whole megabytes are required.');
      }
      return { ...line, usageMb: line.usageMb + megabytes };
    },
    bill,
    settleBill(line) {
      return { ...line, settledMb: line.usageMb };
    },
  };
}
