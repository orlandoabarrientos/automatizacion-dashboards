const dateFormatter = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
});

export const formatDate = (value: string | Date | null | undefined) => {
    if (!value) return "Sin datos";
    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) return "Sin datos";
    return dateFormatter.format(dateValue);
};

export const sanitizeText = (value: unknown, maxLength = 600) => {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/[\u0000-\u001F\u007F]/g, " ").trim();
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const normalizeNumberString = (value: string) => {
    const cleaned = value.replace(/[^0-9,.-]/g, "").trim();
    if (!cleaned) return null;
    const hasComma = cleaned.includes(",");
    const hasDot = cleaned.includes(".");
    if (hasComma && hasDot) {
        const lastComma = cleaned.lastIndexOf(",");
        const lastDot = cleaned.lastIndexOf(".");
        const decimalSeparator = lastComma > lastDot ? "," : ".";
        const thousandSeparator = decimalSeparator === "," ? "." : ",";
        return cleaned
            .split(thousandSeparator)
            .join("")
            .replace(decimalSeparator, ".");
    }
    if (hasComma) {
        return cleaned.replace(/,/g, ".");
    }
    return cleaned;
};

export const extractNumericValue = (value: unknown) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return null;
    const normalized = normalizeNumberString(value);
    if (!normalized) return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};
