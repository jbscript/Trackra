import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { TransactionDetails } from "@/components/transactions/transaction-details"

// Action to delete
async function deleteTransaction(id: string) {
  "use server"
  await db.transaction.delete({ where: { id } })
  revalidatePath("/transactions")
  revalidatePath("/home")
  redirect("/transactions")
}

export default async function TransactionDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params

  const transaction = await db.transaction.findUnique({
    where: { id },
    include: {
      account: true,
      category: true,
    },
  })

  if (!transaction) {
    notFound()
  }

  const accounts = await db.account.findMany({
    orderBy: { name: "asc" },
  })
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  })

  // Calculate current balances for accounts to display
  // (Reusing logic from NewTransactionPage if needed, or just simplifying)
  const accountsWithBalances = await Promise.all(
    accounts.map(async (account: any) => {
      const txs = await db.transaction.findMany({
        where: { accountId: account.id },
      })
      const balance = txs.reduce((acc: number, t: any) => {
        if (t.type === "income") return acc + t.amount
        if (t.type === "expense") return acc - t.amount
        if (t.type === "transfer") return acc - t.amount
        return acc
      }, 0)

      return {
        id: account.id,
        name: account.name,
        balance: balance > 0 ? balance : 0,
      }
    })
  )

  const deleteAction = deleteTransaction.bind(null, transaction.id)

  return (
    <TransactionDetails
      transaction={transaction}
      accounts={accountsWithBalances}
      categories={categories}
      deleteAction={deleteAction}
    />
  )
}
