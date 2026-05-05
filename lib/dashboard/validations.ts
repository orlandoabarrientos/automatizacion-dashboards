import { z } from "zod";

export const MAX_PAYLOAD_BYTES = 200_000;
const MAX_STRING_LENGTH = 2000;
const MAX_ARRAY_LENGTH = 200;
const MAX_RECORD_KEYS = 200;
const MAX_KEY_LENGTH = 120;

const jsonValue: z.ZodType<unknown> = z.lazy(() =>
    z.union([
        z.string().max(MAX_STRING_LENGTH),
        z.number().finite(),
        z.boolean(),
        z.null(),
        z.array(jsonValue).max(MAX_ARRAY_LENGTH),
        z
            .record(z.string().min(1).max(MAX_KEY_LENGTH), jsonValue)
            .refine((value) => Object.keys(value).length <= MAX_RECORD_KEYS, {
                message: "El objeto excede el límite de propiedades",
            }),
    ])
);

export const RevalidatePayloadSchema = z.object({}).passthrough().optional();
