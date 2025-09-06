import { runAutonomousRedesign } from "../../v2/core/autonomous-redesign";
import { updateMythCyclesAutonomous } from "../../v2/core/myth-manager";
import { translate } from "../../v2/core/localization-engine";
import { scanAndFixBias } from "../../v2/core/modules/biasFirewall";
import { decideAutonomy } from "../../v2/core/self-governance";
import fs from "fs";
import path from "path";

describe("Autonomy Simulation Test", () => {
  it("runs a full autonomy cycle", () => {
    // 1. Autonomous redesign
    runAutonomousRedesign([
      { module: "Navbar", event: "bounceRate", value: 75 },
      { module: "GlobalUIProvider", event: "pageLoadTime", value: 4000 },
    ]);

    // 2. Myth reseeding
    updateMythCyclesAutonomous();

    // 3. Localization auto-fill
    const jp = translate("welcome", "jp");
    expect(jp).toContain("JP translation pending");

    // 4. Bias auto-refactor
    const testFile = path.resolve("v2/config/system.json");
    fs.writeFileSync(testFile, '{ "legacy": "whitelist" }');
    scanAndFixBias(testFile);
    const updated = fs.readFileSync(testFile, "utf-8");
    expect(updated).toContain("allowlist");

    // 5. Governance decisions
    const d1 = decideAutonomy("bias fix applied", "system.json");
    const d2 = decideAutonomy("archetype shift proposed", "Navbar");
    expect(d1.type).toBe("auto-execute");
    expect(d2.type).toBe("treaty-required");
  });
});
