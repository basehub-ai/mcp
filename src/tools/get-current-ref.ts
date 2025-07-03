import { type InferSchema } from "xmcp";
import { authenticate } from "../utils/auth";
import { getMcpToken, withLogging } from "../utils";

// Define the schema for tool parameters (no parameters needed for get-current-ref)
export const schema = {};

// Define tool metadata
export const metadata = {
  name: "get_current_ref",
  description: `Get the current branch/ref in BaseHub. 
This returns information about the currently active branch.`,
  annotations: {
    title: "Get Current BaseHub Branch",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
async function getCurrentRef({}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { ref } = await authenticate(mcpToken);

    if (!ref) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error getting current ref: "Missing ref object"`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(ref),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error getting current ref: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

// Export the wrapped function with logging
export default withLogging("get_current_ref", getCurrentRef);
