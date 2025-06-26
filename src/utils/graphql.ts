import { z } from "zod";
import { BASEHUB_API_URL } from "./constants";

export const fetchBaseHubGraphQL = async <
  DataSchema extends z.ZodSchema | undefined = undefined
>({
  token,
  query,
  branchName,
  variables,
  dataSchema,
}: {
  token: string;
  query: string;
  branchName: string;
  variables?: Record<string, any>;
  dataSchema?: DataSchema;
}): Promise<
  DataSchema extends z.ZodSchema
    ? { data: z.infer<DataSchema>; errors: any }
    : { data: any; errors: any }
> => {
  const result = await fetch(BASEHUB_API_URL + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-basehub-token": token,
      "x-basehub-draft": "true",
      "x-basehub-ref": branchName,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await result.json();
  const parsed = z
    .object({ data: dataSchema ? dataSchema : z.any(), errors: z.any() })
    .safeParse(json);

  if (!parsed.success) {
    console.log(parsed.error.format());
    console.log(json);
    throw new Error("Failed to parse result from GraphQL request");
  }

  return parsed.data as any;
};
