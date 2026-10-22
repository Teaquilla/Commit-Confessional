// src/samples/rebase-conflict.ts
// Sample input: Frantic rebase merge conflict resolution across 6 commits.
// Ditulis agar mewakili sesi panik; skor dihitung, bukan disetel.

export const rebaseConflict = `commit c3d4e5f6789012345678901234567890abcdef01
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:30:00 2026 +0000

    rebase on main

diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -10,2 +10,3 @@
+  const sessionTimeout = 3600;
commit c3d4e5f6789012345678901234567890abcdef02
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:34:12 2026 +0000

    fix merge conflict

diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -15,3 +15,2 @@
-<<<<<<< HEAD
+  if (!token) return false;
commit c3d4e5f6789012345678901234567890abcdef03
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:39:45 2026 +0000

    fix again token undefined

diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -18,2 +18,3 @@
+  console.log("DEBUG TOKEN CHECK:", token);
commit c3d4e5f6789012345678901234567890abcdef04
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:44:20 2026 +0000

    wip rebase broken

diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -25,2 +25,3 @@
+  const parsed = parseSession(token);
commit c3d4e5f6789012345678901234567890abcdef05
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:49:05 2026 +0000

    WHY IS THIS CONFLICTING AGAIN

diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -30,2 +30,3 @@
+  // debugger;
commit c3d4e5f6789012345678901234567890abcdef06
Author: Merge Martyr <dev@example.com>
Date:   Wed Oct 21 18:55:30 2026 +0000

    clean up conflict mess

diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -31,2 +31,2 @@
-  // debugger;
+  return Boolean(verifySignature(token));
`;
