export interface CreateContractInput {
  propertyId: string;
  buyerName?: string;
  sellerName?: string;
  amount?: number;
  [key: string]: any;
}

export interface CreateContractResult {
  ok: boolean;
  id: string;
  received?: Record<string, any>;
}

export async function createContract(
  input: CreateContractInput
): Promise<CreateContractResult> {
  const res = await fetch("/api/contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`CreateContract failed: ${res.status} ${msg}`);
  }
  return res.json();
}
