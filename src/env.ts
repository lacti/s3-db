const envars = {
  auth: {
    id: process.env.AUTH_ID!,
    password: process.env.AUTH_PASSWORD!,
    jwtSecret: process.env.JWT_SECRET!
  },
  db: {
    bucketName: process.env.BUCKET_NAME!
  },
  actor: {
    bottomHalfLambda: process.env.BOTTOM_HALF_LAMBDA!,
    redisHost: process.env.REDIS_HOST!,
    redisPassword: process.env.REDIS_PASSWORD
  }
};

export default envars;
