// src/samples/works-on-machine.ts
// Sample input: Environment discrepancy debug commits when deployment fails.
// Formatted as git log -p, 20-40 lines, written from scratch.

export const worksOnMachine = `commit e5f6789012345678901234567890abcdef123456
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:05:12 2026 +0000

    works on my machine idk why container fails

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
index a1b2c3d..b2c3d4e 100644
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -12,4 +12,7 @@ export function getUploadPath(filename: string): string {
-  return path.join("C:\\\\uploads", filename);
+  const baseDir = process.env.UPLOAD_DIR || "/tmp/uploads";
+  console.log("DEBUG UPLOAD DIR:", baseDir);
+  return path.posix.join(baseDir, filename);
 }

commit f6789012345678901234567890abcdef12345678
Author: Sleepless Coder <dev@example.com>
Date:   Thu Oct 22 01:14:48 2026 +0000

    try again with posix path and env check

diff --git a/src/storage/upload.ts b/src/storage/upload.ts
index b2c3d4e..c3d4e5f 100644
--- a/src/storage/upload.ts
+++ b/src/storage/upload.ts
@@ -14,3 +14,5 @@ export function getUploadPath(filename: string): string {
+  if (!fs.existsSync(baseDir)) {
+    fs.mkdirSync(baseDir, { recursive: true });
+  }
`;
