import { z } from "zod";
import { type InferSchema } from "xmcp";
import { fetchBaseHubGraphQL } from "../utils/graphql";
import { getMcpToken } from "../utils";

// Define the schema for tool parameters
export const schema = {
  format: z
    .enum(["sdl", "json"])
    .optional()
    .default("sdl")
    .describe(
      "Format to return the schema in: 'sdl' for Schema Definition Language or 'json' for full introspection result"
    ),
};

// Define tool metadata
export const metadata = {
  name: "get_graphql_schema",
  description:
    "Fetch the GraphQL schema from BaseHub to understand available types to query.",
  annotations: {
    title: "Get GraphQL Schema",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Full introspection query
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Convert introspection result to SDL
function introspectionToSDL(introspection: any): string {
  const schema = introspection.data.__schema;
  let sdl = "";

  // Helper to format type reference
  const formatTypeRef = (type: any): string => {
    if (type.kind === "NON_NULL") {
      return formatTypeRef(type.ofType) + "!";
    }
    if (type.kind === "LIST") {
      return "[" + formatTypeRef(type.ofType) + "]";
    }
    return type.name;
  };

  // Add types
  schema.types
    .filter((type: any) => !type.name.startsWith("__"))
    .forEach((type: any) => {
      if (type.kind === "OBJECT") {
        sdl += `type ${type.name} {\n`;
        type.fields?.forEach((field: any) => {
          const args =
            field.args.length > 0
              ? "(" +
                field.args
                  .map((arg: any) => `${arg.name}: ${formatTypeRef(arg.type)}`)
                  .join(", ") +
                ")"
              : "";
          sdl += `  ${field.name}${args}: ${formatTypeRef(field.type)}\n`;
        });
        sdl += "}\n\n";
      } else if (type.kind === "INPUT_OBJECT") {
        sdl += `input ${type.name} {\n`;
        type.inputFields?.forEach((field: any) => {
          sdl += `  ${field.name}: ${formatTypeRef(field.type)}\n`;
        });
        sdl += "}\n\n";
      } else if (type.kind === "ENUM") {
        sdl += `enum ${type.name} {\n`;
        type.enumValues?.forEach((value: any) => {
          sdl += `  ${value.name}\n`;
        });
        sdl += "}\n\n";
      } else if (
        type.kind === "SCALAR" &&
        !["String", "Int", "Float", "Boolean", "ID"].includes(type.name)
      ) {
        sdl += `scalar ${type.name}\n\n`;
      }
    });

  return sdl;
}

// Tool implementation
export default async function getGraphQLSchema({
  format,
}: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const result = await fetchBaseHubGraphQL({
      token: mcpToken,
      query: INTROSPECTION_QUERY,
      branchName: "main",
    });

    if (result.errors) {
      return {
        isError: true,
        content: [
          { type: "text", text: JSON.stringify(result.errors, null, 2) },
        ],
      };
    }

    if (format === "json") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Convert to SDL format
    const sdl = introspectionToSDL(result);

    return {
      content: [
        {
          type: "text",
          text: sdl,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error fetching GraphQL schema: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}
