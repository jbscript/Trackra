import { db } from "@/lib/db"
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
} from "lucide-react"
import Link from "next/link"

export default async function Page() {
  const transactions = await db.transaction.findMany({
    include: {
      account: true,
      category: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  })

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalInvestments = transactions
    .filter((t) => t.type === "transfer" && t.category.name === "Investments")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalLoansGiven = transactions
    .filter((t) => t.type === "transfer" && t.category.name === "Loans Given")
    .reduce((acc, t) => acc + t.amount, 0)

  const netCashBalance =
    totalIncome - (totalExpenses + totalInvestments + totalLoansGiven)

  const formatCurrency = (amount: number, hideSymbol = false) => {
    return new Intl.NumberFormat("en-IN", {
      style: hideSymbol ? "decimal" : "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Determine icon based on type
  const getIcon = (type: string) => {
    if (type === "income")
      return <ArrowDownRight className="h-5 w-5 text-primary" />
    if (type === "expense")
      return <ArrowUpRight className="h-5 w-5 text-on-surface-variant" />
    return <ArrowRightLeft className="h-5 w-5 text-on-surface-variant" />
  }

  return (
    <main className="container mx-auto max-w-md p-6 pt-0 md:max-w-2xl">
      {/* Hero: Net Worth */}
        <section className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(92,253,128,0.6)]"></span>
            <span className="label-sm tracking-wider text-on-surface-variant uppercase">
              Live Valuation
            </span>
          </div>
          <p className="mb-1 body-md text-on-surface-variant">
            Total Combined Net Worth
          </p>
          <div className="flex items-baseline gap-1">
            <h1 className="display-lg tracking-tighter text-foreground">
              {formatCurrency(Math.floor(netCashBalance))}
            </h1>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="label-sm font-bold text-primary">+12.4%</span>
            </div>
            <span className="rounded-full border border-outline-variant bg-surface-container px-3 py-1 label-sm text-surface-container-highest">
              Annualized Growth
            </span>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between px-1">
            <h3 className="headline-md text-foreground">Recent Activity</h3>
            <Link
              href="/transactions"
              className="label-sm font-bold tracking-wide text-primary transition-colors hover:text-primary-container"
            >
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {transactions.slice(0, 5).map((tx) => (
              <Link
                href={`/transactions?id=${tx.id}`}
                key={tx.id}
                className="flex items-center justify-between rounded-2xl bg-surface-container p-4 shadow-ambient transition-colors hover:bg-surface-container-high"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                    {getIcon(tx.type)}
                  </div>
                  <div className="max-w-[140px] sm:max-w-[200px]">
                    <p className="truncate body-md font-bold text-foreground">
                      {tx.category.name}
                    </p>
                    <p className="truncate label-sm text-on-surface-variant">
                      {tx.account.name} •{" "}
                      {tx.transactionDate.toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      •{" "}
                      {tx.transactionDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`body-md font-bold ${
                      tx.type === "income" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {tx.type === "income"
                      ? "+"
                      : tx.type === "transfer"
                        ? ""
                        : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="mt-0.5 label-sm text-[0.6rem] tracking-[0.1em] text-on-surface-variant uppercase">
                    {tx.type === "income" ? "Automated" : "Completed"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Market Pulse (Simulated) */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-outline-variant bg-gradient-to-br from-[#103a27] to-surface-container p-8 shadow-ambient">
            <div className="relative z-10">
              <p className="mb-3 label-sm font-bold tracking-widest text-primary uppercase">
                Market Pulse
              </p>
              <h3 className="max-w-[250px] headline-md text-foreground">
                Crypto markets showing volatility expansion patterns.
              </h3>
            </div>
            <h1 className="pointer-events-none absolute -right-2 -bottom-4 z-0 text-7xl font-black text-white/[0.03] select-none">
              MARKET
            </h1>
          </div>
        </section>
      </main>
  )
}
