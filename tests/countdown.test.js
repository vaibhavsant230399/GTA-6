import test from 'node:test';
import assert from 'node:assert/strict';
import { getRemaining, getReleaseTarget } from '../dist/countdown.js';

test('counts across day, hour and minute boundaries', () => {
  assert.deepEqual(getRemaining(90061000, 0), {days:1,hours:1,minutes:1,seconds:1,complete:false});
  assert.deepEqual(getRemaining(86400000, 1), {days:1,hours:0,minutes:0,seconds:0,complete:false});
});
test('does not finish during the final partial second', () => {
  assert.equal(getRemaining(1000, 999).complete, false);
  assert.equal(getRemaining(1000, 999).seconds, 1);
});
test('stops at zero at and after release', () => {
  for (const now of [1000, 1001, 999999]) assert.deepEqual(getRemaining(1000, now), {days:0,hours:0,minutes:0,seconds:0,complete:true});
});
test('uses November 19 at local midnight', () => {
  const target = new Date(getReleaseTarget());
  assert.equal(target.getFullYear(),2026);
  assert.equal(target.getMonth(),10);
  assert.equal(target.getDate(),19);
  assert.equal(target.getHours(),0);
  assert.equal(target.getMinutes(),0);
});
