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
  Bell,
  Plus,
} from "lucide-react"
import { TransactionDetails } from "./transaction-details"
import { TransactionForm } from "./new-transaction-form"

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
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Math.abs(amount))

    if (type === "income" || amount > 0) return `+${formatted}`
    if (type === "expense" || amount < 0) return `-${formatted}`
    if (forceSign) return amount >= 0 ? `+${formatted}` : `-${formatted}`
    return formatted
  }

  // Grouping logic
  const grouped = transactions.reduce(
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

  return (
    <div className="font-manrope min-h-screen bg-[#0e0e0e] p-4 text-white selection:bg-[#5cfd80]/30 selection:text-[#5cfd80] md:p-8">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-200 text-orange-800 shadow">
              <div className="h-4 w-3 rounded-sm bg-white/50" />
            </div>
            <h1 className="text-xl font-bold tracking-wide text-[#5cfd80]">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAdding(true)
                router.push("/transactions?add=true", { scroll: false })
              }}
              className="flex items-center justify-center rounded-full bg-[#5cfd80] p-2 text-black transition-transform hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
            </button>
            <button className="rounded-full p-2 text-[#5cfd80] transition-colors hover:bg-[#5cfd80]/10">
              <Bell size={20} />
            </button>
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

                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setSelectedTxId(tx.id)
                      router.push(`/transactions?id=${tx.id}`, { scroll: false })
                    }}
                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-[#161618] p-4 shadow-sm transition-colors hover:bg-[#1a1a1d]"
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
                        {new Date(tx.transactionDate).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
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

      {/* Details Overlay */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0e0e0e] no-scrollbar">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0e0e0e] py-6 px-6 no-scrollbar">
          <div className="mx-auto max-w-xl">
            <TransactionForm
              accounts={accounts}
              categories={categories}
              onClose={closeOverlays}
              onSave={async (formData) => {
                closeOverlays()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
