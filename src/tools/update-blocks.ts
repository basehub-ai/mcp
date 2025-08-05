import { authenticate } from "../utils/auth";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { basehub } from "basehub";
import { basehubMutationResult, getMcpToken, withLogging } from "../utils";
import { FAILED_MUTATION_HELP_TEXT } from "../utils/constants";
import { UpdateOpSchema } from "@basehub/mutation-api-helpers";

export const schema = {
  data: z
    .array(UpdateOpSchema)
    .describe(
      "Array of update objects, each with at least 'id' and update fields."
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
  description: `Use update_blocks to modify existing blocks. You must specify the block ID and the properties you want to change.
### Update Structure
\`\`\`json (example)
{
  "autoCommit"?: "<commit-message>",
  "data": [{
    "id": "<layout-block-id>",
    "value": {
      // primitive block updates go here
    }
    "variantOverrides": {
      // optional record of <variant-set-api-name>-<variant-apiName> and block value
    }
  }]
}
\`\`\`

Notice how the update syntax is the same as the create operation of the \`instance\` block: by API Name directly!
`,
  annotations: {
    title: "Update BaseHub Blocks",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

async function updateBlocks({ data, autoCommit }: InferSchema<typeof schema>) {
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
      content: [
        {
          type: "text",
          text: `Transaction ${transaction.status}`,
        },
      ],
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
export default withLogging("update_blocks", updateBlocks);
