// src/lib/seqClient.ts
export type EntityKey =
  | "PROPERTY"
  | "AUCTION"
  | "CONTRACT"
  | "INVOICE"
  | "PAYMENT"
  | "TASK"
  | "TICKET";

export type IssueOptions = {
  year?: number;
  width?: number;
  prefixOverride?: string;
  resetPolicy?: "yearly" | "never";
  resourceIdHint?: string;
};

type IssueResponse = {
  ok: boolean;
  entity?: EntityKey;
  year?: number;
  counter?: number;
  serial?: string;
  error?: string;
};

export async function issueSerial(
  entity: EntityKey,
  opts: IssueOptions = {}
): Promise<IssueResponse> {
  const res = await fetch("/api/seq/next", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // يمكنك حقن user-id هنا إذا كان لديك نظام هوية لاحقاً:
      // "x-user-id": currentUserId
    },
    body: JSON.stringify({ entity, ...opts }),
  });

  try {
    const data = (await res.json()) as IssueResponse;
    return data;
  } catch (e) {
    return { ok: false, error: "Invalid JSON response" };
  }
}
