export function median(values: number[]): number | null {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

export function percentile(values: number[], p: number): number | null {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (upper >= sorted.length) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function standardDeviation(values: number[]): number | null {
    if (values.length === 0) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((v) => (v - avg) ** 2);
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
}

export function average(values: number[]): number | null {
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sum(values: number[]): number | null {
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0);
}
