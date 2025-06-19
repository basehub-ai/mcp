import { z } from "zod";
import { type InferSchema } from "xmcp";

// Define the schema for tool parameters
export const schema = {
  personAsking: z
    .discriminatedUnion("name", [
      z.object({
        name: z.literal("Pedro"),
        age: z.number().describe("The age of the person asking the question."),
      }),
      z.object({
        name: z.literal("Juan"),
        hairColor: z
          .string()
          .describe("The hair color of the person asking the question."),
      }),
    ])
    .describe("The person who is asking the question, either Pedro or Juan."),
};

// Define tool metadata
export const metadata = {
  name: "who_is_it",
  description: "Answer the question who is it according to who is asking.",
};

// Tool implementation
export default async function whoIsIt({
  personAsking,
}: InferSchema<typeof schema>): Promise<string> {
  switch (personAsking.name) {
    case "Pedro":
      if (personAsking.age < 18) {
        return "It's Pedro's dad";
      } else return "It's Pedro's brother";
    case "Juan":
      if (personAsking.hairColor === "brown") {
        return "It's Juan's friend";
      } else if (personAsking.hairColor === "black") {
        return "It's Juan's cousin";
      } else {
        return "It's someone else";
      }
  }
}
