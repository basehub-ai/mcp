import { z } from "zod";
import { type InferSchema } from "xmcp";
import { authenticate } from "../utils/auth";
import { getMcpToken, withLogging } from "../utils";

export const schema = {
  type: z.enum(["read", "write"]).optional().default("read"),
};

export const metadata = {
  name: "get_token",
  description: `Get a BASEHUB_TOKEN.`,
  annotations: {
    title: "Get BaseHub Token",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

async function getToken({ type }: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { read, write } = await authenticate(mcpToken);
    const resolved = type === "read" ? read : write;

    return { content: [{ type: "text", text: resolved }] };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error getting token` }],
    };
  }
}

export default withLogging("get_token", getToken);
