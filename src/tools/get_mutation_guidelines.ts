import { withLogging } from "../utils";
import { mutationApiGuidelines } from "../utils/constants";

export const schema = {};

export const metadata = {
  name: "get_mutation_guidelines",
  description: "Get guidelines for mutating content in BaseHub.",
  annotations: {
    title: "Get Mutation Guidelines",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

async function getMutationGuidelines() {
  return {
    content: [
      {
        type: "text",
        text: mutationApiGuidelines,
      },
    ],
  };
}

export default withLogging("get_mutation_guidelines", getMutationGuidelines);
