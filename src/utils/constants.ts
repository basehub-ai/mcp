import { mutationApiAvailableBlockTypes } from "@basehub/mutation-api-helpers";

export const BASEHUB_APP_URL =
  process.env.BASEHUB_APP_URL ?? "http://basehub.com";
export const BASEHUB_API_URL =
  process.env.BASEHUB_API_URL ?? "http://api.basehub.com/graphql";

export const FAILED_MUTATION_HELP_TEXT = `MAKE SURE TO CHECK BASEHUB MUTATION TYPES AND STRUCTURE IF THE ERROR PERSISTS.`;

export const mutationApiGuidelines: string = `
# Mutation API Guidelines

## Operation Types

You can perform three types of operations:
- \`create\`: Add new blocks
- \`update\`: Modify existing blocks
- \`delete\`: Remove blocks

### Example of Create Operations

#### Create a Text Block
\`\`\`json
{
  "parentId": "<layout-block-id>",
  "data": [{
    "type": "${mutationApiAvailableBlockTypes.text}",
    "title": "Hero Title",
    "value": "A purpose-built tool for planning and building products",
    "isRequired": true
  }]
}
\`\`\`

In general, you'll want to mark all blocks as required.
When the content of a block is wrapped between \`<basehub placeholder>\` means that the block is required, and **it is empty**. The API returns this because it's handy for developer experience.

#### Create a Component Block
\`\`\`json
{
  "parentId": "<layout-block-id>",
  "data": [{
    "transactionId": "cta-component", // this is not required, it's just an example
    "type": "${mutationApiAvailableBlockTypes.component}",
    "title": "CTA",
    "hidden": true, // not required
    "value": [
      {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "title": "Label",
        "value": "",
        "isRequired": true
      },
      {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "title": "Href",
        "value": "",
        "isRequired": true
      },
      {
        "type": "${mutationApiAvailableBlockTypes.select}",
        "title": "Variant",
        "value": ["primary"],
        "acceptedValues": ["primary", "secondary", "ghost"],
        "multiple": false,
        "isRequired": true,
        "description": "We'll style the button based on the variant"
      }
    ]
}]
}
\`\`\`

Notice how we're not using \`children\` for nesting, but rather, we just use the \`value\` field, which in the case of layout blocks, accept an array of blocks.

Also, notice how, in the case of the \`select\` ("Variant") block, we're using \`value\` to set the initial value for component instances.

Notice how we're using \`hidden: true\` to "hide" the component. This doesn't hide it from the user: what it does is it skips it from the Delivery API response, and therefore can skip commit validation. In case of components where you just want them to be a schema (but where its content will not be rendered), you'll want to use this.

Finally, notice how we're using \`transactionId: "cta-component"\` to "name" the component within the transaction. As you'll see in the next example, this allows us to reference the component within the same transaction, without knowing its id upfront.

#### Create an Instance Block
\`\`\`json
{
  "parentId": "<layout-block-id>",
  "data": [{
    "type": "${mutationApiAvailableBlockTypes.instance}",
    "title": "Sign Up Button",
    "mainComponentId": "cta-component",
    "value": {
      "icon": {
        "type": "${mutationApiAvailableBlockTypes.instance}",
        "value": {
          "contentSvg": {
            "type": "${mutationApiAvailableBlockTypes.icon}",
            "value": "<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.158 3.135a.5.5 0 0 1 .707.023l3.75 4a.5.5 0 0 1 0 .684l-3.75 4a.5.5 0 1 1-.73-.684L9.566 7.5l-3.43-3.658a.5.5 0 0 1 .023-.707Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/></svg>"
          },
          "side": {
            "type": "${mutationApiAvailableBlockTypes.select}",
            "value": ["left"],
            "acceptedValues": ["left", "right"],
            "required": true,
            "description": "The icon can be on the left or right side of the button",
            "multiple": false,
          }
        }
      }
      "label": {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "value": "Sign Up for Free"
      },
      "href": {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "value": "/sign-up"
      },
      "variant": {
        "type": "${mutationApiAvailableBlockTypes.select}",
        "value": ["primary"]
      }
    }
}]
}
\`\`\`

There are many interesting things to notice here:
- We're using \`mainComponentId: "cta-component"\` to reference the component we created in the previous example. To use this, these two operations would need to run in the same transaction.
- The instance's \`value\` field is an object, not an array, and it defines the values for its children via their API Names (camel cased from their titles). This feels much more natural than using an array of objects, and it's more readable.
- The fact that \`icon\` is as an instance block. This is because components can never be nested inside instance. Altough the \`icon\` is a component inside the component that shapes this instance, when creating an instance of this cta, we need to create \`icon\` as an instance here.

#### Create a List Block

\`\`\`json
{
  "parentId": "<layout-block-id>",
  "data": [{
    "type": "collection",
    "title": "Authors",
    "template": [
      {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "title": "Role",
        "isRequired": true
      },
      {
        "type": "${mutationApiAvailableBlockTypes.media}",
        "title": "Avatar",
        "isRequired": true
      },
      {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "title": "X Username",
        "isRequired": true,
        "description": "You can include the full URL, like https://x.com/<username> or the username directly."
      }
    ],
    "rows": [
      {
        "type": "${mutationApiAvailableBlockTypes.instance}",
        "title": "Frank Ocean",
        "value": {
          "role": {
            "type": "${mutationApiAvailableBlockTypes.text}",
            "value": "Musician"
          },
          "avatar": {
            "type": "${mutationApiAvailableBlockTypes.media}",
            "value": {
              "url": "https://assets.basehub.com/<generated-image-url>",
              "fileName": "frank-ocean-avatar.jpg",
              "altText": "Frank Ocean"
            }
          },
          "xUsername": {
            "type": "${mutationApiAvailableBlockTypes.text}",
            "value": "frank"
          }
        }
      }
    ]
}]
}
\`\`\`

There are many interesting things to notice here:
- We're using \`template\` to create the collection template block. This is a shortcut for creating the template block on another operation. The template block is a component block that defines the structure of the collection items.
- We're using \`rows\` to create the collection of instances. Rows is an array of instance create ops.
- We're using each row/instance's \`title\` as the author's name. All blocks have a \`title\` field, which can either be used for internal naming, or for rendering in end-user's websites. In the case of an Author, or a Blog Post, or a Category, you can use the implicit \`title\` key that comes in every block, instead of creating a new nested block.

You can use the id (or transactionId) of a component block to use as the template:
\`\`\`json
{
  "parentId": "<layout-block-id>",
  "data": [{
    "type": "collection",
    "title": "Authors",
    "template": "<id-of-component-block>",
    "rows": [...]
  }]
}
\`\`\`

#### Create a row in a List Block
\`\`\`json
{
  "parentId": "<collection-block-id>",
  "data": [{
    "type": "${mutationApiAvailableBlockTypes.instance}",
    "title": "Rick Rubin",
    "value": {
      "role": {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "value": "Producer"
      },
      "avatar": {
        "type": "${mutationApiAvailableBlockTypes.media}",
        "value": {
          "url": "https://assets.basehub.com/<generated-image-url>",
          "fileName": "rick-rubin-avatar.jpg",
          "altText": "Rick Rubin"
        }
      },
      "xUsername": {
        "type": "${mutationApiAvailableBlockTypes.text}",
        "value": "rickrubin"
      }
    }
  }]
}
\`\`\`

#### Create blocks in the template of a List Block
\`\`\`json
    {
      "parentId": "<collection-template-block-id>",
      "data": [{
        "type": "${mutationApiAvailableBlockTypes.boolean}",
        "title": "Is Published",
        "value": false,
      }, {
        "type": "${mutationApiAvailableBlockTypes.media}",
        "title": "Cover Image",
        "description": "The image that will be displayed as the cover of the article",
        "isRequired": false
      }, {
        "type": "${mutationApiAvailableBlockTypes.reference}",
        "title": "Authors",
        "multiple": true,
        "isRequired": true,
        "description": "Team members who contributed to this release"
      }]
    }
\`\`\`

This is a the right pattern for extending the structure of layout blocks.
Also notice that using a single \`update\` operation here is not correct. When the task is develop the structure of an already created block, the job is to create new blocks, not update existing ones.

---

### Example of Update Operations

#### Update a Text Block

\`\`\`json
{data: [{
  "id": "<rick-rubin-instance-id>",
  "title": "Rick Rubin",
  "variantOverrides": {
    "language-es": {
      "title": "Ricardo Rubin"
    }
  },
  "value": {
    "role": {
      "type": "${mutationApiAvailableBlockTypes.text}",
      "value": "Producer and Podcast Host"
      "variantOverrides": {
        "language-es": {
          "value": "Productor y Anfitrión del Podcast"
        }
      }
    },
    "fullName": {
      "type": "${mutationApiAvailableBlockTypes.text}",
      "value": "Richard Rubin"
      "variantOverrides": {
        "language-es": {
          "value": "Ricardo Rubin"
        }
      }
    }
    "xUsername": {
      "type": "${mutationApiAvailableBlockTypes.text}",
      "value": "rickrubin"
      // does not include variant because it's the same in all languages
    }
  }
}]}
\`\`\`

#### Update a media Block

\`\`\`json
{data: [{
    "id": "<media-block-id>",
    "value": {
      "type": "${mutationApiAvailableBlockTypes.media}",
      "value": {
        "fileName": "<A proper file name for the media>",
        "url": "<media-url>",
        "altText": "<A proper description of the media>",
      }
    },
}]}
\`\`\`

#### Update variants

\`\`\`json
{data: [{
    "id": "<example-instance-id>",
    "value": {
    "heroTitle": {
      "type": "${mutationApiAvailableBlockTypes.text}",
      "variantOverrides": {
        "language-es": {
          "value": "Finalmente, un CMS que se mueve tan rápido como tú."
        }
      }
    },
    "heroSubtitle": {
      "type": "${mutationApiAvailableBlockTypes.text}",
      "variantOverrides": {
        "language-es": {
          "value": {
            "format": "json",
            "value": [
              {
                "type": "doc",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "BaseHub es el CMS Headless más rápido y flexible. Desarrolla con tipos de seguridad de extremo a extremo, escribe con la ayuda de IA y colabora en tiempo real con tu equipo."
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    }
  }
}]}
\`\`\`

#### Update instance title in variants

\`\`\`json
{data: [{
    "id": "<example-instance-id>",
    "title": "Model Context Protocol explorations",
    "variantOverrides": {
    "language-es": {
      "title": "Exploraciones del Protocolo de Contexto del Modelo"
    }
  }
}]}
\`\`\`

Notice that the title of the instance is updated at the root level, since its a direct property of the instance block, not a child.
To update the instance children, it should be done through the \`value\` field, where each child block will have its own \`variantOverrides\`.

#### Add new accepted values to a Select block, in order to use them as a value.

Given this structure:

\`\`\`xml
<List apiName="posts" objectName="Posts" title="Posts">
  <Component id="a02kf922le0" apiName="author" objectName="Author">
    <Text apiName="excerpt" />
    <Select apiName="tags" max=1 multiple=false isRequired=false acceptedValues=["Engineering","Product"] />
    <RichText apiName="content" />
  </Component>
  <Instance id="ks0fk21em23" apiName="author" objectName="Author" targetBlockId="author">
    <Text apiName="excerpt" />
    <Select apiName="tags" max=1 multiple=false isRequired=false  acceptedValues=["Engineering","Product"] />
    <RichText apiName="content" />
  </Instance>
</List>
\`\`\`

Intent: Update \`acceptedValues\`, \`multiple\` and \`max\` constraints.

\`\`\`json
{
data: [{
      "id": "a02kf922le0",
      "value": {,
        "tags": {
          "type": "${mutationApiAvailableBlockTypes.select}",
          "acceptedValues": ["Marketing","Design","Engineering","Product"],
          "multiple": true,
          "max": 3,
        }
      }
    },
    {
      "id": "ks0fk21em23",
      "value": {
        "tags": {
          "type": "${mutationApiAvailableBlockTypes.select}",
          "value": ["Marketing","Design"],
        }
      }
    }
}]}
\`\`\`

Things to notice:
1 - You can easily update constraints of a block. Like the \`acceptedValues\`, \`multiple\`, \`max\` for this select block.
2 - This is done in two separate update operations because blocks under instances do not determinate its own constraints (like \`acceptedValues\`, \`multiple\` for select blocks). Those are inherited from its _target block_ (its equivalent block in the component). The same way instances are shaped from components, instance children are shaped from their component's children. So, in order to update the accepted values of a select block, you need to update the component first, and then update the instance.

#### Update a Component Block

Make the role field optional.

\`\`\`json
{data: [{
    "id": "<example-component-id>",
    "value": {
    "role": {
      "type": "${mutationApiAvailableBlockTypes.text}",
      "isRequired": false
    },
  }
}]}
\`\`\`

#### Update a Rich Text block

\`\`\`json
{data: [{
    "id": "<example-rich-text-id>",
    "value": {
    "type": "rich-text",
    "value": {
      "format": "json",
      "value": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "The final demo of this release is a form builder and we're going to work back on our marketing website template."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "And the idea is basically to create forms, specific forms for different pages that you might need."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "You can see there is this form right here, first name, last name, email address, whatever."
            }
          ]
        }
      ]
    },
  }
}]}
\`\`\`

## Primitive blocks value format
Here are all primitive block types and their corresponding value formats:

- text: \`{ "type": "${mutationApiAvailableBlockTypes.text}", "value": "string content" }\`
- number: \`{ "type": "${mutationApiAvailableBlockTypes.number}", "value": 123 }\`
- boolean: \`{ "type": "${mutationApiAvailableBlockTypes.boolean}", "value": true }\`
- date: \`{ "type": "${mutationApiAvailableBlockTypes.date}", "value": "2025-03-07" }\`
- color: \`{ "type": "${mutationApiAvailableBlockTypes.color}", "value": "#RRGGBB" }\`
- icon: \`{ "type": "${mutationApiAvailableBlockTypes.icon}", "value": "<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.158 3.135a.5.5 0 0 1 .707.023l3.75 4a.5.5 0 0 1 0 .684l-3.75 4a.5.5 0 1 1-.73-.684L9.566 7.5l-3.43-3.658a.5.5 0 0 1 .023-.707Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/></svg>" }\`
- rich-text:
\`\`\`json
{
  "type": "${mutationApiAvailableBlockTypes.richText}",
  "value": {
    "format": "json", // can also be "html" or "markdown", althuogh you almost always want to use "json" as it's the most flexible
    "value": [...] // ProseMirror-compatible JSON or string (in case of "html" or "markdown"). INCLUDE THE FULL VALUE, NOT JUST A SNIPPET / AN UPDATE. THIS WILL OVERRIDE, NOT MERGE.
  }
}
\`\`\`
- code-snippet:
\`\`\`json
{
  "type": "${mutationApiAvailableBlockTypes.codeSnippet}",
  "value": {
    "code": "const hello = 'world';",
    "language": "javascript"
  }
}
\`\`\`
- media-blocks:
\`\`\`json
{
  "type": "${mutationApiAvailableBlockTypes.media}", // or "video", "audio", "file"
  "value": {
    "url": "https://example.com/image.jpg",
    "fileName": "image.jpg",
    "altText": "Description of image"
  }
}
\`\`\`
- reference (single):
\`\`\`json
{
  "type": "${mutationApiAvailableBlockTypes.reference}",
  "value": "block-id-to-reference" // value should be a document, component, or instance block id
}
\`\`\`
- reference (multiple):
\`\`\`json
{
  "type": "${mutationApiAvailableBlockTypes.reference}",
  "multiple": true,
  "value": ["block-id-1", "block-id-2"] // value should be an array of document, component, or instance block id
}
\`\`\`
- select (single):
\`\`\`json
{
  "type": "${mutationApiAvailableBlockTypes.select}",
  "value": "option1"
}
\`\`\`
- select (multiple):
\`\`\`json
{
  "type": "${mutationApiAvailableBlockTypes.select}",
  "multiple": true,
  "value": ["option1", "option2"]
}
\`\`\`

---

# Common Mutation API Errors

## Rich Text Formatting Mismatch

Passing \`format: "json"\` in the \`value\` and at the same time passing a markdown string will result in an error.

\`\`\`json
{
  "format": "json",
  "value": "# Some sample markdown **here**"
}
\`\`\`

Error! You should pass a Rich Text JSON object instead.

\`\`\`json
{
  "format": "json",
  "value": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [
        { "type": "text", "text": "Some sample markdown" },
        { "type": "text", "text": "here", "marks": [{ "type": "bold" }] }
      ]
    }
  ]
}
\`\`\`
`;

