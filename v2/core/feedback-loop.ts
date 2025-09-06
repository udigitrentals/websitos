import fs from "fs";
import path from "path";

const dragFile = path.resolve("docs/meta/drag.md");

interface FeedbackEvent {
  module: string;
  event: string;
  value: number;
}

interface RedesignProposal {
  module: string;
  recommendation: string;
}

export function processFeedback(events: FeedbackEvent[]): RedesignProposal[] {
  const proposals: RedesignProposal[] = [];

  for (const e of events) {
    if (e.event === "bounceRate" && e.value > 70) {
      proposals.push({
        module: e.module,
        recommendation: "Reduce bounce rate: improve copy clarity and navigation flow.",
      });
    }
    if (e.event === "formErrorRate" && e.value > 10) {
      proposals.push({
        module: e.module,
        recommendation: "Fix form validation UX and add inline error recovery.",
      });
    }
    if (e.event === "pageLoadTime" && e.value > 3000) {
      proposals.push({
        module: e.module,
        recommendation: "Optimize performance: lazy load heavy assets.",
      });
    }
  }

  if (proposals.length > 0) {
    const logEntry =
      `\n## Feedback Loop: ${new Date().toISOString()}\n` +
      proposals.map((p) => `- ${p.module}: ${p.recommendation}`).join("\n");
    fs.appendFileSync(dragFile, logEntry);
  }

  return proposals;
}

// CLI example
if (require.main === module) {
  console.log("Running feedback loop with sample events...");
  const sampleEvents: FeedbackEvent[] = [
    { module: "Navbar", event: "bounceRate", value: 75 },
    { module: "FormProvider", event: "formErrorRate", value: 15 },
    { module: "GlobalUIProvider", event: "pageLoadTime", value: 3200 },
  ];

  const results = processFeedback(sampleEvents);
  console.log("Redesign proposals generated:", results);
}
