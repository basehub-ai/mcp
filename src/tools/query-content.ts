import { z } from "zod";
import { type InferSchema } from "xmcp";
import { fetchBaseHubGraphQL } from "../utils/graphql";
import { authenticate } from "../utils/constants";
import { getMcpToken } from "../utils";

// Define the schema for tool parameters
export const schema = {
  query: z
    .string()
    .describe(
      "The GraphQL query to execute against the BaseHub content repository."
    ),
  variables: z
    .record(z.string(), z.any())
    .optional()
    .describe("Variables for the GraphQL query."),
};

// Define tool metadata
export const metadata = {
  name: "query_content_repository",
  description: `Query the BaseHub content repository. Use this as you need to get content created by the user, or specific IDs for subsequent content changes.
When querying content:
- Use proper GraphQL syntax
- Include necessary fields and arguments
- Be mindful of query depth and complexity
- Use fragments for reusable field sets
- Consider using variables for dynamic queries`,
  annotations: {
    title: "Query BaseHub Content Repository",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function queryContentRepository({
  query,
  variables,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { read: token, ref } = await authenticate(mcpToken);
    const result = await fetchBaseHubGraphQL({
      token,
      query,
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
