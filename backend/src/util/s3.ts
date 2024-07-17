import { S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadToS3(
  key: string,
  contentType: string,
  buffer: Buffer
) {
  const region = "us-east-2";
  const s3Client = new S3Client({ region, credentials: fromEnv() });

  const bucket = "gpinterface-images";
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  try {
    const parallelUploads3 = new Upload({ client: s3Client, params });

    await parallelUploads3.done();
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  } catch (err) {
    console.error("Failed to upload file with KMS.", err);
    throw err;
  }
}
