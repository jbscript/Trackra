import { db } from "@/lib/db"
import { Suspense } from "react"
import { TransactionDashboard } from "@/components/transactions/transaction-dashboard"
import { deleteTransaction } from "@/app/transactions/actions"
import { Bell } from "lucide-react"

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
    <div className="relative min-h-screen bg-surface pb-32 font-sans text-foreground selection:bg-primary/30">
      <main className="container mx-auto max-w-md p-6 pt-12 md:max-w-2xl">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-container-highest shadow-ambient">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Atelier&backgroundColor=131313"
                alt="User"
              />
            </div>
            <div>
              <p className="label-sm tracking-wider text-on-surface-variant uppercase">
                Welcome Back
              </p>
              <h2 className="text-base font-bold text-primary">Atelier</h2>
            </div>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-surface-container-highest">
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full bg-primary"></span>
          </button>
        </header>
        <Suspense
          fallback={
            <div className="font-manrope flex min-h-screen items-center justify-center bg-[#0e0e0e] text-gray-500">
              Loading Transactions...
            </div>
          }
        >
          <TransactionDashboard
            transactions={transactions as any}
            accounts={accountsWithBalances}
            categories={categories}
            deleteTransactionAction={deleteTransaction}
          />
        </Suspense>
      </main>
    </div>
  )
}
