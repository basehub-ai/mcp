import { basehub } from "basehub";
import { getMcpToken } from "../utils";
import { authenticate } from "../utils/auth";
import { withLogging } from "../utils/logger";
import { z } from "zod";
import { InferSchema } from "xmcp";

export const schema = {
  simplified: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to simplify the diff"),
};

// Define tool metadata
export const metadata = {
  name: "get_diff",
  description: `Get the diff between the WIP and the head commit in BaseHub.
  This is useful for getting the diff between the WIP and the head commit in BaseHub.
  To only know which blocks changed, set simplified to true. If you need to know the exact content changes, set simplified to false.
  `,
  annotations: {
    title: "Get Diff Between WIP and Head Commit",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
  },
};

async function getDiff({ simplified }: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { read: token, ref } = await authenticate(mcpToken);

    const result = await basehub({ token, ref: ref.name }).query({
      _diff: {
        __args: {
          simplified,
        },
      },
    });

    const diff = z
      .object({ _diff: z.record(z.string(), z.unknown()) })
      .parse(result)._diff;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(diff, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error getting diff: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

export default withLogging("get_diff", getDiff);
