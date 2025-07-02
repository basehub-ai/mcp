import { z } from "zod";
import { headers } from "xmcp/headers";

const transactionSchema = z.object({
  status: z.enum(["Running", "Completed", "Failed", "Cancelled", "Scheduled"]),
  message: z.string().nullable(),
});

export const basehubMutationResult = z
  .object({
    transaction: transactionSchema,
  })
  .transform((data) => data.transaction);

export const getMcpToken = () => {
  const mcpToken = headers()["authorization"];
  if (typeof mcpToken !== "string") {
    throw new Error("No token provided");
  }
  return mcpToken.split(" ")[1];
};
