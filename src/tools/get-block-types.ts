import { type InferSchema } from "xmcp";
import { BASEHUB_BLOCK_TYPES, mcpRequest, authenticate } from "../utils";

// Define the schema for tool parameters
export const schema = {};

// Define tool metadata
export const metadata = {
  name: "get_block_types",
  description:
    "Retrieve all block types and its uses in a comprehensive markdown content. Useful for writing BaseHub mutations.",
  annotations: {
    title: "Get Block Types",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function getBlockTypes() {
  try {
    return {
      content: [
        {
          type: "text",
          text: BASEHUB_BLOCK_TYPES,
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
