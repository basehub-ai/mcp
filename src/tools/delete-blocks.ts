import { basehubMutationResult } from "../utils";
import { authenticate } from "../utils/constants";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { DeleteOpSchema } from "@basehub/mutation-api-helpers";
import { basehub } from "basehub";

export const schema = {
  data: z
    .array(DeleteOpSchema)
    .describe("Array of objects with the block ids to delete"),
  autoCommit: z
    .string()
    .optional()
    .describe(
      "Optional commit message. If provided, the transaction will be auto-committed with this message. Don't provide unless the user asks for it."
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
    const { write: token, ref } = await authenticate(
      "bshb_mcp_VV4rZuKEHpKxTrRuV7Z436LVNC4CBld6mPPakQxzoLSpQo6UQRP1Z4JHTSmseKfu"
    );
    const result = await basehub({ token, ref: ref.name }).mutation({
      transaction: {
        __args: {
          data: data.map((data) => ({ ...data, type: "delete" })),
          ...(autoCommit ? { autoCommit } : {}),
        },
        message: true,
        status: true,
        duration: true,
      },
    });

    const parsedResult = basehubMutationResult.parse(result);

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
