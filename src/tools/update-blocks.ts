import { authenticate } from "../utils/auth";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { basehub } from "basehub";
import { getMcpToken } from "../utils";

export const schema = {
  data: z
    .array(z.object({ id: z.string() }).passthrough())
    .describe(
      "Array of update objects, each with at least 'id' and update fields. see block types for reference. When updating layout (document, instance, etc.) blocks, use value: { childApiName: ..., ... } to update the children blocks."
    ),
  autoCommit: z
    .string()
    .optional()
    .describe(
      "Optional commit message. If provided, the transaction will be auto-committed with this message. Don't provide unless the user asks for it."
    ),
};

export const metadata = {
  name: "update_blocks",
  description: `Update one or more BaseHub blocks in a single transaction.
When updating layout (document, instance, etc.) blocks, use value: { childApiName: ..., ... } to update the children blocks.`,
  annotations: {
    title: "Update BaseHub Blocks",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

export default async function updateBlocks({
  data,
  autoCommit,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: token, ref, userId } = await authenticate(mcpToken);
    const result = await basehub({ token, ref: ref.name }).mutation({
      transaction: {
        __args: {
          authorId: userId,
          data: data.map((item) => ({ ...item, type: "update", id: item.id })),
          ...(autoCommit ? { autoCommit } : {}),
        },
        message: true,
        status: true,
        duration: true,
      },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}
