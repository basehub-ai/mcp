import { CreateOp } from "basehub/api-transaction";
import { z } from "zod";
import { type InferSchema } from "xmcp";

const d: CreateOp = {};

// Define the schema for tool parameters
export const schema = {
  type: z.enum(["text"]).describe("First number to add"),
  b: z.number().describe("Second number to add"),
};

// Define tool metadata
export const metadata = {
  name: "create_block",
  description: "Create a new BaseHub block.",
};

// Tool implementation
export default async function createBlock({
  type,
  b,
}: InferSchema<typeof schema>) {
  return {
    content: [{ type: "text", text: String(a + b) }],
  };
}
