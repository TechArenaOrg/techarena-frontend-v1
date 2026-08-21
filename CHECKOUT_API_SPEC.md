# Checkout / Orders / Payments — Confirmed API Contract

**Status: confirmed, fixed, and implemented.** `POST /orders/add` and
`POST /orders/:id/payment` have no request body documented in Swagger
(`/api/docs-json` has zero DTOs registered for either), so the shapes below were
reverse-engineered empirically against the live backend. The `customerPhone` bug
noted in an earlier version of this doc **has been fixed and confirmed live** (see
below). The frontend checkout (`/checkout`, `src/services/api/orders-api.ts`) is
built against this, phone included. **Recommend adding real `@ApiBody` DTOs matching
this so future changes don't require guesswork again.**

## 1. `POST /api/v1/orders/add`

### Request body (confirmed working)

```jsonc
{
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ],
  "shippingAddress": {
    "type": "shipping",           // required - "shipping" | "billing"
    "streetAddress": "string",    // required
    "apartment": "string?",
    "city": "string",             // required
    "stateProvince": "string?",
    "postalCode": "string?",
    "country": "UG"               // required, ISO 3166-1 alpha-2 (2 chars exactly)
  },
  "billingAddress": { /* same shape, type: "billing" - REQUIRED, not optional */ },
  "customerEmail": "string?",
  "customerPhone": "+256772123456", // strict E.164 required - see below
  "paymentMethod": "mobile_money" | "credit_card" | "bank_transfer" | "cash_on_delivery",
  "notes": "string?"
}
```

**`customerPhone` fix confirmed live.** Strict E.164 format (`+256772123456`, no
spaces/dashes) is now accepted where the old regex rejected every format tried. The
frontend normalizes whatever the user types (local `0772...`, no-plus `256772...`,
spaced/dashed) into E.164 client-side (`toE164Uganda()` in `orders-api.ts`) before
sending, since real users won't naturally type strict E.164. **Not yet confirmed:**
whether the backend accepts *any* other format (local, no-plus) or strictly requires
E.164 - the frontend assumes strict E.164 is required and normalizes accordingly, so
this is safe either way, but worth confirming for the doc's sake.

**Confirmed: order creation immediately creates a `pending` payment row** in the
response's `payments[]` array, before `POST /orders/:id/payment` is even called (see
section 2 - confirmed this is the same row `processPayment` reuses, not a duplicate).

### Response (201) - actual observed shape

```jsonc
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "orderNumber": "ORD-XXXXXXXX-XXX",
    "status": "pending",
    "subtotal": 1850000,
    "taxAmount": 0,
    "shippingAmount": 0,          // always observed as 0 in testing - unclear if this is computed server-side at all
    "discountAmount": 0,
    "totalAmount": 1850000,
    "billingAddress": { "city": "...", "type": "billing", "country": "UG", "streetAddress": "..." },
    "shippingAddress": { /* same shape */ },
    "customerEmail": "string | null",
    "customerPhone": null,
    "placedAt": "ISO 8601",
    "shippedAt": null,
    "deliveredAt": null,
    "cancelledAt": null,
    "notes": null,
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601",
    "user": { /* full User object, including the real phone number */ },
    "items": [
      {
        "id": "uuid", "orderId": "uuid", "productId": "uuid", "variantId": null, "vendorId": "uuid",
        "productName": "string", "productSku": "string", "variantName": null,
        "quantity": 2, "unitPrice": 1850000, "totalPrice": 1850000, "status": "pending",
        "product": { /* full Product object */ }, "vendor": { /* full Vendor object */ }
      }
    ],
    "payments": []
  }
}
```

**Confirmed: creating an order clears only the ordered items from the cart**, not a
blanket clear - tested with 6 cart items, ordered 1, the other 5 were left untouched.
The frontend always sends every current cart item, so this distinction doesn't affect
its behavior today, but matters if that ever changes (e.g. a "buy this one item now"
flow that leaves the rest of the cart intact).

