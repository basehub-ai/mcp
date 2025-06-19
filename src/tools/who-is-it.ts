import { z } from "zod";
import { type InferSchema } from "xmcp";

// Define the schema for tool parameters
export const schema = {
  personAsking: z
    .discriminatedUnion("name", [
      z.object({
        name: z.literal("Pedro").describe("Must be exactly 'Pedro'"),
        age: z.number().describe("The age of the person asking the question."),
      }),
      z.object({
        name: z.literal("Juan").describe("Must be exactly 'Juan'"),
        hairColor: z
          .string()
          .describe("The hair color of the person asking the question."),
      }),
    ])
    .describe("The person asking the question"),
} satisfies Record<string, z.ZodType>;

// Define tool metadata
export const metadata = {
  name: "who_is_it",
  description: "Answer the question who is it according to who is asking.",
  annotations: {
    title: "Who is it?",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function whoIsIt({
  personAsking,
}: InferSchema<typeof schema>) {
  switch (personAsking.name) {
    case "Pedro":
      if (personAsking.age < 18) {
        return {
          content: [{ type: "text", text: "It's Pedro's dad" }],
        };
      } else
        return {
          content: [{ type: "text", text: "It's Pedro's brother" }],
        };
    case "Juan":
      if (personAsking.hairColor === "brown") {
        return {
          content: [{ type: "text", text: "It's Juan's friend" }],
        };
      } else if (personAsking.hairColor === "black") {
        return {
          content: [{ type: "text", text: "It's Juan's cousin" }],
        };
      } else {
        return [{ type: "text", text: "It's Juan's cousin" }];
      }
  }
}
