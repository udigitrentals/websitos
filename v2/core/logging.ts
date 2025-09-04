import fs from "fs";
import path from "path";

const gardeningLog = path.resolve("docs/meta/gardening/phase1.md");
const lineageLog = path.resolve("docs/meta/lineage.md");
const reconciliationLog = path.resolve("docs/meta/reconciliations.md");

function write(file: string, entry: string) {
  fs.appendFileSync(file, entry);
}

function log(action: string, module: string, details = "") {
  const timestamp = new Date().toISOString();
  const entry = `\n- ${timestamp} :: ${action} :: ${module} ${details}\n`;

  // Always log to gardening + lineage
  write(gardeningLog, entry);
  write(lineageLog, entry);

  // Only log reconciliations when relevant
  if (action === "reconcile") {
    write(reconciliationLog, entry);
  }
}

export function seed(module: string, details = "") {
  log("seed", module, details);
}

export function grow(module: string, details = "") {
  log("grow", module, details);
}

export function prune(module: string, details = "") {
  log("prune", module, details);
}

export function reconcile(module: string, details = "") {
  log("reconcile", module, details);
}
