import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const tests = readdirSync("dist/tests").filter((file) => file.endsWith(".test.js")).map((file) => join("dist/tests", file));
const result = spawnSync(process.execPath, ["--test", ...tests], { stdio: "inherit" });
process.exit(result.status ?? 1);
