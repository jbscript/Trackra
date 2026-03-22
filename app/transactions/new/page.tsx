import { redirect } from "next/navigation"

export default async function NewTransactionPage() {
  redirect("/transactions?add=true")
}
