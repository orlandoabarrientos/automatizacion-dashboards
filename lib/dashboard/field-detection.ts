const STATUS_FIELDS = ["estado", "status", "state"];
const AMOUNT_FIELDS = ["monto", "amount", "total", "precio", "price"];
const DATE_FIELDS = ["fecha", "date", "createdat", "updatedat", "syncedat", "synced_at", "created_at", "updated_at"];

const normalizeKey = (value: string) =>
    value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const findField = (keys: string[], candidates: string[]) => {
    for (const key of keys) {
        const normalized = normalizeKey(key);
        if (candidates.includes(normalized)) {
            return key;
        }
    }
    return null;
};

export const detectStatusField = (keys: string[]) => findField(keys, STATUS_FIELDS);

export const detectAmountField = (keys: string[]) => findField(keys, AMOUNT_FIELDS);

export const detectDateField = (keys: string[]) => findField(keys, DATE_FIELDS);
