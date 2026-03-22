import { db } from "@/lib/db"
import { Suspense } from "react"
import { TransactionDashboard } from "@/components/transactions/transaction-dashboard"
import { deleteTransaction } from "@/app/transactions/actions"

export default async function TransactionsPage() {
  const transactions = await db.transaction.findMany({
    include: {
      account: true,
      category: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  })

  const accounts = await db.account.findMany({
    orderBy: { name: "asc" },
  })

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  })

  // Calculate current balances for accounts to display
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

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-gray-500 font-manrope">Loading Transactions...</div>}>
      <TransactionDashboard
        transactions={transactions as any}
        accounts={accountsWithBalances}
        categories={categories}
        deleteTransactionAction={deleteTransaction}
      />
    </Suspense>
  )
}
