import { validateGenome } from "../v2/core/design-genome";
describe("Website OS V2 Contract Tests", () => {
  it("validates genome compliance", () => {
    expect(() =>
      validateGenome({
        id: "SEOProvider",
        function: "Provides SEO metadata",
        dependencies: [],
        gardener_role: "seeder",
        archetype: "Guide",
        myth_alignment: "renewal",
        cultural_tags: ["visibility"],
        version: "v1.0",
        lineage: "docs/meta/lineage.md",
        cultural_weight: 90,
      })
    ).not.toThrow();
  });
});
