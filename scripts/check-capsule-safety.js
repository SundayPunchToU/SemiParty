const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "miniprogram");
const watchMarkers = ["top-nav", "top-safe", "inner-top"];
const missingFiles = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!entry.isFile() || !fullPath.endsWith(".wxml")) {
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf8");
    const usesCustomTopbar = watchMarkers.some((marker) => content.includes(marker));
    if (!usesCustomTopbar) {
      continue;
    }
    if (!content.includes("navCapsuleInsetRight")) {
      missingFiles.push(path.relative(path.resolve(__dirname, ".."), fullPath));
    }
  }
}

walk(path.join(root, "pages"));

if (missingFiles.length) {
  console.error("Missing navCapsuleInsetRight in custom topbar pages:");
  for (const file of missingFiles) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Capsule safety check passed.");
