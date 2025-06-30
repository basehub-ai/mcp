import { authenticate } from "../utils/constants";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { CreateOpSchema } from "@basehub/mutation-api-helpers";
import { basehub } from "basehub";
import { getMcpToken } from "../utils";

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
      "Optional commit message. If provided, the transaction will be auto-committed with this message. Don't provide unless the user asks for it."
    ),
};

// Define tool metadata
export const metadata = {
  name: "create_blocks",
  description: `Create one or more BaseHub blocks (with possible nested children) in a single transaction.
  Children should be always nested in the value key of its parent, never as another item in the array.
  See block types in BaseHub for reference.`,
  annotations: {
    title: "Create BaseHub Blocks",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

// Tool implementation
export default async function createBlocks({
  parentId,
  data,
  autoCommit,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: token, ref } = await authenticate(mcpToken);

    const result = await basehub({ token, ref: ref.name }).mutation({
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
