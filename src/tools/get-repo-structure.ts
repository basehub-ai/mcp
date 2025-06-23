import { basehub } from "basehub";
import { z } from "zod";
import { type InferSchema } from "xmcp";

// Define the schema for tool parameters
export const schema = {
  targetBlock: z
    .object({
      id: z.string().describe("ID of the target block to focus on."),
      label: z
        .string()
        .describe(
          "Label for the target block, used for focus context. Will be next to the block that matches the ID."
        ),
    })
    .optional()
    .describe(""),
  focus: z
    .boolean()
    .optional()
    .describe(
      "Whether to focus on the target block and strip the rest. Defaults to false."
    ),
};

// Define tool metadata
export const metadata = {
  name: "get_repository_structure",
  description:
    "Retrieve the structure of the current BaseHub repository in XML format.",
  annotations: {
    title: "Retrieve BaseHub Repository Structure",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function getRepositoryStructure({
  focus,
  targetBlock,
}: InferSchema<typeof schema>) {
  try {
    // Send the mutation as a transaction
    const result = await basehub().query({
      _structure: {
        __args: {
          resolveTargetsWith: "objectName",
          focus: focus ?? false,
          ...(targetBlock ? { targetBlock } : {}),
        },
      },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
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
