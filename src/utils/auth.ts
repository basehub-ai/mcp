import z from "zod";
import { BASEHUB_APP_URL } from "./constants";

export const authenticate = async (token: string) => {
  const response = await fetch(`${BASEHUB_APP_URL}/api/mcp/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to authenticate: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();
  const schema = z.object({
    read: z.string(),
    write: z.string(),
    ref: z.object({
      type: z.enum(["branch", "commit"]),
      id: z.string(),
      name: z.string().optional(),
    }),
    userId: z.string(),
  });

  return schema.parse(result);
};
