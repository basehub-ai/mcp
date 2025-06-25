import { z } from "zod";

export const basehubMutationResult = z.object({
  transaction: z.object({
    message: z.string().optional(),
    status: z.string(),
  }),
});
