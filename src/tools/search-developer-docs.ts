import { z } from "zod";
import { type InferSchema } from "xmcp";
import { withLogging } from "../utils";

export const schema = {
  query: z.string(),
  page: z
    .number()
    .optional()
    .describe("The page number to search (optional).")
    .default(1),
  perPage: z
    .number()
    .optional()
    .describe("The number of results to return per page (optional).")
    .default(10),
};

export const metadata = {
  name: "search_developer_docs",
  description: `Search the BaseHub developer docs.`,
  annotations: {
    title: "Search BaseHub Developer Docs",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

async function searchDeveloperDocs({
  query,
  page,
  perPage,
}: InferSchema<typeof schema>) {
  try {
    const result = await fetch("https://docs.basehub.com/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, page, perPage }),
    }).then((res) => res.json());

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error getting token` }],
    };
  }
}

export default withLogging("search_docs", searchDeveloperDocs);
