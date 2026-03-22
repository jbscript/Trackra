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

  const formatCurrency = (amount: number, hideSymbol = false) => {
    return new Intl.NumberFormat("en-IN", {
      style: hideSymbol ? "decimal" : "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
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
      <div className="flex h-full flex-col overflow-hidden">
        {/* Fixed Header: Search + Month Selector */}
        <div className="flex-shrink-0 pt-8">
          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-on-surface-variant/60" />
              <input
                type="text"
                placeholder="Search transactions, merchants, or"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[64px] w-full rounded-[24px] bg-[#161618] pr-4 pl-12 text-[15px] font-medium text-white placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Month Selector */}
          <div className="mb-8 no-scrollbar flex gap-10 overflow-x-auto overflow-y-hidden pb-2">
            {months.map((month, idx) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(idx)}
                className={cn(
                  "relative flex-shrink-0 cursor-pointer text-xs font-bold tracking-[0.15em] uppercase transition-colors",
                  selectedMonth === idx
                    ? "text-[#5cfd80]"
                    : "text-white/30 hover:text-white/50"
                )}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Transaction List */}
        <div className="no-scrollbar flex-1 overflow-y-auto">
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
                        className="flex items-center justify-between rounded-2xl bg-surface-container p-4 shadow-ambient transition-colors hover:bg-surface-container-high"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                            <Icon
                              strokeWidth={2}
                              size={12}
                              className="h-5 w-5"
                            />
                          </div>
                          <div className="max-w-[140px] sm:max-w-[200px]">
                            <p className="truncate body-md font-bold text-foreground">
                              {tx.category.name}
                            </p>
                            <p className="truncate label-sm text-on-surface-variant">
                              {tx.account.name}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`body-md font-bold ${
                              tx.type === "income"
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {tx.type === "income"
                              ? "+"
                              : tx.type === "transfer"
                                ? ""
                                : "-"}
                            {formatCurrency(tx.amount, false)}
                          </p>
                          <p className="mt-0.5 label-sm text-[0.6rem] tracking-[0.1em] text-on-surface-variant uppercase">
                            {tx.transactionDate.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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
                <p className="body-md">
                  No transactions found for {months[selectedMonth]}.
                </p>
              </div>
            )}
          </div>
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
