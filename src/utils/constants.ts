export const BASEHUB_APP_URL =
  process.env.BASEHUB_APP_URL ?? "http://basehub.com";
export const BASEHUB_API_URL =
  process.env.BASEHUB_API_URL ?? "http://api.basehub.com/graphql";

// TODO: Some blocks as event or workflow are not present since we don't yet support them in the Mutation API.
export const BASEHUB_BLOCK_TYPES = `
    IMPORTANT: When writing block types for mutations, they go in kebab-case. E.g: RichText is written as 'rich-text'.
    ---
    
    # BaseHub Block Types
    
    ## document
    Container for other blocks. Access directly by field name.
    - **Value Type**: Defined by its children (array of blocks).
    - **Mutation Usage**: \`fieldName: { ... }\` where the object contains the values for the children blocks.
    - **Query Usage**: \`fieldName { childFieldName, _sys { id } }\`
    - **Example**: Used as a root or section block to group other blocks.
    
    ---
    
    ## text  
    Simple text field.
    - **Value Type**: \`string\`
    - **Mutation Usage**: \`"some string"\`
    - **Query Usage**: \`fieldName\`
    - **Example**: Titles, short descriptions, or any plain text.
    
    ---
    
    ## rich-text
    Rich text with multiple output formats.
    - **Mutation Value Type**:  
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
    - **Mutation Usage**:  
      - Markdown: \`{ format: "markdown", value: "# Hello" }\`
      - HTML: \`{ format: "html", value: "<h1>Hello</h1>" }\`
      - JSON: \`{ format: "json", value: { ... } }\`
    - **Query Usage**:
      - Get HTML: \`fieldName { html }\`
      - Get Markdown: \`fieldName { markdown }\`
      - Get JSON: \`fieldName { json { content, toc } }\`
      - Get Plain Text: \`fieldName { plainText }\`
      - Get Reading Time: \`fieldName { readingTime(wpm: 200) }\`
    - **Example**: Perfect for blog content, descriptions, or any formatted text.
    
    ---
    
    ## number
    Numeric value.
    - **Value Type**: \`number\`
    - **Mutation Usage**: \`123\`
    - **Query Usage**: \`fieldName\`
    - **Example**: Quantities, scores, or any numeric data.
    
    ---
    
    ## boolean
    True/false value.
    - **Value Type**: \`boolean\`
    - **Mutation Usage**: \`true\`
    - **Query Usage**: \`fieldName\`
    - **Example**: Toggles, flags, or status indicators.
    
    ---
    
    ## date
    Date (optionally with time).
    - **Value Type**: \`string\` (ISO date string)
    - **Mutation Usage**: \`"2023-01-01T00:00:00.000Z"\`
    - **Query Usage**: \`fieldName\`
    - **Example**: Timestamps, deadlines, or event dates.
    
    ---
    
    ## select
    Single or multiple choice from a set of options.
    - **Value Type**: \`string\` or \`string[]\` or \`null\`
    - **Mutation Usage**: \`"option1"\` or \`["option1", "option2"]\`
    - **Query Usage**: \`fieldName\`
    - **Example**: Tags, categories, or dropdowns.
    
    ---
    
    ## reference
    Reference to other blocks.
    - **Mutation Value Type**:  
      - \`string\` (block ID)
      - or \`{ type: "instance", ... }\` (for nested/instance references)
      - or an array of the above
    - **Mutation Usage**: \`"block-id"\`
    - **Query Usage**: \`fieldName { ... on ReferencedType { fieldName } }\`
    - **Example**: Linking to users, documents, or other entities.
    
    ---
    
    ## media
    File upload (image, video, audio, or generic file). A media field resolves to a union of Image, Video, Audio, and File types.
    - **Mutation Value Type**:  
      \`\`\`ts
      {
        url: string;
        fileName?: string;
        altText?: string;
        duration?: number;
      }
      \`\`\`
    - **Mutation Usage**: \`{ url: "...", fileName: "..." }\`
    - **Query Usage**:
      \`\`\`graphql
      fieldName {
        ... on BlockImage {
          url(width: 200)
          alt
        }
        ... on BlockVideo {
          url
          duration
        }
      }
      \`\`\`
    - **Example**: Profile pictures, attachments, or media galleries.
    
    ---
    
    ## list (Collection)
    Array of blocks of a specific type.
    - **Mutation Value Type**:  
      \`\`\`ts
      {
        template: string | Array<{ type: string; ... }>;
        rows?: Array<{ type: "instance"; ... }>;
      }
      \`\`\`
    - **Mutation Usage**: Depends on the list's contents.
    - **Query Usage**:
      \`\`\`graphql
      fieldName(first: 10) {
        items {
          # fields of the items
        }
        _meta {
          totalCount
        }
      }
      \`\`\`
    - **Example**: Item lists, tables, or repeatable sections.
    
    ---
    
    ## component
    Reusable block with custom display options.
    - **Value Type**:  
      \`\`\`ts
      Array<{ type: string; ... }>
      \`\`\`
    - **Mutation Usage**: \`{ ... }\` with the component's field values.
    - **Query Usage**: \`fieldName { childFieldName }\`
    - **Example**: Design system components, templates.
    
    ---
    
    ## instance
    Instance of a component block.
    - **Value Type**:  
      \`\`\`ts
      {
        mainComponentId?: string;
        value?: Record<string, unknown> | null;
      }
      \`\`\`
    - **Mutation Usage**: \`{ mainComponentId: "...", value: { ... } }\`
    - **Query Usage**: \`fieldName { ... on ComponentType { childFieldName } }\`
    - **Example**: Placing a component in a document.
    
    ---
    
    ## color
    Color value.
    - **Value Type**: \`string\` (e.g. "#RRGGBB")
    - **Mutation Usage**: \`"#FF5733"\`
    - **Query Usage**: \`fieldName { hex rgb hsl }\`
    - **Example**: Theme colors, labels.
    
    ---
    
    ## icon
    Icon value.
    - **Value Type**: \`string\`
    - **Mutation Usage**: \`"icon-name"\`
    - **Query Usage**: \`fieldName\`
    - **Example**: Icon pickers, visual indicators.
    
    ---
    
    ## code-snippet
    Code with language.
    - **Mutation Value Type**:  
      \`\`\`ts
      {
        code: string;
        language?: string | null;
      }
      \`\`\`
    - **Mutation Usage**: \`{ code: "...", language: "..." }\`
    - **Query Usage**: \`fieldName { code language html }\`
    - **Example**: Code blocks in documentation.

    ---

    ## og-image
    Open Graph image.
    - **Mutation Usage**: Not supported for mutations.
    - **Query Usage**: \`fieldName { url width height }\`
    - **Example**: Generating social sharing images.
    
    ---

    ## event
    Analytics event tracking.
    - **Mutation Usage**: Not supported for mutations.
    - **Query Usage**: \`fieldName { ingestKey, adminKey, schema }\`. The \`adminKey\` should not be exposed publicly.
    - **Example**: Tracking button clicks or page views.

    ---

    ## workflow
    Custom workflows.
    - **Mutation Usage**: Not supported for mutations.
    - **Query Usage**: \`fieldName { webhookSecret }\`
    - **Example**: Triggering custom server-side actions.
    `;