export const queryApiGuidelines: string = `
# Query API Guidelines
The Query API is GraphQL. So you'll be writing GraphQL queries.

## About BaseHub

BaseHub is a Headless CMS where users architect the structure of a website. With building blocks, users can create flexible structures that map to a website's tree-like structure.

Blocks belong to two main categories: layout and primitive blocks.

## Layout Blocks

These blocks typically contain other nested blocks. They're key to giving the repository a tree-like structure. They're all objects and share some common GraphQL keys:

- _title: string
- _slug: string, auto generated based on the title
- _sys:
  - apiNamePath: string
  - createdAt: string
  - hash: string
  - id: string
  - idPath: string
  - lastModifiedAt: string
  - slug: string
  - slugPath: string
  - title: string

### Document

A single document/page, for example “homepage”, or “about page“, or something more generic like “globals” or “settings”

### Component

Like a document, but used to reutilize structures/schemas, like a “CTA”, or even a section like “Features Grid Section“, or a “Callout” to be used within a Rich Text block. It's quite flexible.

### Instance

Which practically targets a Component and sticks to its structure.

### List

Meant to be used for listing things. Gets its columns by targeting a Component and using it as "template". Has rows (instances), which are the actual items in the list. Useful for things like “Blog Posts”, “Authors”, “Categories”, “Testimonials“, etc…

List blocks have a graphql object with the following keys:

- items: array of rows returned after applying sorts, filters, and pagination.
  - you pass in an object selecting the fields from the targetBlockId (its template)
- item: grabs the first item from the items array. useful if you just one a single one.
  - same signature as \`items\`
- _meta:
  - totalCount: number of rows in the whole collection (before filtering, pagination, etc)
  - filteredCount: number of rows in the collection after filtering, but before pagination

List blocks receive optional arguments:

- orderBy: enum created dynamically based on system fields (like _sys_slug) and child fields, plus appended with __DESC or __ASC. So for example, createdAt__DESC (with double underscore: __).
- filter: object created dynamically based on system fields (like _sys_slug) and child fields. Depending on the field type, they get different filters. Common ones:
  - for string types, can filter by: eq, contains, startsWith, endsWith, notEq.
  - for date types, can filter by: isAfter, isBefore, onOrBefore, onOrAfter.
  - for boolean types, can filter by true or false
  - for reference types, it skips a level. For example \`filter: { author: { _sys_title: { eq: "John Doe" }}}\`
  - ... etc
- first: number, takes the first N items
- skip: number, skips 

An important thing to note re: filter and orderBy, is that to use system fields, you should prefix them with \`_sys\`. For example, to filter by a row that matches a certain slug, you should use \`_sys_slug: { eq: "<your-slug>" }\`.

## Examples

Intent: Get the first 10 posts:

\`\`\`gql
{
  posts(first: 10) {
    items {
      _id
      _title
      date
      excerpt
      body {
        json {
          content
        }
      }
    }
  }
}
\`\`\`

Intent: Get a specific post, filtered by slug:

\`\`\`gql
{
  posts(filter: { _sys_slug: { eq: "my-blog-post-slug" } }) {
    items {
      _id
      _title
      date
      excerpt
      body {
        json {
          content
        }
      }
    }
  }
}
\`\`\`

## Common Errors

\`\`\`gql
{
  posts(filter: { _sys_slug: { eq: "my-blog-post-slug" } }) {
    _id
    _title
    date
    excerpt
    body {
      json {
        content
      }
    }
  }
}
\`\`\`

Error: the query is successful, but no items are returned.
Reason: rows are returned below \`items\`, not top level.
Solution: add \`items\` below the \`posts\` object, and wrap \`_title\`, \`date\`, etc, below \`items\`.

### Reference

Can target an Instance or a Component (if it's Component type is in “accepted types“). This one has two possible behaviors:

Reference blocks take the structure of the component (or components) they target.

1.  If \`acceptedTypes\` has just one component id, then it'll take its component's structure
2.  If \`acceptedTypes\` has more than one component id, then it'll become a union of its component's structure
    
> Additionally, if \`multiple={true}\`, it'll return an array of those. Else just a single one.

## Examples

Given this structure:

\`\`\`xml
<Document apiName="components" objectName="Components" title="Components">
  <Component apiName="author" objectName="Author" title="Author">
    <Text apiName="xUsername" />
    <RichText apiName="bio" />
  </Component>
</Document>
<Document apiName="demo" objectName="Demo">
  <Reference apiName="author" multiple="true" isRequired="false" acceptedTypes=“Author" startCollapsed="null" disableCreateNew="null" disableLinkExisting="null" />
</Document>
\`\`\`

Intent: Get the author:

\`\`\`gql
{
  demo {
    author {
      _title
      xUsername
      bio {
        json {
          content
        }
      }
    }
  }
}
\`\`\`

Now, in case there are more than one accepted types, like if we modify the structure to:

Given this structure:

\`\`\`xml
  <Reference apiName="author" multiple="true" isRequired="false" acceptedTypes={[“Author", "ExternalPerson"]} startCollapsed="null" disableCreateNew="null" disableLinkExisting="null" />
\`\`\`

Intent: Get the author:

\`\`\`gql
{
  demo {
    author {
    ... on Author {
        _title
        xUsername
        bio {
          json {
            content
          }
        }
      }
      ... on ExternalPerson {
        _title
        linkedinUrl
        company
        role
      }
    }
  }
}
\`\`\`

## Primitive Blocks

These blocks typically contain the largest parts of the content. They're less about the schema and structure and more about the content. An important prop to keep in mind of is the \`isRequired\` prop, which will make the field nullable or non-nullable accordingly.

### Text

Self explanatory.

### Number

Self explanatory.

### Boolean

Self explanatory.

### Date

ISO date string.

### Select

If \`multiple={true}\`, it returns an array of strings. Else, it returns a single string.

### Media (Image, Video, Audio, and File)

An object.

- url: string
  - can receive args: width, height, format, quality, blur
- alt: string (nullable)
- width: number (nullable)
- height: number (nullable)
- blurDataURL: string (nullable)
- mimeType: string
- fileName: string

### Code Snippet

An object.

- code: string
- language: string

### Rich Text

Rich text blocks have a graphql object with the following keys:

- json
  - content: JSON definition of the prosemirror data. Compatible with the <RichText /> component from 'basehub/react-rich-text'
  - blocks: an optional array of unions of all the component types and the internal links that the rich text may have. when querying these, you'll need to pass _id and __typename so that they can be matched at runtime. ONLY INCLUDE THIS IF THE RICH TEXT HAS "allowedComponents"
- markdown: string, the markdown representation of the rich text. More limited, as it doesn't include embedded blocks.
- html: string, the html representation of the rich text. More limited, as it doesn't include embedded blocks.
- plainText: string, the plain text representation of the rich text. Again, more limited, as it doesn't include embedded blocks.
- readingTime: number, expressed in minutes

## Examples

Intent: Get subtitle of an about page:

\`\`\`gql
{
  about {
    subtitle {
      json {
        content
      }
    }
  }
}
\`\`\`

Intent: Get content of a changelog entry:

\`\`\`gql
{
  changelog {
    posts(filter: { _sys_id: { eq: "my-changelog-entry-id" } }) {
      items {
        _title
        body {
          json {
            content
          }
        }
      }
    }
  }
}
\`\`\`

## Common Errors

\`\`\`gql
{
  about {
    subtitle {
      json
    }
  }
}
\`\`\`

Error: \`json\` is an object and therefore needs to include subfields.
Reason: you're missing \`content\` below \`json\`
Solution: add \`content\` below \`json\`, like \`{ about { subtitle { json { content } } } }\`

### Color

An object.

- hex: string
- rgb: string
- hsl: string

### OG Image

An object.

- url: string

### Variant set
The variant set block is used to have different values for the same block.
Different variants are defined inside a variant set block. For example, you can have a “language” variant set, with “en” and “es” variants, and a “button” variant set, with “primary” and “secondary” variants.
In each variant set, there's a default variant that handles the default value for the block. This is the value that will be used if no variant is supported.
The repository structure highlights which blocks do have a variant set enabled in it. In case a block do not accept variants, it will default to the default variant.

## Examples

Intent: Get a variant set block to check which variants it contains:

\`\`\`gql
{
  settings {
    languages {
      variants {
        id
        isDefault
        label
        apiName
      }
    }
  }
}
\`\`\`
Note: This is an example structure where settings is a document holding a variant set block called languages.

Intent: Get a specific variant of blocks:

\`\`\`gql
{
	chapters {
    items {
      lessons(variants: { languages: <language-api-name> }) {
        items {
          transcription {
            plainText
          }
          video {
            url
          }
        }
      }
    }
  }
}
\`\`\`

## Common Errors

\`\`\`gql
{
	chapters {
    items {
      lessons {
        items {
          transcription(variants: { languages: es }) {
            plainText
          }
          video(variants: { languages: es }) {
            url
          }
        }
      }
    }
  }
}
\`\`\`

Error: the query fails.
Reason: selected variant must be spescified in the nearest document, component or instance block, never for primitive blocks.
Solution: add \`(variants: { languages: es })\` next to \`lesssons\`.

\`\`\`gql
{
	index {
    categoriesSection {
      categories {
        items {
          articles(variants: { tests: "a" }) {
            _slug
          }
        }
      }
    }
  }
}
\`\`\`

Error: Enum "TestsEnum" cannot represent non-enum value: "a". Did you mean the enum value "a"
Reason: variants are of type enum, so no quotes should be added.
Solution: remove quotes ("") from the variant filter.
`;
