import { authenticate } from "../utils/constants";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { BASEHUB_BLOCK_TYPES } from "../utils/constants";
import { basehub } from "basehub";
import { getMcpToken } from "../utils";

// Define the schema for tool parameters
export const schema = {
  draft: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to use draft mode. Defaults to true. Draft mode returns the working tree (useful when you want to make changes to the CURRENT state of the repository), while non-draft mode returns the committed structure (useful when asked for production content)."
    ),
  targetBlock: z
    .object({
      id: z.string().optional().describe("ID of the target block to focus on."),
      label: z
        .string()
        .optional()
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
    "Retrieve the structure of the current BaseHub repository in XML format and possible block types. Use when you need to know the structure / schema / blocks / tree of the repository.",
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
  draft,
  targetBlock,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: token, ref } = await authenticate(mcpToken);

    const result = await basehub({ token, ref: ref.name }).query({
      _structure: {
        __args: {
          resolveTargetsWith: "objectName",
          ...(targetBlock?.id
            ? { targetBlock: { ...targetBlock, focus: focus ?? false } }
            : {}),
        },
      },
    });
    return {
      content: [
        {
          type: "text",
          text: BASEHUB_BLOCK_TYPES,
        },
        {
          type: "text",
          text:
            "_structure" in result ? result._structure : JSON.stringify(result),
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
