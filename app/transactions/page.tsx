import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"

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

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalInvestments = transactions
    .filter((t) => t.type === "transfer" && t.category.name === "Investments")
    .reduce((acc, t) => acc + t.amount, 0)

  const lifestyleCategories = [
    "Dining",
    "Shopping & Personal Care",
    "Entertainment",
    "Gifts",
  ]
  const totalLifestyleExpense = transactions
    .filter(
      (t) =>
        t.type === "expense" && lifestyleCategories.includes(t.category.name)
    )
    .reduce((acc, t) => acc + t.amount, 0)

  const totalLoansGiven = transactions
    .filter((t) => t.type === "transfer" && t.category.name === "Money Given")
    .reduce((acc, t) => acc + t.amount, 0)

  const netCashBalance =
    totalIncome - (totalExpenses + totalInvestments + totalLoansGiven)

  const uniqueMonths = new Set(
    transactions.map(
      (t) =>
        `${t.transactionDate.getFullYear()}-${t.transactionDate.getMonth()}`
    )
  ).size
  const monthsDivisor = uniqueMonths > 0 ? uniqueMonths : 1

  const avgMonthlyExpense = totalExpenses / monthsDivisor
  const avgMonthlyInvestment = totalInvestments / monthsDivisor

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Income
          </h3>
          <p className="mt-2 text-2xl font-bold text-emerald-500">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </h3>
          <p className="mt-2 text-2xl font-bold text-red-500">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg {formatCurrency(avgMonthlyExpense)} / mo
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Investments
          </h3>
          <p className="mt-2 text-2xl font-bold text-blue-500">
            {formatCurrency(totalInvestments)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg {formatCurrency(avgMonthlyInvestment)} / mo
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">
            Net Cash Balance
          </h3>
          <p
            className={`mt-2 text-2xl font-bold ${netCashBalance >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            {formatCurrency(netCashBalance)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Lifestyle: {formatCurrency(totalLifestyleExpense)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
        <Table>
          <TableCaption className="pb-4">
            A list of your recent transactions.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {tx.transactionDate.toLocaleDateString()}
                </TableCell>
                <TableCell>{tx.account.name}</TableCell>
                <TableCell>{tx.category.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      tx.type === "income"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : tx.type === "transfer"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {tx.type}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tx.note || "-"}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${tx.type === "income" ? "text-emerald-500" : ""}`}
                >
                  {tx.type === "income"
                    ? "+"
                    : tx.type === "transfer"
                      ? ""
                      : "-"}
                  {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
