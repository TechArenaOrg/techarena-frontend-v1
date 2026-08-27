# Inventory in the Chart of Accounts

**Status: implemented and confirmed live.** The Chart of Accounts (`GET /ledger-accounts`)
now has a fourth `LedgerAccountKind`, `stock`, alongside `cash` / `payable` /
`receivable`. Every stock-mutation path has been explicitly tested and confirmed
working: product creation with an initial quantity, manual stock edits, checkout,
cancel/restore, PO receive, and PO delete-reversal. This doc now records what was
actually built, for reference — the sections below describe the final, as-built
behavior rather than the original proposal.

## How it works

`LedgerAccount.balance` ([ledger-api.ts](src/services/api/ledger-api.ts#L11)) is
computed server-side, same as the other three kinds. Backend deliberately kept the
Inventory account's balance math **the same in/out model cash accounts already use**,
not full double-entry — see "What was deliberately left out" below.

### Confirmed-live posting paths

| Stock event | Cost source | Status |
|---|---|---|
| Product created with an initial `stockQuantity` | `product.costPrice` | ✅ confirmed |
| Product's `stockQuantity` manually edited (delta-based) | `product.costPrice` | ✅ confirmed |
| Checkout decrements stock | `product.costPrice` | ✅ confirmed |
| Order cancel/restore reverses the above | `product.costPrice` | ✅ confirmed |
| Purchase Order received | the PO item's own `unitCost` (more accurate than `costPrice` — it's what was actually paid) | ✅ confirmed |
| Purchase Order deleted (reverses stock + ledger) | matches whatever was originally posted | ✅ confirmed |

### Best-effort, never blocking

- A product with no `costPrice` set contributes a net entry value of `0` — the
  posting is skipped entirely rather than writing a zero-amount entry. Matches how
  [Stock Status](src/app/admin/reports/stock-status/page.tsx#L24) already treats
  missing cost.
- If the relevant vendor has no Stock account yet, the posting is skipped and logged
  server-side only — it does not block the underlying stock/checkout/PO operation.
- Any ledger-posting error is caught and logged, never rolls back or blocks the real
  operation — same pattern as the existing payment→ledger integration.

### What was deliberately left out (not gaps — explicit decisions)

- **No COGS account, no true double-entry.** Inventory's balance moves correctly on
  every event above, but there's no automatic offsetting expense entry. Margin
  reporting still only comes from the independently-computed
  [Stock Status](src/app/admin/reports/stock-status/page.tsx) report, not from the
  ledger. Revisit only if margin/P&L reporting through the ledger itself becomes a
  real need later — it's a bigger addition (a new `LedgerAccountKind` plus its own
  balance rule).
- **No auto-provisioning per vendor.** Consistent with how `cash` / `payable` /
  `receivable` already work (all manually created via admin), a vendor's Stock
  account has to be created the same way — via "New Account" or the
  `BootstrapVendorAccountsButton` starter-account flow, both of which now include
  `stock` as an option. One platform-level "Inventory" account *is* auto-seeded, but
  it will permanently stay at `0` since `Product.vendorId` is required (never null) —
  there's no product-driven stock movement that has anywhere platform-level to land.
- **No retroactive valuation.** A newly created vendor Stock account starts at `0`
  and only reacts to movements from that point forward — it does not backfill the
  vendor's pre-existing on-hand stock. To get an accurate starting balance, manually
  post a one-time opening entry (via "Record Entry", direction "In") for that
  vendor's current total stock cost, readable from
  [Stock Status](src/app/admin/reports/stock-status/page.tsx) (now filterable by
  vendor).
- **Out of scope:** seed-data stock insertions (one-time demo data, not real
  history) and `ProductVariant` stock (dead code today).

## API surface

No new endpoints. `stock` is just a valid value for `LedgerAccountKind`, returned
from `GET /ledger-accounts` / `GET /ledger-entries` like any other kind, and
accepted by the existing `POST /ledger-accounts` when creating one. The
system-generated postings for the six events above are not driven through
`POST /ledger-entries` — that endpoint is still for manually keyed entries (like a
correction), separate from the automatic postings.

## Frontend-side changes (implemented)

- `LedgerAccountKind` in [ledger-api.ts](src/services/api/ledger-api.ts#L11) includes
  `'stock'`.
- `KIND_LABELS` in both the admin and vendor ledger pages include `stock: 'Stock'`.
- The "New Account" form and the vendor starter-account bootstrap both offer `stock`
  as a kind.
- The manual "Record Entry" form treats `stock` accounts like `cash` (in/out
  direction, not the settled/outstanding checkbox), with stock-specific labels
  ("stock added"/"stock removed" instead of "money received"/"money spent").
- [Stock Status](src/app/admin/reports/stock-status/page.tsx) has a vendor filter, so
  each vendor's current total stock cost can be read off for the opening-entry step
  above.
