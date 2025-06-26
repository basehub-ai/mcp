import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { authenticate } from "../utils/constants";

// Define the schema for tool parameters
export const schema = {
  message: z
    .string()
    .describe("The commit message describing the changes being committed"),
  force: z
    .boolean()
    .optional()
    .describe(
      "Whether to force the commit even if there are validation errors (defaults to false)"
    ),
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
export default async function commit({
  message,
  force,
}: InferSchema<typeof schema>) {
  try {
    const { write: token, ref } = await authenticate(
      "bshb_mcp_VV4rZuKEHpKxTrRuV7Z436LVNC4CBld6mPPakQxzoLSpQo6UQRP1Z4JHTSmseKfu"
    );
    // Commit pending transactions with the provided message
    const result = await basehub({ token, ref: ref.name }).mutation({
      transaction: {
        __args: {
          data: [
            {
              branchName: ref.name,
              type: "commit",
              message,
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
