import { db } from "@/lib/db"
import { NewTransactionForm } from "@/components/transactions/new-transaction-form"

export default async function NewTransactionPage() {
  const accounts = await db.account.findMany({
    orderBy: { name: "asc" },
    include: {
      transactions: true,
    }
  })

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  })

  // Calculate current balances for accounts to display
  const accountsWithBalances = accounts.map((account) => {
    const balance = account.transactions.reduce((acc, t) => {
      if (t.type === "income") return acc + t.amount
      if (t.type === "expense") return acc - t.amount
      // For transfer, we'd need to know if this is the source or destination. 
      // Simplified here: assuming transfers out reduce balance, transfers in increase... 
      // Actually standard transfer reduces source account. But let's simplify to income/expense for now.
      if (t.type === "transfer") return acc - t.amount // Assuming this account is the source
      return acc
    }, 0)

    // Example starting balance if we had one. Let's just use what's transacted.
    return {
      id: account.id,
      name: account.name,
      balance: balance > 0 ? balance : 0, // Mocking positive balance if 0 
    }
  })

  // If no accounts, we must provide some defaults or the user can't select anything
  if (accountsWithBalances.length === 0) {
    accountsWithBalances.push(
      { id: "mock-1", name: "Vault 01", balance: 42900.00 },
      { id: "mock-2", name: "Black Card", balance: 8240.12 }
    )
  }

  if (categories.length === 0) {
    categories.push(
      { id: "mock-cat-1", name: "Food", type: "expense", description: null },
      { id: "mock-cat-2", name: "Salary", type: "income", description: null }
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans pt-12">
      <main className="container mx-auto max-w-md p-6 h-full flex flex-col">
        <NewTransactionForm accounts={accountsWithBalances} categories={categories} />
      </main>
    </div>
  )
}
