import { basehub } from "basehub";
import { mcpRequest, authenticate } from "../utils";
import { z } from "zod";

export const schema = {
  limit: z.number().optional().describe("The number of branches to list"),
  offset: z
    .number()
    .optional()
    .describe("The offset to start listing branches from"),
};

export const metadata = {
  name: "list_branches",
  description: "List all branches in the current repository.",
  annotations: {
    title: "List Branches",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function listBranches({
  limit,
  offset,
}: {
  limit?: number;
  offset?: number;
}) {
  try {
    const { write: token, ref } = await authenticate(
      "bshb_mcp_F8sqfEhxrNPEWmU5LRIz1"
    );
    const result = await basehub({ token, ref: ref.name }).query({
      _sys: {
        branches: {
          __args: {
            ...(limit ? { limit } : {}),
            ...(offset ? { offset } : {}),
          },
          items: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result._sys.branches.items),
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify(error) }],
    };
  }
}
