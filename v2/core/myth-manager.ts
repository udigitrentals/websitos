import fs from "fs";
import path from "path";

const mythFile = path.resolve("docs/meta/myth_cycles.md");
const mythLibrary = path.resolve("docs/meta/myth_library.md");

interface Myth {
  name: string;
  status: "active" | "pruned" | "seeded";
  resonance: number; // 0–100
}

function loadLibrary(): Myth[] {
  if (!fs.existsSync(mythLibrary)) return [];
  const raw = fs.readFileSync(mythLibrary, "utf-8");
  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => ({
      name: line.replace("- ", "").trim(),
      status: "active",
      resonance: Math.floor(Math.random() * 21) + 80,
    }));
}

function appendToLibrary(myth: Myth) {
  fs.appendFileSync(mythLibrary, `\n- ${myth.name}`);
}

export function updateMythCyclesAutonomous() {
  const myths = loadLibrary();
  const pruned: Myth[] = [];
  const seeded: Myth[] = [];

  myths.forEach((myth) => {
    if (myth.resonance < 85) {
      myth.status = "pruned";
      pruned.push(myth);
    }
  });

  const newMyths: Myth[] = [
    { name: `Myth-Resonance-${Date.now()}`, status: "seeded", resonance: 90 },
    { name: `Myth-Balance-${Date.now()}`, status: "seeded", resonance: 92 },
  ];

  newMyths.forEach((m) => {
    appendToLibrary(m);
    seeded.push(m);
  });

  const logEntry = `\n## Cycle: ${new Date().toISOString()}\n` +
    (pruned.length > 0 ? `Pruned myths: ${pruned.map((m) => m.name).join(", ")}\n` : "") +
    (seeded.length > 0 ? `Seeded myths: ${seeded.map((m) => m.name).join(", ")}\n` : "");

  fs.appendFileSync(mythFile, logEntry);
}

// CLI / CI runner
if (require.main === module) {
  console.log("Running autonomous myth reseeding...");
  updateMythCyclesAutonomous();
  console.log("Myth cycles updated with autonomous reseeding.");
}