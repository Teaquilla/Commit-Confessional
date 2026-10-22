// src/samples/late-night-hotfix.ts
// Sample input: Late night production checkout hotfix with frantic commits.
// Ditulis agar mewakili sesi panik; skor dihitung, bukan disetel.

export const lateNightHotfix = `commit a1b2c3d4e5f6789012345678901234567890abcd
Author: Panic Dev <dev@example.com>
Date:   Wed Oct 21 03:14:22 2026 +0000

    fix

diff --git a/src/payments/checkout.ts b/src/payments/checkout.ts
index 83a1b2c..94b2c3d 100644
--- a/src/payments/checkout.ts
+++ b/src/payments/checkout.ts
@@ -42,6 +42,9 @@ export async function processOrder(order: OrderPayload): Promise<PaymentResult>
   console.log("CRITICAL ORDER PROCESSING", order.id);
+  if (!order.customer || !order.customer.billingAddress) {
+    console.log("PAYMENT NULL FIX - RETURNING FALLBACK");
+    return { status: "FAILED", error: "Missing billing address" };
+  }
   const token = await gateway.charge(order.amount);

commit b2c3d4e5f6789012345678901234567890abcdef
Author: Panic Dev <dev@example.com>
Date:   Wed Oct 21 03:22:15 2026 +0000

    please work now prod is completely down

diff --git a/src/payments/checkout.ts b/src/payments/checkout.ts
index 94b2c3d..a5c3d4e 100644
--- a/src/payments/checkout.ts
+++ b/src/payments/checkout.ts
@@ -43,4 +43,4 @@ export async function processOrder(order: OrderPayload): Promise<PaymentResult>
-  console.log("PAYMENT NULL FIX - RETURNING FALLBACK");
+  // console.log("PAYMENT NULL FIX - RETURNING FALLBACK");
`;
