import { type InferSchema } from "xmcp";
import { BASEHUB_BLOCK_TYPES } from "../utils";

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
export default async function createBlocks({}: InferSchema<typeof schema>) {
  return {
    content: [
      {
        type: "text",
        text: BASEHUB_BLOCK_TYPES,
      },
    ],
  };
}
