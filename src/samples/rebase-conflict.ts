// src/samples/rebase-conflict.ts
// Sample input: Frantic rebase merge conflict resolution.
// Formatted as git log -p, 20-40 lines, written from scratch.

export const rebaseConflict = `commit c3d4e5f6789012345678901234567890abcdef12
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:42:01 2026 +0000

    fix merge conflict again

diff --git a/src/auth/session.ts b/src/auth/session.ts
index 1234567..89abcdef 100644
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -18,8 +18,6 @@ export function validateSession(token: string): boolean {
-<<<<<<< HEAD
-  if (token.length < 32) return false;
-=======
-  if (!token || token.trim() === "") return false;
->>>>>>> main
+  if (!token || token.length < 32) return false;
   return verifySignature(token);
 }

commit d4e5f6789012345678901234567890abcdef1234
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:49:30 2026 +0000

    asdfgh conflict still broken try again

diff --git a/src/auth/session.ts b/src/auth/session.ts
index 89abcdef..feebda98 100644
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -20,3 +20,4 @@ export function validateSession(token: string): boolean {
+  // debugger;
   return verifySignature(token);
`;
