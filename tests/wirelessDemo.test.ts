import assert from 'node:assert/strict';
import test from 'node:test';
import { adapter, emptyDemo, updateDemo, type DemoAction } from '../src/demo/wirelessDemo';

test('demo lifecycle keeps activation, billing and plan changes on the selected account', () => {
  let state = emptyDemo;
  const apply = (action: DemoAction) => { state = updateDemo(state, action); };

  apply({ type: 'signup' });
  apply({ type: 'provision' });
  apply({ type: 'activate' });
  assert.equal(state.accounts[0].line, undefined);
  apply({ type: 'plan', id: 'a' });
  apply({ type: 'confirm-device' });
  apply({ type: 'provision' });
  assert.equal(state.accounts[0].line?.status, 'provisioned');
  apply({ type: 'activate' });
  apply({ type: 'usage' });
  apply({ type: 'usage' });
  assert.equal(adapter.bill(state.accounts[0].line!).outstandingMb, 500);
  apply({ type: 'pay' });
  apply({ type: 'pay' });
  assert.equal(adapter.bill(state.accounts[0].line!).outstandingMb, 0);
  assert.deepEqual(state.accounts[0].payments, [{ id: 'DEMO-1-1', megabytes: 500 }]);

  apply({ type: 'deactivate' });
  apply({ type: 'usage' });
  assert.equal(state.accounts[0].line?.status, 'deactivated');
  assert.equal(state.accounts[0].line?.usageMb, 500);
  apply({ type: 'activate' });
  apply({ type: 'plan', id: 'b' });
  apply({ type: 'signup' });
  assert.equal(state.selectedId, '2');
  assert.equal(state.accounts[1].plan, undefined);
  assert.equal(state.accounts[0].line?.status, 'active');
  apply({ type: 'select', id: '1' });
  assert.equal(state.accounts.find(account => account.id === state.selectedId)?.plan, 'b');
});
