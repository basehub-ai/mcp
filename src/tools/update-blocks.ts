import { authenticate } from "../utils/constants";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { UpdateOpSchema } from "@basehub/mutation-api-helpers";
import { basehub } from "basehub";

export const schema = {
  data: z
    .array(UpdateOpSchema.omit({ children: true }))
    .describe(
      "Array of update objects, each with at least 'id', 'type', and update fields. block 'type' key is crucial to make updates, see block types for reference."
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
  description: "Update one or more BaseHub blocks in a single transaction.",
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
    const { write: token, ref } = await authenticate(
      "bshb_mcp_F8sqfEhxrNPEWmU5LRIz1"
    );
    const result = await basehub({ token, ref: ref.name }).mutation({
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
