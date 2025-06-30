import { authenticate } from "../utils/auth";
import { z } from "zod";
import { type InferSchema } from "xmcp";
// import { MergeBranchOpSchema } from "@basehub/mutation-api-helpers";
import { basehub } from "basehub";
import { getMcpToken } from "../utils";

// (MergeBranchOpSchema)
export const schema = {
  baseBranchName: z
    .string()
    .describe("The base or destination branch to merge into."),
  sourceBranchName: z
    .string()
    .optional()
    .describe(
      "The optional source branch will be merged into the base branch. By default the source branch is the current branch."
    ),
  autoCreateContentRequest: z
    .object({
      title: z.string(),
      description: z.string().optional(),
    })
    .optional()
    .describe(
      `If there's no content request, and autoCreateContentRequest is provided, a content request will be created with the title and description provided.`
    ),
};

export const metadata = {
  name: "merge_branch",
  description: "Merge a BaseHub branch into another branch.",
  annotations: {
    title: "Merge BaseHub Branch",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

export default async function mergeBranch({
  baseBranchName,
  sourceBranchName,
  autoCreateContentRequest,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: token, ref, userId } = await authenticate(mcpToken);
    const result = await basehub({ token, ref: ref.name }).mutation({
      transaction: {
        __args: {
          authorId: userId,
          data: {
            type: "merge-branch",
            baseBranchName,
            sourceBranchName,
            autoCreateContentRequest,
          },
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
