import { withLogging } from "../utils";
import { queryApiGuidelines } from "../utils/constants";

export const schema = {};

export const metadata = {
  name: "get_query_guidelines",
  description: "Get guidelines for querying content in BaseHub.",
  annotations: {
    title: "Get Query Guidelines",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

async function getQueryGuidelines() {
  return {
    content: [
      {
        type: "text",
        text: queryApiGuidelines,
      },
    ],
  };
}

export default withLogging("get_query_guidelines", getQueryGuidelines);
