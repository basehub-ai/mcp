import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { CreateOpSchema } from "@basehub/mutation-api-helpers";

// Define the schema for tool parameters
export const schema = {
  parentId: z
    .string()
    .optional()
    .describe(
      "Optional ID of the parent block. If provided, the new blocks will be created as children of this block. If not provided, the blocks will be created at the root level."
    ),
  data: z
    .array(CreateOpSchema)
    .describe(
      "Array of block creation objects, each with its own type and value. See block types in BaseHub for details."
    ),
  autoCommit: z
    .string()
    .optional()
    .describe(
      "Optional commit message. If provided, the transaction will be auto-committed with this message."
    ),
};

// Define tool metadata
export const metadata = {
  name: "create_blocks",
  description:
    "Create one or more BaseHub blocks (with possible nested children) in a single transaction.",
  annotations: {
    title: "Create BaseHub Blocks",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function createBlocks({
  parentId,
  data,
  autoCommit,
}: InferSchema<typeof schema>) {
  // Send the mutation as a transaction
  const result = await basehub().mutation({
    transaction: {
      __args: {
        data: data.map((itemData) => ({
          type: "create",
          parentId,
          data: itemData,
        })),
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
