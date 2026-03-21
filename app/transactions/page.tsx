import { db } from "@/lib/db"
import Link from "next/link"
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Coffee,
  Banknote,
  Car,
  Utensils,
  LayoutGrid,
  ArrowRightLeft,
  Plus,
  Activity,
  User,
  PieChart
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

  // Basic calculations (Assuming 'current' view is monthly for demo purposes)
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalInvestments = transactions
    .filter((t) => t.type === "transfer" && t.category.name === "Investments")
    .reduce((acc, t) => acc + t.amount, 0)

  const netBalance = totalIncome - totalExpenses - totalInvestments

  const formatCurrency = (amount: number, showSign = false, type?: string) => {
    let sign = ""
    if (showSign) {
      if (amount > 0 && type === "income") sign = "+"
      if (amount > 0 && type !== "income") sign = "-"
    }
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount)
    return `${sign}${formatted}`
  }

  // Group transactions by Date
  // Helper to format date label relative to today
  const getRelativeDateLabel = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Normalize for comparison
    const dDate = new Date(date).setHours(0, 0, 0, 0)
    const tDate = new Date(today).setHours(0, 0, 0, 0)
    const yDate = new Date(yesterday).setHours(0, 0, 0, 0)

    if (dDate === tDate) return "Today"
    if (dDate === yDate) return "Yesterday"
    
    return new Intl.DateTimeFormat("en-US", { weekday: 'short', month: 'short', day: 'numeric' }).format(date)
  }

  const groupedTransactions: Record<string, { label: string; dateStr: string; items: typeof transactions }> = {}

  transactions.forEach((tx) => {
    const d = new Date(tx.transactionDate)
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    
    if (!groupedTransactions[dateKey]) {
      const label = getRelativeDateLabel(d)
      const dateStr = new Intl.DateTimeFormat("en-US", { month: 'short', day: 'numeric' }).format(d)
      groupedTransactions[dateKey] = { label, dateStr, items: [] }
    }
    groupedTransactions[dateKey].items.push(tx)
  })

  const getIconForCategory = (categoryName: string, type: string) => {
    const name = categoryName.toLowerCase()
    const baseClass = "w-6 h-6"
    
    if (type === "income") return <Banknote className={`${baseClass} text-primary`} />
    if (name.includes("food") || name.includes("coffee") || name.includes("dining")) return <Coffee className={`${baseClass} text-emerald-400`} />
    if (name.includes("shop") || name.includes("tech")) return <ShoppingBag className={`${baseClass} text-[#5cfd80]`} />
    if (name.includes("transport") || name.includes("auto") || name.includes("uber")) return <Car className={`${baseClass} text-emerald-500`} />
    if (name.includes("restaurant")) return <Utensils className={`${baseClass} text-emerald-400`} />
    
    return <ArrowRightLeft className={`${baseClass} text-on-surface-variant`} />
  }

  return (
    <div className="relative min-h-screen bg-background pb-32 text-foreground font-sans selection:bg-primary/30">
      <main className="container mx-auto max-w-md p-6 pt-12 md:max-w-xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 overflow-hidden rounded-[0.8rem] bg-surface-container-highest shadow-ambient">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Atelier&backgroundColor=131313"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-primary">
              Dashboard
            </h1>
          </div>
          <button className="relative p-2 rounded-full text-primary hover:bg-surface-container transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background"></span>
          </button>
        </header>

        {/* Period Toggle */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold">
            Active Period
          </span>
          <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant">
            <button className="px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest rounded-md bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(92,253,128,0.2)]">
              Monthly
            </button>
            <button className="px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest rounded-md text-on-surface-variant hover:text-foreground">
              Yearly
            </button>
          </div>
        </div>

        {/* Carousel Month Selector */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-[1.2rem] p-5 mb-6 border border-outline-variant shadow-ambient">
          <button className="p-1 text-on-surface-variant hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex flex-col">
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-1">
              Viewing
            </span>
            <span className="text-lg font-bold tracking-tight">
              October 2023
            </span>
          </div>
          <button className="p-1 text-on-surface-variant hover:text-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="bg-surface-container-low border border-outline-variant p-5 rounded-[1.2rem]">
            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
              Total Income
            </p>
            <p className="text-xl font-bold text-primary tracking-tight">
              {formatCurrency(totalIncome, true, "income")}
            </p>
          </div>
          <div className="bg-surface-container-low border border-outline-variant p-5 rounded-[1.2rem]">
            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
              Total Expense
            </p>
            <p className="text-xl font-bold text-foreground tracking-tight">
              {formatCurrency(totalExpenses, true, "expense")}
            </p>
          </div>
          <div className="bg-surface-container-low border border-outline-variant p-5 rounded-[1.2rem]">
            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
              Investments
            </p>
            <p className="text-xl font-bold text-[#86d8ff] tracking-tight">
              {formatCurrency(totalInvestments, true, "expense")}
            </p>
          </div>
          <div className="bg-[#102a1b] border border-primary/20 p-5 rounded-[1.2rem] shadow-[0_4px_24px_rgba(92,253,128,0.05)]">
            <p className="text-[0.65rem] uppercase tracking-widest text-primary font-bold mb-2">
              Net Balance
            </p>
            <p className="text-xl font-bold text-primary tracking-tight">
              {formatCurrency(netBalance, false)}
            </p>
          </div>
        </div>

        {/* Transaction History List */}
        <div className="flex flex-col gap-8 flex-1">
          {Object.entries(groupedTransactions).map(([dateKey, group]) => (
            <div key={dateKey}>
              <div className="flex items-baseline justify-between mb-4 px-1">
                <h3 className="text-xl font-bold text-foreground">{group.label}</h3>
                {group.label === "Today" || group.label === "Yesterday" ? (
                  <span className="text-xs text-on-surface-variant">{group.dateStr}</span>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                {group.items.map((tx) => (
                  <Link
                    href={`/transactions/${tx.id}`}
                    key={tx.id}
                    className="flex items-center justify-between rounded-[1.2rem] bg-surface-container-low border border-outline-variant p-4 shadow-sm hover:bg-surface-container transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.8rem] bg-surface-container-high transition-transform group-hover:scale-105">
                        {getIconForCategory(tx.category.name, tx.type)}
                      </div>
                      <div className="max-w-[130px] sm:max-w-[200px]">
                        <p className="text-[0.95rem] font-bold text-foreground truncate">
                          {tx.note || tx.category.name}
                        </p>
                        <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant truncate mt-0.5">
                          {tx.category.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-[0.95rem] font-bold ${
                          tx.type === "income" ? "text-primary" : "text-foreground"
                        }`}
                      >
                       {formatCurrency(tx.amount, true, tx.type)}
                      </p>
                      <p className="text-[0.65rem] text-on-surface-variant uppercase mt-0.5">
                        {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(tx.transactionDate)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
             <div className="text-center p-12 bg-surface-container-low rounded-2xl border border-outline-variant mt-4">
              <p className="text-on-surface-variant">No transactions found.</p>
             </div>
          )}
        </div>
      </main>
      
      {/* Floating Bottom Nav (Replicated from Home) */}
      <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[2.5rem] glass px-3 py-3 shadow-[0_24px_48px_rgba(0,0,0,0.6)] z-50 border border-outline-variant">
        <Link href="/home" className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors">
          <LayoutGrid className="h-[1.35rem] w-[1.35rem]" />
        </Link>
        <Link href="/transactions" className="relative flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant hover:text-primary transition-colors">
          <Activity className="h-[1.35rem] w-[1.35rem] text-primary" />
          <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
        </Link>
        <Link href="/transactions/new" className="mx-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(92,253,128,0.4)] transition-transform hover:scale-105 active:scale-95">
          <Plus className="h-6 w-6" />
        </Link>
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
