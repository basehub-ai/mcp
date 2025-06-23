import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { DeleteOpSchema } from "@basehub/mutation-api-helpers";
import { basehubMutationResult } from "../utils";

export const schema = {
  data: z
    .array(DeleteOpSchema)
    .describe("Array of objects with the block ids to delete"),
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
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
  },
};

export default async function deleteBlocks({
  data,
  autoCommit,
}: InferSchema<typeof schema>) {
  try {
    const result = await basehub().mutation({
      transaction: {
        __args: {
          data: data.map((id) => ({ id, type: "delete" })),
          ...(autoCommit ? { autoCommit } : {}),
        },
        message: true,
        status: true,
        duration: true,
      },
    });

    const parsedResult = basehubMutationResult.parse(result);
    if (parsedResult.transaction.status === "Failed") {
      throw new Error(
        `Transaction failed: ${parsedResult.transaction.message}`
      );
    }

    return {
      content: [{ type: "text", text: JSON.stringify(parsedResult) }],
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
