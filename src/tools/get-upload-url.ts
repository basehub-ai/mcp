import { InferSchema } from "xmcp";
import { authenticate } from "../utils/auth";
import { basehub } from "basehub";
import { getMcpToken, withLogging } from "../utils";
import { z } from "zod";

export const schema = {
  fileName: z.string().describe("The name of the file to upload"),
};

export const metadata = {
  name: "get_upload_url",
  description: `Get a signed URL to upload a file to BaseHub.
  This is useful for uploading files to BaseHub.
  `,
  annotations: {
    title: "Get Upload URL",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

async function getUploadURL({ fileName }: InferSchema<typeof schema>) {
  try {
    const mcpToken = getMcpToken();
    const { write: token } = await authenticate(mcpToken);
    const result = await basehub({ token }).mutation({
      getUploadSignedURL: {
        __args: {
          fileName,
        },
        signedURL: true,
        uploadURL: true,
      },
    });

    const transaction = z
      .object({
        getUploadSignedURL: z.object({
          signedURL: z.string(),
          uploadURL: z.string(),
        }),
      })
      .parse(result);

    return {
      content: [
        {
          type: "text",
          text: `Upload URL: ${transaction.getUploadSignedURL.uploadURL}`,
        },
        {
          type: "text",
          text: `NOTE: if you have access to a terminal, you can upload the file by running \`curl -X PUT --data-binary @/path/to/your/local/file.jpg ${transaction.getUploadSignedURL.signedURL}\``,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error getting upload URL: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

export default withLogging("get_upload_url", getUploadURL);
