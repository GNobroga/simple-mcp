import "dotenv/config";
import z from "zod"

const schema = z.object({
    PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
});

type Env = z.infer<typeof schema>;

const validateEnv = (data: Record<string, any>): Env => {
    const parsedEnv = schema.safeParse(data);
    if (!parsedEnv.success) {
        throw new Error(z.treeifyError(parsedEnv.error).errors.join(', '));
    }

    return parsedEnv.data;
}

export const env = validateEnv(process.env);