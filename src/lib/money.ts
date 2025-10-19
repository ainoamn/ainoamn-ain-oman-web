// src/lib/money.ts
export function asMoney(n: number, currency = "OMR") {
try {
return new Intl.NumberFormat("ar-OM", {
style: "currency",
currency,
maximumFractionDigits: 3,
}).format(n);
} catch {
return `${n.toFixed(3)} ${currency}`;
}
}
