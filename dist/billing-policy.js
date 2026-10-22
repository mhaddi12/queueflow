export const pricing = Object.freeze({
  currency: 'USD',
  trialDays: 30,
  plans: Object.freeze({
    monthly: Object.freeze({ name: 'Monthly', amountMinor: 1000, interval: 'month' }),
    annual: Object.freeze({ name: 'Annual', amountMinor: 10000, interval: 'year' }),
  }),
});

export function getPlan(id) {
  if (!Object.hasOwn(pricing.plans, id)) throw new Error('Choose a valid subscription plan.');
  return pricing.plans[id];
}

// Preview helper only. Live trials must be assigned and enforced by the server.
export function trialEndsAt(start) {
  const date = new Date(start);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid trial start.');
  return new Date(date.getTime() + pricing.trialDays * 24 * 60 * 60 * 1000).toISOString();
}
