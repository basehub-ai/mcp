import { mutationApiAvailableBlockTypes } from "@basehub/mutation-api-helpers";

export const BASEHUB_APP_URL =
  process.env.BASEHUB_APP_URL ?? "http://basehub.com";
export const BASEHUB_API_URL =
  process.env.BASEHUB_API_URL ?? "http://api.basehub.com/graphql";

export const FAILED_MUTATION_HELP_TEXT = `MAKE SURE TO CHECK BASEHUB MUTATION TYPES AND STRUCTURE IF THE ERROR PERSISTS.`;
