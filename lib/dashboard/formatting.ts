const dateFormatter = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
});

export const formatDate = (value: string | Date | null | undefined) => {
    if (!value) return "Sin datos";
    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) return "Sin datos";
    return dateFormatter.format(dateValue);
};

export const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    return currencyFormatter.format(value);
};

export const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    return percentFormatter.format(value);
};

export const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    return numberFormatter.format(value);
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
        // Check if comma is used as decimal or thousands
        const parts = cleaned.split(",");
        if (parts.length === 2 && parts[1].length <= 2) {
            return cleaned.replace(",", ".");
        }
        return cleaned.replace(/,/g, "");
    }
    return cleaned;
};

export const extractNumericValue = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return null;
    const normalized = normalizeNumberString(value);
    if (!normalized) return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

export const extractBooleanValue = (value: unknown): boolean | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "si", "sí", "verdadero", "activo", "ganado", "enviada", "cumple", "completado"].includes(normalized)) return true;
        if (["false", "0", "no", "falso", "inactivo", "perdido", "pendiente", "no cumple", "incompleto"].includes(normalized)) return false;
    }
    if (typeof value === "number") return value === 1;
    return null;
};

export const parseDateValue = (value: unknown): Date | null => {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const str = String(value).trim();
    if (!str) return null;
    const date = new Date(str);
    if (Number.isNaN(date.getTime())) return null;
    return date;
};

export const toDateKey = (value: unknown): string | null => {
    const date = parseDateValue(value);
    if (!date) return null;
    return date.toISOString().slice(0, 10);
};

export const toMonthKey = (value: unknown): string | null => {
    const date = parseDateValue(value);
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};
