import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const roots = ["src", "tests", "scripts"];
const files = [];
function walk(dir) { for (const entry of readdirSync(dir)) { const path=join(dir,entry); if (statSync(path).isDirectory()) walk(path); else if (/\.(ts|mjs)$/.test(path)) files.push(path); } }
for (const root of roots) walk(root);
let failed=false;
for (const file of files) { const s=readFileSync(file,"utf8"); if (/\bany\b/.test(s) || /console\.log\(/.test(s) || /TODO|FIXME/.test(s)) { console.error(`lint violation: ${file}`); failed=true; } }
process.exitCode=failed?1:0;
