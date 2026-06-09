#!/usr/bin/env node
/**
 * Updates buildVersion in public/index.html (cache bust for Unity WebGL).
 * Called automatically by .githooks/pre-commit when Build/StreamingAssets change.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "public", "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("bump-build-version: public/index.html not found");
  process.exit(1);
}

const html = fs.readFileSync(indexPath, "utf8");
const pattern = /var buildVersion = "[^"]+";/;
const match = html.match(pattern);

if (!match) {
  console.error('bump-build-version: could not find `var buildVersion = "...";`');
  process.exit(1);
}

const oldVersion = match[0].match(/"([^"]+)"/)[1];
const newVersion = String(Date.now());

if (oldVersion === newVersion) {
  // Same millisecond — unlikely; add 1 if needed
  process.exit(0);
}

const updated = html.replace(pattern, `var buildVersion = "${newVersion}";`);
fs.writeFileSync(indexPath, updated, "utf8");
console.log(`buildVersion: ${oldVersion} -> ${newVersion}`);
