import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { authenticate } from "../utils/auth";
import { basehubMutationResult, getMcpToken, withLogging } from "../utils";

// Define the schema for tool parameters
export const schema = {
  message: z
    .string()
    .describe("The commit message describing the changes being committed"),
};

// Define tool metadata
export const metadata = {
  name: "commit",
  description:
    "Create a new commit in BaseHub, publishing all draft changes (note: this not only commits your changes, but also other changes that may've been drafted by others).",
  annotations: {
    title: "Commit Changes",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
  },
};

// Tool implementation
async function commit({ message }: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: writeToken, ref, userId } = await authenticate(mcpToken);
    // Commit pending transactions with the provided message
    const result = await basehub({ token: writeToken, ref: ref.name }).mutation(
      {
        transaction: {
          __args: {
            data: [
              {
                branchName: ref.name,
                type: "commit",
                message,
              },
            ],
            authorId: userId,
          },
          message: true,
          status: true,
        },
      }
    );

    const transaction = basehubMutationResult.parse(result);

    if (transaction.status === "Failed") {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Mutation failed: ${transaction.message ?? "Unknown error"}.`,
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
export default withLogging("commit", commit);
