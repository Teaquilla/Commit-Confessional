// src/samples/works-on-machine.ts
// Sample input: Environment discrepancy debug commits when deployment fails.
// Ditulis agar mewakili sesi panik; skor dihitung, bukan disetel.

export const worksOnMachine = `commit e5f6789012345678901234567890abcdef123401
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:05:12 2026 +0000

    works on my machine container failing

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -10,2 +10,3 @@
+  const baseDir = process.env.UPLOAD_DIR || "/tmp/uploads";
commit e5f6789012345678901234567890abcdef123402
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:10:33 2026 +0000

    try relative path

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -12,2 +12,4 @@
+  console.log("DEBUG UPLOAD DIR:", baseDir);
+  return path.posix.join(baseDir, filename);
commit e5f6789012345678901234567890abcdef123403
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:16:48 2026 +0000

    fix env var

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -15,2 +15,3 @@
+  if (!baseDir) throw new Error("Missing upload dir");
commit e5f6789012345678901234567890abcdef123404
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:21:15 2026 +0000

    try again

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -18,2 +18,3 @@
+  fs.mkdirSync(baseDir, { recursive: true });
commit e5f6789012345678901234567890abcdef123405
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:28:40 2026 +0000

    STILL FAILING ON STAGING WHY

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -20,2 +20,3 @@
+  console.log("DIR STATS:", fs.statSync(baseDir).mode);
commit e5f6789012345678901234567890abcdef123406
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:34:10 2026 +0000

    fix permissions and finish

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -21,2 +21,3 @@
+  fs.chmodSync(baseDir, 0o755);
`;
