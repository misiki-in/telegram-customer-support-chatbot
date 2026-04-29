const process = globalThis.process;

const processBoolean = (x: any) => String(x) == 'true'

const env = {
  NODE_ENV: String(process.env.NODE_ENV),
  PORT: Number(process.env.PORT),
  DATABASE_URL: String(process.env.DATABASE_URL),
  JWT_SECRET: String(process.env.JWT_SECRET),
  DEFAULT_BOT_TOKEN: String(process.env.DEFAULT_BOT_TOKEN),
};

for (const key of Object.keys(env)) {
  if (
    typeof process.env[key] == "undefined" ||
    typeof env[key] == "undefined" ||
    (typeof env[key] != "boolean" && !env[key])
  ) {
    console.log("env", key, "is missing");
    process.exit(1);
  }
}

export const IS_DEV = env.NODE_ENV == "development"
export default env;
