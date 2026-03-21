"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createTransaction(formData: FormData) {
  const type = formData.get("type") as string
  const amountStr = formData.get("amount") as string
  const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""))
  const note = formData.get("note") as string
  const transactionDate = new Date(formData.get("date") as string)
  const categoryId = formData.get("categoryId") as string
  const accountId = formData.get("accountId") as string

  if (!type || isNaN(amount) || !transactionDate || !categoryId || !accountId) {
    throw new Error("Missing required fields")
  }

  await db.transaction.create({
    data: {
      type,
      amount,
      note,
      transactionDate,
      categoryId,
      accountId,
    },
  })

  revalidatePath("/home")
  redirect("/home")
}
export async function updateTransaction(formData: FormData) {
  const id = formData.get("id") as string
  const type = formData.get("type") as string
  const amountStr = formData.get("amount") as string
  const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""))
  const note = formData.get("note") as string
  const transactionDate = new Date(formData.get("date") as string)
  const categoryId = formData.get("categoryId") as string
  const accountId = formData.get("accountId") as string

  if (
    !id ||
    !type ||
    isNaN(amount) ||
    !transactionDate ||
    !categoryId ||
    !accountId
  ) {
    throw new Error("Missing required fields")
  }

  await db.transaction.update({
    where: { id },
    data: {
      type,
      amount,
      note,
      transactionDate,
      categoryId,
      accountId,
    },
  })

  revalidatePath("/home")
  revalidatePath(`/transactions/${id}`)
}
