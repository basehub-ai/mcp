import { z } from "zod";
import { headers } from "xmcp/headers";

export const basehubMutationResult = z.object({
  transaction: z.object({
    message: z.string().optional(),
    status: z.string(),
  }),
});

export const getMcpToken = () => {
  const mcpToken = headers()["Authorization"];
  if (typeof mcpToken !== "string") {
    throw new Error("No token provided");
  }
  return mcpToken.split(" ")[1];
};
