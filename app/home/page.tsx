import { db } from "@/lib/db"
import {
  Bell,
  Plus,
  Activity,
  Wallet,
  PieChart,
  User,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  LayoutGrid
} from "lucide-react"

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
    <div className="relative min-h-screen bg-surface pb-32 text-foreground font-sans selection:bg-primary/30">
      <main className="container mx-auto max-w-md p-6 pt-12 md:max-w-2xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-container-highest shadow-ambient">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Atelier&backgroundColor=131313"
                alt="User"
              />
            </div>
            <div>
              <p className="label-sm uppercase tracking-wider text-on-surface-variant">
                Welcome Back
              </p>
              <h2 className="text-base font-bold text-primary">Atelier</h2>
            </div>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors">
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          </button>
        </header>

        {/* Hero: Net Worth */}
        <section className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(92,253,128,0.6)]"></span>
            <span className="label-sm text-on-surface-variant uppercase tracking-wider">
              Live Valuation
            </span>
          </div>
          <p className="body-md text-on-surface-variant mb-1">
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
            <span className="label-sm text-surface-container-highest bg-surface-container px-3 py-1 rounded-full border border-outline-variant">
              Annualized Growth
            </span>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12 grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-between rounded-[1.5rem] bg-surface-container p-6 shadow-ambient">
            <div className="mb-8 w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
              <Wallet className="h-5 w-5 text-on-surface-variant" />
            </div>
            <div>
              <p className="label-sm text-on-surface-variant mb-1">Liquid Cash</p>
              <p className="headline-md tracking-tight text-foreground">
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
            </div>
          </div>
          <button className="group flex flex-col justify-between rounded-[1.5rem] bg-gradient-to-br from-primary to-primary-container p-6 text-primary-foreground shadow-[0_10px_30px_rgba(2,201,83,0.3)] transition-transform active:scale-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-left mt-8">
              <p className="label-sm uppercase tracking-wider opacity-80 mb-1 font-bold">
                Quick Action
              </p>
              <p className="headline-md leading-[1.1]">
                Add<br />Transaction
              </p>
            </div>
          </button>
        </section>

        {/* Recent Activity */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between px-1">
            <h3 className="headline-md text-foreground">Recent Activity</h3>
            <button className="label-sm font-bold text-primary hover:text-primary-container transition-colors tracking-wide">
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl bg-surface-container p-4 shadow-ambient"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                    {getIcon(tx.type)}
                  </div>
                  <div className="max-w-[140px] sm:max-w-[200px]">
                    <p className="body-md font-bold text-foreground truncate">
                      {tx.category.name}
                    </p>
                    <p className="label-sm text-on-surface-variant truncate">
                      {tx.account.name} •{" "}
                      {tx.transactionDate.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
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
                    {tx.type === "income" ? "+" : tx.type === "transfer" ? "" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="label-sm text-on-surface-variant uppercase tracking-[0.1em] mt-0.5 text-[0.6rem]">
                    {tx.type === "income" ? "Automated" : "Completed"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market Pulse (Simulated) */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#103a27] to-surface-container p-8 shadow-ambient border border-outline-variant">
            <div className="relative z-10">
              <p className="label-sm uppercase tracking-widest text-primary mb-3 font-bold">
                Market Pulse
              </p>
              <h3 className="headline-md text-foreground max-w-[250px]">
                Crypto markets showing volatility expansion patterns.
              </h3>
            </div>
            <h1 className="absolute -bottom-4 -right-2 z-0 text-7xl font-black text-white/[0.03] select-none pointer-events-none">
              MARKET
            </h1>
          </div>
        </section>
      </main>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[2.5rem] glass px-3 py-3 shadow-[0_24px_48px_rgba(0,0,0,0.6)] z-50 border border-outline-variant">
        <button className="relative flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors">
          <LayoutGrid className="h-[1.35rem] w-[1.35rem]" />
          <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors">
          <Activity className="h-[1.35rem] w-[1.35rem]" />
        </button>
        <button className="mx-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(92,253,128,0.4)] transition-transform hover:scale-105 active:scale-95">
          <Plus className="h-6 w-6" />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors">
          <PieChart className="h-[1.35rem] w-[1.35rem]" />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors">
          <User className="h-[1.35rem] w-[1.35rem]" />
        </button>
      </div>
    </div>
  )
}
