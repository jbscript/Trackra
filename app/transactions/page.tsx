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

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
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
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
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
                  {tx.type === "income" ? "+" : "-"}$
                  {tx.amount.toLocaleString()}
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
