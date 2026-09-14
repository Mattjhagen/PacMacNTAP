export interface ConnectedDevice { id: string; name: string; state: string }
export interface ConnectedFleet { mode: 'demo' | 'live'; devices: ConnectedDevice[]; hasMore: boolean }
export const demoFleet: ConnectedFleet = {
  mode: 'demo', hasMore: false, devices: [
    { id: 'demo-van', name: 'Delivery van · OBD tracker', state: 'LIVE' },
    { id: 'demo-pos', name: 'Market stall · POS terminal', state: 'LIVE' },
    { id: 'demo-building', name: 'Building 02 · Sensor gateway', state: 'PAUSED-USER' },
    { id: 'demo-pi', name: 'Workshop · Raspberry Pi', state: 'LIVE' }
  ]
};
