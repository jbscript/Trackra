import { db } from "@/lib/db"
import Link from "next/link"
import {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Receipt,
  ArrowRightLeft,
  User,
  Activity,
  Zap,
  Gift,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react"

// A helper to pick an icon based on category name
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase()
  if (name.includes("food") || name.includes("dining")) return Coffee
  if (name.includes("shop") || name.includes("personal")) return ShoppingBag
  if (
    name.includes("transport") ||
    name.includes("gas") ||
    name.includes("cab")
  )
    return Car
  if (
    name.includes("hous") ||
    name.includes("rent") ||
    name.includes("mortgage")
  )
    return Home
  if (
    name.includes("utilit") ||
    name.includes("bill") ||
    name.includes("water") ||
    name.includes("electric")
  )
    return Zap
  if (
    name.includes("health") ||
    name.includes("medical") ||
    name.includes("doctor")
  )
    return Activity
  if (name.includes("gift") || name.includes("family")) return Gift
  if (name.includes("invest") || name.includes("transfer"))
    return ArrowRightLeft
  if (name.includes("salary") || name.includes("income")) return User
  return Receipt
}

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

  const netCashBalance = totalIncome - totalExpenses - totalInvestments

  const formatCurrency = (amount: number, forceSign = false, type?: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // Example uses USD, switch to INR if they want but mockup has $
      maximumFractionDigits: 2,
    }).format(Math.abs(amount))

    // In mockup they use positive/negative signs explicitly
    if (type === "income" || amount > 0) return `+${formatted}`
    if (type === "expense" || amount < 0) return `-${formatted}`
    if (forceSign) return amount >= 0 ? `+${formatted}` : `-${formatted}`
    return formatted
  }

  // Grouping logic for "Today", "Yesterday", and exact dates
  const grouped = transactions.reduce(
    (groups, tx) => {
      const d = tx.transactionDate
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(tx)
      return groups
    },
    {} as Record<string, typeof transactions>
  )

  const groupedArray = Object.keys(grouped)
    .map((key) => {
      const txs = grouped[key]
      const d = txs[0].transactionDate
      const today = new Date()
      const yest = new Date()
      yest.setDate(yest.getDate() - 1)

      let label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      let timeLabel = ""
      if (d.toDateString() === today.toDateString()) {
        label = "Today"
        timeLabel = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      } else if (d.toDateString() === yest.toDateString()) {
        label = "Yesterday"
        timeLabel = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      }

      return {
        label,
        timeLabel,
        transactions: txs,
        sorter: d.getTime(),
      }
    })
    .sort((a, b) => b.sorter - a.sorter)

  // Determine viewing month from the first transaction (or just active month)
  const viewingMonth =
    transactions.length > 0
      ? transactions[0].transactionDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })

  return (
    <div className="font-manrope min-h-screen bg-[#0e0e0e] p-4 text-white selection:bg-[#5cfd80]/30 selection:text-[#5cfd80] md:p-8">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-200 text-orange-800 shadow">
              {/* Profile/Logo placeholder */}
              <div className="h-4 w-3 rounded-sm bg-white/50" />
            </div>
            <h1 className="text-xl font-bold tracking-wide text-[#5cfd80]">
              Dashboard
            </h1>
          </div>
          <button className="rounded-full p-2 text-[#5cfd80] transition-colors hover:bg-[#5cfd80]/10">
            <Bell size={20} />
          </button>
        </div>

        {/* Period Selector */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Active Period
          </span>
          <div className="flex items-center rounded-full border border-white/5 bg-[#18181a] p-1">
            <button className="rounded-full bg-[#5cfd80] px-4 py-1.5 text-xs font-bold text-black shadow-[0_0_10px_rgba(92,253,128,0.3)]">
              MONTHLY
            </button>
            <button className="px-4 py-1.5 text-xs font-bold text-gray-400 transition-colors hover:text-white">
              YEARLY
            </button>
          </div>
        </div>

        {/* Viewing Month */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/5 bg-[#161618] p-4 shadow-lg">
          <button className="p-1 text-gray-400 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              VIEWING
            </p>
            <p className="text-lg font-bold">{viewingMonth}</p>
          </div>
          <button className="p-1 text-gray-400 hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Summary Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-center rounded-2xl border border-white/5 bg-[#161618] p-4 shadow-lg md:p-5">
            <h3 className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Total Income
            </h3>
            <p className="text-xl font-bold tracking-tight text-[#5cfd80] md:text-2xl">
              {formatCurrency(totalIncome, true)}
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-white/5 bg-[#161618] p-4 shadow-lg md:p-5">
            <h3 className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Total Expense
            </h3>
            <p className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {formatCurrency(totalExpenses, true, "expense")}
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-white/5 bg-[#161618] p-4 shadow-lg md:p-5">
            <h3 className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Investments
            </h3>
            <p className="text-xl font-bold tracking-tight text-[#8be9fd] md:text-2xl">
              {formatCurrency(totalInvestments, true, "expense")}
            </p>
          </div>
          <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-[#5cfd80]/20 bg-[#122217] p-4 shadow-lg md:p-5">
            <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-[#5cfd80]/5 blur-2xl" />
            <h3 className="z-10 mb-2 text-[10px] font-bold tracking-wider text-[#5cfd80] uppercase">
              Net Balance
            </h3>
            <p className="z-10 text-xl font-bold tracking-tight text-[#5cfd80] md:text-2xl">
              {formatCurrency(netCashBalance, true)}
            </p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-8 pb-32">
          {groupedArray.map((group) => (
            <div key={group.label} className="space-y-3">
              <div className="mb-2 flex items-end justify-between px-2">
                <h2 className="text-xl font-bold">{group.label}</h2>
                {group.timeLabel && (
                  <span className="mb-1 text-xs font-medium text-gray-500">
                    {group.timeLabel}
                  </span>
                )}
              </div>

              {group.transactions.map((tx) => {
                const Icon = getCategoryIcon(tx.category.name)
                const isIncome = tx.type === "income"
                const isTransfer = tx.type === "transfer"

                return (
                  <Link
                    href={`/transactions/${tx.id}`}
                    key={tx.id}
                    className="group flex items-center justify-between rounded-2xl border border-white/5 bg-[#161618] p-4 shadow-sm transition-colors hover:bg-[#1a1a1d]"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.02] bg-[#1f1f22] transition-colors group-hover:bg-[#252528]">
                        <Icon
                          size={20}
                          className={
                            isIncome ? "text-[#5cfd80]" : "text-[#5cfd80]"
                          }
                        />
                      </div>

                      <div>
                        <h4 className="mb-0.5 text-[15px] font-bold">
                          {tx.note || tx.category.name}
                        </h4>
                        <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                          {tx.category.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`mb-0.5 text-[15px] font-bold tracking-tight ${isIncome ? "text-[#5cfd80]" : "text-white"}`}
                      >
                        {formatCurrency(tx.amount, false, tx.type)}
                      </p>
                      <p className="text-xs font-medium text-gray-500">
                        {tx.transactionDate
                          .toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}

          {groupedArray.length === 0 && (
            <div className="py-20 text-center text-gray-500">
              <p>No transactions found for this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
