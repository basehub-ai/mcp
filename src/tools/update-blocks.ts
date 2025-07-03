import { authenticate } from "../utils/auth";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { basehub } from "basehub";
import { basehubMutationResult, getMcpToken, withLogging } from "../utils";
import { FAILED_MUTATION_HELP_TEXT } from "../utils/constants";
// TODO: Use transaction helpers from basehub
const CreateBlockStandardSchema = z.object({
  title: z.string().nullable().optional(),
  apiName: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  transactionId: z.string().nullable().optional(),
  hidden: z.boolean().optional(),
  searchIndex: z.boolean().optional(),
  previewURL: z.string().optional(),
  description: z.string().optional(),
  idempotency: z
    .object({
      key: z.enum(["id", "title", "slug", "apiName"]),
      value: z.string(),
    })
    .optional(),
});

const UpdateBlockStandardSchema = CreateBlockStandardSchema.pick({
  hidden: true,
  previewURL: true,
  searchIndex: true,
  slug: true,
  title: true,
  apiName: true,
  description: true,
}).partial();

const UpdateOpSchema = z
  .object({
    id: z.string(),
    value: z.record(z.string(), z.any()).optional(),
  })
  .merge(UpdateBlockStandardSchema);

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
  description: `Update one or more BaseHub blocks in a single transaction. see block types for reference.
When updating layout (document, instance, etc.) blocks, use value: { childApiName: ..., ... } to update the children blocks.`,
  annotations: {
    title: "Update BaseHub Blocks",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

async function updateBlocks({
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
