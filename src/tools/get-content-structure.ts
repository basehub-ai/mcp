import { authenticate } from "../utils/auth";
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { basehub } from "basehub";
import { getMcpToken, withLogging } from "../utils";

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
  name: "get_content_structure",
  description:
    "Retrieve the structure of the current BaseHub repository in XML format and optional documentation. Use when you need to know the structure / schema / blocks / tree of the repository.",
  annotations: {
    title: "Retrieve BaseHub Repository Structure",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
async function getRepositoryStructure({
  focus,
  draft,
  targetBlock,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: token, ref } = await authenticate(mcpToken);

    const result = await basehub({ token, ref: ref.name, draft }).query({
      _structure: {
        __args: {
          resolveTargetsWith: "objectName",
          ...(targetBlock?.id
            ? { targetBlock: { ...targetBlock, focus: focus ?? false } }
            : {}),
        },
      },
    });

    let content: { type: "text"; text: string }[] = [];

    content.push({
      type: "text",
      text:
        z.object({ _structure: z.string().nullable() }).parse(result)
          ._structure || "The repository structure is empty",
    });
    content.push({
      type: "text",
      text: "Note: in order to understand more about the different block types and ways to mutate them, use the search_developer_docs tool (e.g. search_developer_docs(query: 'query guidelines rich-text') or search_developer_docs(query: 'mutation date block'))",
    });

    return { content };
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

// Export the wrapped function with logging
export default withLogging("get_content_structure", getRepositoryStructure);
