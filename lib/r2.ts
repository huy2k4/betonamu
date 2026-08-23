import { S3Client } from '@aws-sdk/client-s3'

export function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId) {
    throw new Error('Missing environment variable: R2_ACCOUNT_ID')
  }
  if (!accessKeyId) {
    throw new Error('Missing environment variable: R2_ACCESS_KEY_ID')
  }
  if (!secretAccessKey) {
    throw new Error('Missing environment variable: R2_SECRET_ACCESS_KEY')
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

export function getR2Config() {
  const bucketName = process.env.R2_BUCKET_NAME
  const publicDomain = process.env.R2_PUBLIC_DOMAIN

  if (!bucketName) {
    throw new Error('Missing environment variable: R2_BUCKET_NAME')
  }
  if (!publicDomain) {
    throw new Error('Missing environment variable: R2_PUBLIC_DOMAIN')
  }

  return {
    bucketName,
    publicDomain,
  }
}
