import { z } from "zod";
import { type InferSchema } from "xmcp";
import { authenticate } from "../utils/constants";
import { basehub } from "basehub";
import { getMcpToken } from "../utils";

// Define the schema for tool parameters
export const schema = {
  baseBranchName: z
    .string()
    .describe("The name of the existing branch to base the new branch on"),
  branchName: z.string().describe("The name for the new branch to create"),
  description: z
    .string()
    .optional()
    .describe("Optional description for the new branch"),
};

// Define tool metadata
export const metadata = {
  name: "create_branch",
  description: `Create a new branch based on an existing branch in BaseHub. 
  The new branch will be created from the specified base branch and optionally checked out.`,
  annotations: {
    title: "Create BaseHub Branch",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

// Tool implementation
export default async function createBranch({
  baseBranchName,
  branchName,
  description,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: token, ref, userId } = await authenticate(mcpToken);

    const result = await basehub({ token, ref: ref.name }).mutation({
      transaction: {
        __args: {
          authorId: userId,
          data: [
            {
              type: "create-branch",
              baseBranchName,
              branchName: branchName,
              description: description || "",
            },
          ],
        },
        message: true,
        status: true,
        duration: true,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            message: `Branch '${branchName}' created successfully from '${baseBranchName}'`,
            result: result,
          }),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error creating branch: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}
