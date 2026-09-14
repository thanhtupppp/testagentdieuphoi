import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const roots = ["src", "tests", "scripts"];
const files = [];
function walk(dir) { for (const entry of readdirSync(dir)) { const path = join(dir, entry); if (statSync(path).isDirectory()) walk(path); else if (/\.(ts|mjs|json|md|yml|yaml)$/.test(path)) files.push(path); } }
for (const root of roots) walk(root);
for (const file of files) { const content = readFileSync(file, "utf8"); if (/\r\n/.test(content) || /[ \t]+$/m.test(content) || !content.endsWith("\n")) { console.error(`format violation: ${file}`); process.exitCode = 1; } }
