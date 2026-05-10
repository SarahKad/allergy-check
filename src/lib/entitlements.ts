// Phase 2 seam: ad / pro entitlement.
//
// Today everything is free and ad-free. When IAP is added, swap the body of
// `useEntitlements` to read from the receipt validator and the rest of the
// app keeps working unchanged.

export type Entitlements = {
  isPro: boolean;
};

export function useEntitlements(): Entitlements {
  return { isPro: false };
}
