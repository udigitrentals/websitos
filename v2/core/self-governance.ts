import fs from "fs";
import path from "path";

const reconciliationsFile = path.resolve("docs/meta/reconciliations.md");
const lineageFile = path.resolve("docs/meta/lineage.md");

interface GovernanceDecision {
  action: string;
  module: string;
  type: "auto-execute" | "treaty-required";
  rationale: string;
}

function logDecision(decision: GovernanceDecision) {
  const entry = `\n## Governance Decision: ${new Date().toISOString()}\n` +
    `- Action: ${decision.action}\n` +
    `- Module: ${decision.module}\n` +
    `- Type: ${decision.type}\n` +
    `- Rationale: ${decision.rationale}\n`;

  fs.appendFileSync(lineageFile, entry);
  if (decision.type === "treaty-required") {
    fs.appendFileSync(reconciliationsFile, entry);
  }
}

export function decideAutonomy(action: string, module: string): GovernanceDecision {
  let decision: GovernanceDecision;

  if (action.includes("bias fix") || action.includes("copy clarity") || action.includes("translation")) {
    decision = {
      action,
      module,
      type: "auto-execute",
      rationale: "Low cultural risk, safe for autonomous execution"
    };
  } else if (action.includes("archetype shift") || action.includes("tenant conflict")) {
    decision = {
      action,
      module,
      type: "treaty-required",
      rationale: "High cultural impact, requires human reconciliation"
    };
  } else {
    decision = {
      action,
      module,
      type: "auto-execute",
      rationale: "Default safe path"
    };
  }

  logDecision(decision);
  return decision;
}

// CLI / CI runner example
if (require.main === module) {
  console.log("Running self-governance protocol...");
  const d1 = decideAutonomy("bias fix applied", "system.json");
  const d2 = decideAutonomy("archetype shift proposed", "Navbar");
  console.log("Decisions:", d1, d2);
}