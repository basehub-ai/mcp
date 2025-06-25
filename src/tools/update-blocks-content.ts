import { basehub } from "basehub";
import { z } from "zod";
import type { InferSchema } from "xmcp";

export const schema = {
  updates: z
    .array(
      z.object({
        component: z
          .string()
          .describe("Component type (e.g. 'hero', 'features')"),
        field: z
          .string()
          .describe("Field to update (e.g. 'title', 'subtitle')"),
        value: z.string().describe("New value for the field"),
      })
    )
    .min(1, "You must provide at least one field to update."),
  autoCommit: z.string().optional().describe("Optional commit message"),
};

export const metadata = {
  name: "update_blocks_content",
  description: `
Before using this MCP, make sure you've read the \`basehub.d.ts\` file in your codebase to use the correct component names.

This MCP updates multiple BaseHub component fields in a single batch.

Example input:
[
  { "component": "<component_name>", "field": "title", "value": "New title!" },
  { "component": "<component_name>", "field": "subtitle", "value": "New subtitle!" }
]
`,
  annotations: {
    title: "Update Blocks Content",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function smartUpdateBlock({
  updates,
  autoCommit,
}: InferSchema<typeof schema>) {
  try {
    const updatesByComponent = updates.reduce<
      Record<string, Array<{ field: string; value: string }>>
    >((acc, { component, field, value }) => {
      if (!acc[component]) {
        acc[component] = [];
      }
      acc[component].push({ field, value });
      return acc;
    }, {});

    const query = {
      _componentInstances: Object.keys(updatesByComponent).reduce(
        (acc, component) => {
          acc[component] = { items: { _id: true } };
          return acc;
        },
        {} as Record<string, { items: { _id: boolean } }>
      ),
    };

    const response = (await basehub().query(query)) as {
      _componentInstances?: Record<string, { items?: Array<{ _id?: string }> }>;
    };

    console.log("test", JSON.stringify(response));

    if (!response._componentInstances) {
      throw new Error("Failed to fetch component instances");
    }

    const transactionData = Object.entries(updatesByComponent).map(
      ([component, fields]) => {
        const instance = response._componentInstances?.[component]?.items?.[0];
        if (!instance?._id) {
          throw new Error(`No instance found for component "${component}"`);
        }

        const updateData = fields.reduce<
          Record<string, { type: "text"; value: unknown }>
        >((acc, { field, value }) => {
          acc[field] = { type: "text", value };
          return acc;
        }, {});

        return {
          id: instance._id,
          type: "update" as const,
          value: updateData,
        };
      }
    );

    const result = await basehub().mutation({
      transaction: {
        __args: {
          data: transactionData,
          // TODO: research auto commit AI criteria (mainly used for dev env)
          // ...(autoCommit ? { autoCommit } : {}),
        },
        message: true,
        status: true,
        duration: true,
      },
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(`Smart update block failed: ${errorMessage}`);
  }
}
