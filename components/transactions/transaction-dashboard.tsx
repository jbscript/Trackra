"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  Search,
} from "lucide-react"
import { TransactionDetails } from "./transaction-details"
import { TransactionForm } from "./new-transaction-form"
import { cn } from "@/lib/utils"

type Account = {
  id: string
  name: string
  balance: number
}

type Category = {
  id: string
  name: string
  type: string
  description: string | null
}

type Transaction = {
  id: string
  type: string
  amount: number
  note: string | null
  transactionDate: Date
  accountId: string
  categoryId: string
  account: { name: string }
  category: { name: string }
}

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

export function TransactionDashboard({
  transactions,
  accounts,
  categories,
  deleteTransactionAction,
}: {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  deleteTransactionAction: (formData: FormData) => Promise<void>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTxId, setSelectedTxId] = useState<string | null>(
    searchParams.get("id")
  )
  const [isAdding, setIsAdding] = useState(searchParams.get("add") === "true")

  // Sync state with URL params
  useEffect(() => {
    const id = searchParams.get("id")
    const add = searchParams.get("add") === "true"
    setSelectedTxId(id)
    setIsAdding(add)
  }, [searchParams])

  const closeOverlays = () => {
    setSelectedTxId(null)
    setIsAdding(false)
    router.replace("/transactions", { scroll: false })
  }

  const selectedTx = transactions.find((t) => t.id === selectedTxId)

  const formatCurrency = (amount: number, forceSign = false, type?: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Math.abs(amount))

    if (type === "income" || amount > 0) return `+${formatted}`
    if (type === "expense" || (amount < 0 && type !== "transfer"))
      return `-${formatted}`
    if (forceSign) return amount >= 0 ? `+${formatted}` : `-${formatted}`
    return formatted
  }

  // State for search and month
  const [searchQuery, setSearchQuery] = useState("")
  const currentMonthIdx = new Date().getMonth() // 0-11
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIdx)

  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ]

  // Filtering logic
  const filteredTransactions = transactions.filter((tx) => {
    const d = new Date(tx.transactionDate)
    const matchesMonth = d.getMonth() === selectedMonth
    const matchesSearch =
      searchQuery === "" ||
      tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.account.name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesMonth && matchesSearch
  })

  // Grouping logic
  const grouped = filteredTransactions.reduce(
    (groups, tx) => {
      const d = new Date(tx.transactionDate)
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
      const d = new Date(txs[0].transactionDate)
      const today = new Date()
      const yest = new Date()
      yest.setDate(yest.getDate() - 1)

      const isToday = d.toDateString() === today.toDateString()
      const isYesterday = d.toDateString() === yest.toDateString()

      let label = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })

      if (isToday) label = `Today, ${label}`
      else if (isYesterday) label = `Yesterday, ${label}`

      return {
        label,
        transactions: txs,
        sorter: d.getTime(),
      }
    })
    .sort((a, b) => b.sorter - a.sorter)

  return (
    <>
      {/* Transaction List */}
    <div className="space-y-6 pb-32">
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Search transactions, merchants, or"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[64px] w-full rounded-[24px] bg-[#161618] pl-12 pr-4 text-[15px] font-medium text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Month Selector */}
      <div className="no-scrollbar mb-10 flex gap-10 overflow-x-auto pb-2">
        {months.map((month, idx) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(idx)}
            className={cn(
              "relative flex-shrink-0 text-xs font-bold tracking-[0.15em] transition-colors uppercase",
              selectedMonth === idx
                ? "text-[#5cfd80]"
                : "text-white/30 hover:text-white/50"
            )}
          >
            {month}
            {selectedMonth === idx && (
              <div className="absolute -bottom-4 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#5cfd80] shadow-[0_0_8px_rgba(92,253,128,0.6)]" />
            )}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-12">
        {groupedArray.map((group) => (
          <div key={group.label} className="space-y-6">
            <h2 className="px-1 text-[22px] font-bold tracking-tight text-white/50">
              {group.label}
            </h2>

            <div className="space-y-4">
              {group.transactions.map((tx) => {
                const Icon = getCategoryIcon(tx.category.name)
                const isIncome = tx.type === "income"

                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setSelectedTxId(tx.id)
                      router.push(`/transactions?id=${tx.id}`, {
                        scroll: false,
                      })
                    }}
                    className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-[32px] bg-[#161618] px-6 py-6 transition-all hover:bg-[#1a1a1d] active:scale-[0.99] shadow-lg shadow-black/20"
                  >
                    <div className="flex items-center gap-5">
                      {/* Icon Container */}
                      <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[20px] bg-[#0c0c0d]">
                        <Icon strokeWidth={2} size={24} className="text-white" />
                      </div>

                      <div>
                        <h4 className="mb-1 text-[18px] font-bold leading-tight tracking-tight text-white group-hover:text-primary transition-colors">
                          {tx.note || tx.category.name}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[14px] font-medium text-white/40">
                            {tx.category.name}
                          </p>
                          <span className="text-[14px] text-white/20">
                            &bull;
                          </span>
                          <p className="text-[14px] font-medium text-white/40">
                            {new Date(tx.transactionDate).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={cn(
                          "mb-1 text-[22px] font-bold tracking-tight",
                          isIncome ? "text-[#5cfd80]" : "text-white"
                        )}
                      >
                        {formatCurrency(tx.amount, false, tx.type)}
                      </p>
                      <p className="text-[10px] font-extrabold tracking-[0.1em] text-white/30 uppercase">
                        {isIncome ? "SETTLED" : "VERIFIED"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {groupedArray.length === 0 && (
          <div className="py-20 text-center text-on-surface-variant/40">
            <p className="body-md">No transactions found for {months[selectedMonth]}.</p>
          </div>
        )}
      </div>
    </div>

      {/* Details Overlay */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 no-scrollbar overflow-y-auto bg-[#0e0e0e]">
          <TransactionDetails
            transaction={selectedTx as any}
            accounts={accounts}
            categories={categories}
            deleteAction={async (formData) => {
              await deleteTransactionAction(formData)
              closeOverlays()
            }}
            onClose={closeOverlays}
          />
        </div>
      )}

      {/* Add Transaction Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-50 no-scrollbar overflow-y-auto bg-[#0e0e0e] px-6 py-6">
          <div className="mx-auto max-w-xl">
            <TransactionForm
              accounts={accounts}
              categories={categories}
              onClose={closeOverlays}
            />
          </div>
        </div>
      )}
    </>
  )
}
