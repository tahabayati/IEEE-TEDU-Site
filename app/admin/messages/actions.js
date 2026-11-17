"use server";

import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getCurrentAdmin } from "../../../lib/admin-auth.mjs";
import { messagesCollection, STATUSES } from "../../../lib/messages.mjs";

// Back to the same filter and page the admin was on (`view` is the query string, e.g. "status=new&page=2").
async function guard(form) {
  if (!(await getCurrentAdmin())) redirect("/admin/login");
  const id = String(form.get("id") ?? "");
  const view = String(form.get("view") ?? "").replace(/[^a-z0-9=&]/g, "");
  return { col: await messagesCollection(), id: ObjectId.isValid(id) ? new ObjectId(id) : null, view };
}

export async function setStatusAction(form) {
  const { col, id, view } = await guard(form);
  const status = String(form.get("status"));
  if (id && STATUSES.includes(status)) await col.updateOne({ _id: id }, { $set: { status } });
  redirect(`/admin/messages?${view}`);
}

export async function deleteMessageAction(form) {
  const { col, id, view } = await guard(form);
  if (id) await col.deleteOne({ _id: id });
  redirect(`/admin/messages?${view}`);
}
