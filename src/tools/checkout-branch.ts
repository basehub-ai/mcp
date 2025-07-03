import { z } from "zod";
import { type InferSchema } from "xmcp";
import { BASEHUB_APP_URL } from "../utils/constants";
import { getMcpToken, withLogging } from "../utils";

// Define the schema for tool parameters
export const schema = {
  branchName: z
    .string()
    .describe("The name of the branch to checkout/switch to"),
};

// Define tool metadata
export const metadata = {
  name: "checkout_branch",
  description: `Checkout (switch to) a specific branch in BaseHub. 
  This changes the current working branch to the specified branch name.`,
  annotations: {
    title: "Checkout BaseHub Branch",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
async function checkoutBranch({
  branchName,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    // Call the BaseHub MCP manage endpoint to checkout the branch
    const response = await fetch(`${BASEHUB_APP_URL}/api/mcp/manage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-basehub-mcp-token": mcpToken,
      },
      body: JSON.stringify({
        op: "checkout",
        targetRef: branchName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error checking out branch: ${
              errorData.error || `HTTP ${response.status}`
            }`,
          },
        ],
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error checking out branch: ${
              result.error || "Unknown error"
            }`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            message: `Successfully checked out branch '${branchName}'`,
            currentBranch: branchName,
            data: result.data,
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
          text: `Error checking out branch: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

// Export the wrapped function with logging
export default withLogging("checkout_branch", checkoutBranch);
