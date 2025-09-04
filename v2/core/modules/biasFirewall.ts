import fs from "fs";
import path from "path";

const biasFile = path.resolve("docs/meta/bias.md");

interface BiasReport {
  tenant?: string;
  template: string;
  category: "language" | "accessibility" | "representation" | "algorithmic";
  issue: string;
  severity: "low" | "medium" | "high";
  recommendation: string;
  autoFixed?: boolean;
}

export function logBias(report: BiasReport) {
  const entry = `\n## Ecosystem Bias Check: ${new Date().toISOString()}\n` +
    (report.tenant ? `- Tenant: ${report.tenant}\n` : "") +
    `- Template: ${report.template}\n` +
    `- Category: ${report.category}\n` +
    `- Issue: ${report.issue}\n` +
    `- Severity: ${report.severity}\n` +
    `- Recommendation: ${report.recommendation}\n` +
    (report.autoFixed ? `- AutoFix Applied: true\n` : "");
  fs.appendFileSync(biasFile, entry);
}

export function scanAndFixBias(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");
  let original = content;

  if (content.match(/whitelist/gi)) {
    content = content.replace(/whitelist/gi, "allowlist");
    logBias({
      template: filePath,
      category: "language",
      issue: "Use of 'whitelist'",
      severity: "medium",
      recommendation: "Replaced with 'allowlist'",
      autoFixed: true
    });
  }

  if (content.match(/blacklist/gi)) {
    content = content.replace(/blacklist/gi, "blocklist");
    logBias({
      template: filePath,
      category: "language",
      issue: "Use of 'blacklist'",
      severity: "medium",
      recommendation: "Replaced with 'blocklist'",
      autoFixed: true
    });
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

// CLI / CI runner
if (require.main === module) {
  console.log("Running autonomous bias firewall...");
  const filesToScan = [
    path.resolve("v2/config/system.json"),
    path.resolve("v2/templates/partials/Navbar.tsx"),
    path.resolve("v2/templates/partials/Footer.tsx"),
  ];
  filesToScan.forEach(scanAndFixBias);
  console.log("Bias scan + auto-refactor complete.");
}