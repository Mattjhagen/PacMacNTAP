import { demoFleet, type ConnectedFleet } from '../src/types/connected';

// Async IoT boundary. The browser's synchronous consumer CarrierAdapter stays intact.
export interface ConnectedCarrierAdapter { listDevices(): Promise<ConnectedFleet> }
export class DemoConnectedAdapter implements ConnectedCarrierAdapter {
  async listDevices() { return structuredClone(demoFleet); }
}
export class HologramCarrierAdapter implements ConnectedCarrierAdapter {
  constructor(private apiKey: string, private orgId: string, private request: typeof fetch = fetch) {
    if (!apiKey.trim() || !/^[1-9]\d*$/.test(orgId)) throw new Error('Hologram configuration is incomplete.');
  }
  async listDevices(): Promise<ConnectedFleet> {
    try {
      const url = new URL('https://dashboard.hologram.io/api/1/devices');
      url.search = new URLSearchParams({ orgid: this.orgId, limit: '100', withlocation: 'false' }).toString();
      const response = await this.request(url, {
        headers: { Authorization: `Basic ${Buffer.from(`apikey:${this.apiKey}`).toString('base64')}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(10000), redirect: 'error'
      });
      if (!response.ok) throw new Error('Provider request failed');
      const body = await response.json();
      if (body.success !== true || !Array.isArray(body.data)) throw new Error('Invalid provider response');
      const devices = body.data.map((device: any) => {
        if (!Number.isSafeInteger(device.id) || device.id <= 0 || Number(device.orgid) !== Number(this.orgId)) throw new Error('Invalid device');
        const states = device.links?.cellular?.map((link: any) => typeof link.state === 'string' ? link.state : 'UNKNOWN');
        return { id: String(device.id), name: typeof device.name === 'string' ? device.name : `Device ${device.id}`, state: states?.length ? states.join(' / ') : 'UNKNOWN' };
      });
      return { mode: 'live', devices, hasMore: body.continues === true };
    } catch {
      // Never expose upstream payloads, credentials, or network error details.
      throw new Error('Hologram is unavailable. Please retry later.');
    }
  }
}
export function connectedCarrier(env: NodeJS.ProcessEnv = process.env): ConnectedCarrierAdapter {
  if (!env.HOLOGRAM_MODE || env.HOLOGRAM_MODE === 'demo') return new DemoConnectedAdapter();
  if (env.HOLOGRAM_MODE !== 'live') throw new Error('Invalid Hologram mode.');
  return new HologramCarrierAdapter(env.HOLOGRAM_API_KEY || '', env.HOLOGRAM_ORG_ID || '');
}

export async function connectedFleetResponse(user: { id: string; role: string } | null, env: NodeJS.ProcessEnv = process.env) {
  if (!user) return { status: 401, body: { error: 'Authentication required.' } };
  if (user.role !== 'admin') return { status: 403, body: { error: 'Admin access required.' } };
  // Existing demo administrators must never gain access to a real organization's fleet.
  if (env.HOLOGRAM_MODE === 'live' && (user.id === 'usr_admin_seed' || !env.HOLOGRAM_ADMIN_IDS?.split(',').map(id => id.trim()).includes(user.id))) {
    return { status: 403, body: { error: 'Live fleet access has not been granted to this administrator.' } };
  }
  try { return { status: 200, body: await connectedCarrier(env).listDevices() }; }
  catch { return { status: 503, body: { error: 'Connected fleet unavailable. Check server configuration or retry later.' } }; }
}
