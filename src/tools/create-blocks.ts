import { authenticate } from "../utils/auth";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import {
  CreateOpSchema,
  mutationApiAvailableBlockTypes,
} from "@basehub/mutation-api-helpers";
import { basehub } from "basehub";
import { getMcpToken, basehubMutationResult, withLogging } from "../utils";
import { FAILED_MUTATION_HELP_TEXT } from "../utils/constants";

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
  description: `Create one or more BaseHub blocks (with possible nested children).
  Children should be always nested in the value key of its parent, never as another item in the array.
Use create_blocks to add new blocks. Create data objects require specifying the block type and its initial values.

### Basic Create Structure
\`\`\`json
{
  "parentId"?: "<layout-block-id>",
  "data": {
    "type": ${Object.values(mutationApiAvailableBlockTypes)
      .map((val) => `"${val}"`)
      .join(" | ")},
    "title": "<block-title>",
    "value": <block-value-dependant-on-type>
  }
}
\`\`\`
`,
  annotations: {
    title: "Create BaseHub Blocks",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

// Tool implementation
async function createBlocks({
  parentId,
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
          data: data.map((itemData) => ({
            type: "create",
            parentId,
            data: itemData,
          })),
          ...(autoCommit ? { autoCommit } : {}),
        },
        message: true,
        status: true,
      },
    });

    const transaction = basehubMutationResult.parse(result);

    if (transaction.status === "Failed") {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Mutation failed: ${transaction.message ?? "Unknown error"}.`,
          },
          {
            type: "text",
            text: FAILED_MUTATION_HELP_TEXT,
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: `Transaction ${transaction.status}` }],
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

// Export the wrapped function with logging
export default withLogging("create_blocks", createBlocks);
