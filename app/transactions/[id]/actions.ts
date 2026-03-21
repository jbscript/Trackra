"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function deleteTransaction(id: string) {
  if (!id) throw new Error("Missing transaction ID")

  await db.transaction.delete({
    where: { id },
  })

  revalidatePath("/transactions")
  revalidatePath("/home")
  redirect("/transactions")
}
