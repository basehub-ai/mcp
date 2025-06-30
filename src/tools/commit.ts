import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { authenticate } from "../utils/constants";
import { getMcpToken } from "../utils";

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
    "Commit pending transactions in the BaseHub repository with a descriptive message",
  annotations: {
    title: "Commit Changes",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

// Tool implementation
export default async function commit({ message }: InferSchema<typeof schema>) {
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
          duration: true,
        },
      }
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
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