**Confirmed: out-of-stock is a 409**, not a 400, and names the specific product(s):

```jsonc
{
  "success": false,
  "message": "Some items are no longer available in the requested quantity",
  "details": [
    { "productId": "uuid", "productName": "string", "requestedQuantity": 1, "availableStock": 0 }
  ]
}
```
Note this `details` shape has no `.message` per entry (unlike the validation-error
shape below) - `client.ts`'s error-message builder was fixed to fall back to the
top-level `message` when entries don't have one, and `CheckoutForm.tsx` now detects
this shape specifically to list the affected product(s) by name.

### Validation error shape (400) - confirmed

```jsonc
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "code": "invalid_type", "expected": "object", "received": "undefined", "path": ["billingAddress"], "message": "Required" },
    { "expected": "'billing' | 'shipping'", "received": "undefined", "code": "invalid_type", "path": ["shippingAddress", "type"], "message": "Required" },
    { "code": "too_big", "maximum": 2, "type": "string", "path": ["shippingAddress", "country"], "message": "Country code must be 2 characters" }
  ]
}
```
This matches what the frontend's `ApiError.details` already expects from other forms.

## 2. `POST /api/v1/orders/{id}/payment`

### Request body (confirmed working, `mobile_money`)

```jsonc
{ "paymentMethod": "mobile_money", "phone": "string?" }
```
`paymentMethod` alone is sufficient - `phone` is accepted without erroring, and the
frontend now sends the same normalized E.164 phone here as on `orders/add` for
consistency. This is clearly a **simulated/mocked** payment gateway for this demo
backend (completes instantly, generates a fake `providerTransactionId` like
`MOBILE_MONEY-<timestamp>-<random>`), not a real MTN/Airtel integration - fine for
now, but should be called out before this goes anywhere near production.

**Confirmed: idempotent against the payment row `orders/add` already creates** -
calling this endpoint reuses that same pre-created `pending` payment row rather than
creating a duplicate, and flips the order's `status` from `pending` to `confirmed`.

### Response (201) - actual observed shape

```jsonc
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid", "orderId": "uuid", "paymentMethod": "mobile_money", "provider": "unknown",
      "providerTransactionId": "MOBILE_MONEY-1787339978322-ds2msqpd2",
      "amount": 1850000, "currency": "UGX", "status": "completed",
      "gatewayResponse": { "provider": "mobile_money", "amount": 1850000, "currency": "UGX", "status": "completed", "timestamp": "ISO 8601" },
      "failureReason": null, "createdAt": "ISO 8601", "updatedAt": "ISO 8601"
    },
    "gatewayResponse": { "success": true, "transactionId": "string", "gatewayResponse": { /* duplicate of above */ } }
  }
}
```
Note the payment record is nested under `data.payment`, not `data` directly.

**Not yet tested:** `credit_card` (whether it returns a redirect URL for a hosted
checkout), `bank_transfer`, or `cash_on_delivery` - the frontend currently sends the
same `{paymentMethod}` body for all four and assumes an immediate `completed`/
`pending` response rather than a redirect. If `credit_card` actually needs a
redirect flow (e.g. Stripe), that will need frontend changes once confirmed.

## 3. Enums (matching `src/types/index.ts`)

```ts
type PaymentMethod = 'credit_card' | 'mobile_money' | 'bank_transfer' | 'cash_on_delivery';
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
```

## 4. Addresses

`GET /dashboard/profile` returns the customer's saved `addresses[]`, but there's no
confirmed "create address" endpoint, and `ProfileForm.tsx` on the frontend is entirely
mocked (no real API call). **Checkout v1 does not use saved addresses at all** - it
collects shipping/billing fields fresh on the form each time and submits them inline
with the order (confirmed working per section 1). A saved-address picker would be a
nice follow-up but isn't required for the current implementation to function.
