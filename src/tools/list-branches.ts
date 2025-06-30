import { basehub } from "basehub";
import { authenticate } from "../utils/auth";
import { z } from "zod";
import { getMcpToken } from "../utils";

export const schema = {
  limit: z.number().optional().describe("The number of branches to list"),
  offset: z
    .number()
    .optional()
    .describe("The offset to start listing branches from"),
};

export const metadata = {
  name: "list_branches",
  description: "List all branches in the current BaseHub repository.",
  annotations: {
    title: "List BaseHub Branches",
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
    const mcpToken = getMcpToken();
    const { write: token, ref } = await authenticate(mcpToken);
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

    const branchesResponse = z
      .object({
        _sys: z.object({
          branches: z.object({
            items: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                createdAt: z.string(),
              })
            ),
          }),
        }),
      })
      .parse(result);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(branchesResponse._sys.branches.items),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify(error) }],
    };
  }
}
