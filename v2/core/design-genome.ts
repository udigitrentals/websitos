import { z } from "zod";

export const GenomeSchema = z.object({
  id: z.string(),
  function: z.string(),
  dependencies: z.array(z.string()),
  gardener_role: z.enum(["seeder", "grower", "pruner", "reconciler"]),
  archetype: z.string(),
  myth_alignment: z.string(),
  cultural_tags: z.array(z.string()),
  version: z.string().regex(/^v[0-9]+\.[0-9]+$/),
  lineage: z.string(), // path to lineage log
  cultural_weight: z.number().min(0).max(100),
});

export type Genome = z.infer<typeof GenomeSchema>;

export function validateGenome(module: Genome) {
  const parsed = GenomeSchema.safeParse(module);
  if (!parsed.success) {
    throw new Error(`Genome validation failed: ${JSON.stringify(parsed.error.issues)}`);
  }
  return parsed.data;
}
