// src/server/rentals/workflow.ts
import type { RentalEvent, RentalState, Rental } from "./repo";
import { FileRentalRepo } from "./repo.file";
const repo = new FileRentalRepo();

const FLOW: Record<RentalEvent, { from: RentalState[]; to: RentalState }> = {
  reserve:{from:["reserved","paid"],to:"reserved"}, pay:{from:["reserved"],to:"paid"},
  submit_docs:{from:["paid"],to:"docs_submitted"}, verify_docs:{from:["docs_submitted"],to:"docs_verified"},
  generate_contract:{from:["docs_verified"],to:"contract_generated"}, sign_tenant:{from:["contract_generated"],to:"tenant_signed"},
  sign_owner:{from:["tenant_signed"],to:"owner_signed"}, accountant_ok:{from:["owner_signed"],to:"accountant_checked"},
  admin_ok:{from:["accountant_checked"],to:"admin_approved"}, handover_ready:{from:["admin_approved"],to:"handover_ready"},
  handover_done:{from:["handover_ready"],to:"handover_completed"},
};

export async function transition(rentalId: string, event: RentalEvent, by: string, note?: string) {
  const r = await repo.load(rentalId); if (!r) throw new Error("rental_not_found");
  const t = FLOW[event]; if (!t || !t.from.includes(r.state)) throw new Error(`invalid_transition:${r.state}->${event}`);
  r.state = t.to; r.history.push({ at: Date.now(), by, event, to: r.state, note }); return repo.save(r);
}
export { repo };
