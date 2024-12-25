const env = Deno.env;
export const defineConfig = {
  user: env.get('DB_USER'),
  password: env.get('DB_PASSWORD'),
  hostname: env.get('DB_HOST'),
  port: env.get('DB_PORT'),
  database: env.get('DB_NAME'),
};
