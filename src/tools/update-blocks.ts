import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";

export const schema = {
  data: z
    .array(
      z
        .object({ id: z.string().describe("ID of the block to update") })
        .passthrough()
    )
    .describe(
      "Array of update objects, each with at least 'id', 'type', and update fields."
    ),
  autoCommit: z
    .string()
    .optional()
    .describe(
      "Optional commit message. If provided, the transaction will be auto-committed with this message."
    ),
};

export const metadata = {
  name: "update_blocks",
  description: "Update one or more BaseHub blocks in a single transaction.",
  annotations: {
    title: "Update BaseHub Blocks",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function updateBlocks({
  data,
  autoCommit,
}: InferSchema<typeof schema>) {
  const result = await basehub().mutation({
    transaction: {
      __args: {
        data: data.map((item) => ({ ...item, type: "update" })),
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
}
