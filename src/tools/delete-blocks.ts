import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";

export const schema = {
  data: z
    .array(z.object({ id: z.string().describe("ID of the block to delete") }))
    .describe("Array of delete objects, each with at least 'id'."),
  autoCommit: z
    .string()
    .optional()
    .describe(
      "Optional commit message. If provided, the transaction will be auto-committed with this message."
    ),
};

export const metadata = {
  name: "delete_blocks",
  description: "Delete one or more BaseHub blocks in a single transaction.",
  annotations: {
    title: "Delete BaseHub Blocks",
    readOnlyHint: true,
    destructiveHint: true,
    idempotentHint: false,
  },
};

export default async function deleteBlocks({
  data,
  autoCommit,
}: InferSchema<typeof schema>) {
  const result = await basehub().mutation({
    transaction: {
      __args: {
        data: { type: "delete", data },
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
