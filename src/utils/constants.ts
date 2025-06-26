export const BASEHUB_APP_URL = "http://localhost:3000";
// export const BASEHUB_APP_URL = "http://basehub.dev";

// TODO: Some blocks as event or workflow are not present since we don't yet support them in the Mutation API.
export const BASEHUB_BLOCK_TYPES = `
    IMPORTANT: When writing block types for mutations, they go in kebab-case. E.g: RichText is written as 'rich-text'.
    ---
    
    # BaseHub Block Types
    
    ## Document
    Container for other blocks. Access directly by field name.
    - **Value Type**: Defined by its children (array of blocks)
    - **Usage**: \`fieldName { childField }\`
    - **Example**: Used as a root or section block to group other blocks.
    
    ---
    
    ## Text  
    Simple text field.
    - **Value Type**: \`string\`
    - **Usage**: \`fieldName\`
    - **Example**: Titles, short descriptions, or any plain text.
    
    ---
    
    ## RichText
    Rich text with multiple output formats.
    - **Value Type**:  
      \`\`\`ts
      {
        format: 'markdown' | 'html';
        value: string;
      }
      // or
      {
        format: 'json';
        value: string | unknown;
      }
      \`\`\`
    - **Usage**:  
      - Markdown: \`{ format: "markdown", value: "# Hello" }\`
      - HTML: \`{ format: "html", value: "<h1>Hello</h1>" }\`
      - JSON: \`{ format: "json", value: { ... } }\`
    - **Example**: Perfect for blog content, descriptions, or any formatted text.
    
    ---
    
    ## Number
    Numeric value.
    - **Value Type**: \`number\`
    - **Usage**: \`fieldName\`
    - **Example**: Quantities, scores, or any numeric data.
    
    ---
    
    ## Boolean
    True/false value.
    - **Value Type**: \`boolean\`
    - **Usage**: \`fieldName\`
    - **Example**: Toggles, flags, or status indicators.
    
    ---
    
    ## Date
    Date (optionally with time).
    - **Value Type**: \`string\` (ISO date string)
    - **Usage**: \`fieldName\`
    - **Example**: Timestamps, deadlines, or event dates.
    
    ---
    
    ## Select
    Single or multiple choice from a set of options.
    - **Value Type**: \`string\` or \`string[]\` or \`null\`
    - **Usage**: \`fieldName\`
    - **Example**: Tags, categories, or dropdowns.
    
    ---
    
    ## Reference
    Reference to other blocks.
    - **Value Type**:  
      - \`string\` (block ID)
      - or \`{ type: "instance", ... }\` (for nested/instance references)
      - or an array of the above
    - **Usage**: \`fieldName\`
    - **Example**: Linking to users, documents, or other entities.
    
    ---
    
    ## Media
    File upload (image, video, audio, or generic file).
    - **Value Type**:  
      \`\`\`ts
      {
        url: string;
        fileName?: string;
        altText?: string;
        duration?: number;
      }
      \`\`\`
    - **Usage**: \`fieldName { url fileName altText duration }\`
    - **Example**: Profile pictures, attachments, or media galleries.
    
    ---
    
    ## List / Collection
    Array of blocks of a specific type.
    - **Value Type**:  
      \`\`\`ts
      {
        template: string | Array<{ type: string; ... }>;
        rows?: Array<{ type: "instance"; ... }>;
      }
      \`\`\`
    - **Usage**: \`fieldName { ... }\`
    - **Example**: Item lists, tables, or repeatable sections.
    
    ---
    
    ## Component
    Reusable block with custom display options.
    - **Value Type**:  
      \`\`\`ts
      Array<{ type: string; ... }>
      \`\`\`
    - **Usage**: \`fieldName\`
    - **Example**: Design system components, templates.
    
    ---
    
    ## Instance
    Instance of a component block.
    - **Value Type**:  
      \`\`\`ts
      {
        mainComponentId?: string;
        value?: Record<string, unknown> | null;
      }
      \`\`\`
    - **Usage**: \`fieldName\`
    - **Example**: Placing a component in a document.
    
    ---
    
    ## Color
    Color value.
    - **Value Type**: \`string\`
    - **Usage**: \`fieldName\`
    - **Example**: Theme colors, labels.
    
    ---
    
    ## Icon
    Icon value.
    - **Value Type**: \`string\`
    - **Usage**: \`fieldName\`
    - **Example**: Icon pickers, visual indicators.
    
    ---
    
    ## CodeSnippet
    Code with language.
    - **Value Type**:  
      \`\`\`ts
      {
        code: string;
        language?: string | null;
      }
      \`\`\`
    - **Usage**: \`fieldName { code language }\`
    - **Example**: Code blocks in documentation.
    `;

const basehubMcpEndpoint = process.env.BASEHUB_MCP_ENDPOINT;
if (!basehubMcpEndpoint) {
  throw new Error("BASEHUB_MCP_ENDPOINT is not set");
}

type MCPPayload =
  | {
      op: "make-changes";
      transaction: string;
      autoCommit?: string;
    }
  | {
      op: "ref-state";
      transaction: { op: "get-current-ref" } | { op: "checkout"; ref: string };
    }
  | {
      op: "query";
      data: any;
    };

export async function mcpRequest(token: string, payload: MCPPayload) {
  const response = await fetch(basehubMcpEndpoint!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.op === "error") throw new Error(result.error);
  return result;
}

export const authenticate = async (token: string) => {
  const response = await fetch(`${BASEHUB_APP_URL}/api/mcp/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  const result = await response.json();
  return result as {
    read: string;
    write: string;
    ref: { type: "branch" | "commit"; id: string; name?: string };
  };
};

export const BASEHUB_API_URL =
  process.env.BASEHUB_API_URL ?? "http://api.basehub.com/graphql";
