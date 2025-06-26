import { type InferSchema } from "xmcp";
import { authenticate } from "../utils/constants";

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
export default async function getCurrentRef({}: InferSchema<typeof schema>) {
  try {
    // Call the BaseHub MCP manage endpoint to get current ref
    const { ref } = await authenticate(
      "bshb_mcp_VV4rZuKEHpKxTrRuV7Z436LVNC4CBld6mPPakQxzoLSpQo6UQRP1Z4JHTSmseKfu"
    );

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
