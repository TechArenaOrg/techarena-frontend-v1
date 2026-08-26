# Inventory in the Chart of Accounts — Backend Spec Request

**Status: proposed, not yet implemented.** Today the Chart of Accounts
(`GET /ledger-accounts`) only knows about three account kinds — `cash`, `payable`,
`receivable` — each backed by real double-entry ledger entries
(`POST /ledger-entries`, `POST /ledger-entries/transfer`). Total stock cost exists
today only as a separate, purely client-side snapshot: [Stock Status](src/app/admin/reports/stock-status/page.tsx#L37)
computes `costPrice × stockQuantity` per product from `GET /products` and sums it —
it has no relationship to the ledger at all. This doc proposes making inventory a
real account in that same ledger.

## Why this needs backend work, not just a frontend display change

`LedgerAccount.balance` ([ledger-api.ts](src/services/api/ledger-api.ts#L13)) comes
straight from the API and is computed server-side from posted entries — the frontend
never calculates a ledger balance itself. Adding an Inventory line to the Chart of
Accounts that behaves like the existing accounts (has a balance, has an entry
history, participates in transfers/reporting) requires the backend to know about
stock movements as *accounting events*, not just as `stockQuantity` decrements on a
product row. That's a new responsibility, not a display tweak.

## Proposed model: real inventory asset account, proper double-entry

Add `stock` (or `inventory`) as a new `LedgerAccountKind`, alongside `cash` /
`payable` / `receivable`. Unlike those, an inventory account isn't manually created
per-vendor by an admin the way cash accounts are — recommend the backend
auto-provisions one inventory account per vendor (and one platform-level one, if
platform ever holds its own stock), the same way `BootstrapVendorAccountsButton`
already bootstraps standard accounts for a vendor today.

### When entries get posted (proposed)

| Stock event | Entry |
|---|---|
| Vendor adds a new product / restocks (`stockQuantity` increases) | Debit Inventory by `costPrice × quantityAdded` |
| A sale ships (order moves to a state that decrements `stockQuantity`) | Credit Inventory, debit COGS by `costPrice × quantitySold` |
| Manual stock adjustment / write-off (damage, loss, recount) | Credit or debit Inventory by `costPrice × quantityAdjusted`, matched against an adjustment/expense account |

This means the backend needs to hook into wherever `stockQuantity` already changes
(product creation/update, order fulfillment, any admin stock-adjustment action) and
post the matching ledger entry alongside it, rather than treating `stockQuantity` as
a bare counter. **Open question for backend:** does an "adjustment" admin action
already exist, or does one need to be added so write-offs have somewhere to point?

### Products without a `costPrice`

[Stock Status](src/app/admin/reports/stock-status/page.tsx#L24) already handles this
today by treating missing cost as `0` and flagging it in a banner. Recommend the same
rule here: a product with no `costPrice` contributes `0` to any inventory entry
(rather than blocking the stock movement), so accounting stays best-effort instead of
breaking checkout/restock flows over missing data entry.

### API surface

No new endpoints needed if the above lands — `stock` just becomes a valid value
returned in `LedgerAccount.kind`, and it shows up in `GET /ledger-accounts` /
`GET /ledger-entries` like any other account. The only actual additions:

- `LedgerAccountKind` gains `'stock'`.
- Whatever internal service updates `stockQuantity` also calls the ledger-entry
  creation logic for the matching account. No new public endpoint — existing
  `POST /ledger-entries` isn't the entry point here since these postings are
  system-generated from stock events, not manually keyed by a user the way a cash
  entry is.

## Frontend-side changes (once this exists)

- `KIND_LABELS` in [ledger/page.tsx](src/app/admin/reports/ledger/page.tsx#L20) and
  the vendor equivalent gets a `stock: 'Stock'` entry — trivial once the backend
  returns it.
- `LedgerAccountKind` in [ledger-api.ts](src/services/api/ledger-api.ts#L11) gains
  `'stock'`.
- Nothing else strictly required — the existing account table, grand-total row, and
  per-account entry view all already work generically over whatever accounts the API
  returns. Could later cross-check the ledger's Inventory balance against Stock
  Status's independently-computed `extCost` total as a sanity check the two agree,
  but that's optional polish, not required for this to work.
