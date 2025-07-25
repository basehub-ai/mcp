import { z } from "zod";
import { type InferSchema } from "xmcp";
import { fetchBaseHubGraphQL } from "../utils/graphql";
import { authenticate } from "../utils/auth";
import { getMcpToken, withLogging } from "../utils";

// Define the schema for tool parameters
export const schema = {
  query: z
    .string()
    .describe(
      "The GraphQL query to execute against the BaseHub content repository."
    ),
  draft: z
    .boolean()
    .optional()
    .describe(
      "Whether to query the draft content repository. Defaults to true."
    ),
  variables: z
    .record(z.string(), z.any())
    .optional()
    .describe("Variables for the GraphQL query."),
};

// Define tool metadata
export const metadata = {
  name: "query_content",
  description: `Query the BaseHub repository content. Use this as you need to get content created by the user, or specific IDs for subsequent content changes.
When querying content:
- Use proper GraphQL syntax
- Include necessary fields and arguments
- Be mindful of query depth and complexity
- Use fragments for reusable field sets
- Consider using variables for dynamic queries`,
  annotations: {
    title: "Query BaseHub Repository Content",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
async function queryContentRepository({
  query,
  variables,
  draft = true,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { read: token, ref } = await authenticate(mcpToken);
    const result = await fetchBaseHubGraphQL({
      token,
      query,
      draft,
      branchName: ref.name ?? "main",
      variables,
    });

    if (result.errors) {
      return {
        isError: true,
        content: [
          { type: "text", text: JSON.stringify(result.errors, null, 2) },
        ],
      };
    }

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
          text: `Error executing GraphQL query: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

// Export the wrapped function with logging
export default withLogging("query_content", queryContentRepository);
