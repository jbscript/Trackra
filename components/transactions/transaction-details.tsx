"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Trash2,
  MapPin,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Receipt,
  ArrowRightLeft,
  User,
  Activity,
  Zap,
  Gift,
} from "lucide-react"
import { TransactionForm } from "./new-transaction-form"
import { updateTransaction } from "@/app/transactions/actions"

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
  categoryId: string
  accountId: string
  category: {
    id: string
    name: string
    type: string
    description: string | null
  }
  account: {
    id: string
    name: string
    balance?: number
  }
}

// Icon helper
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

export function TransactionDetails({
  transaction,
  accounts,
  categories,
  deleteAction,
}: {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-xl pb-24">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            initialData={{
              id: transaction.id,
              type: transaction.type as "expense" | "income" | "transfer",
              amount: transaction.amount,
              note: transaction.note,
              date: transaction.transactionDate,
              categoryId: transaction.categoryId,
              accountId: transaction.accountId,
            }}
            onSave={async (formData) => {
              await updateTransaction(formData)
              setIsEditing(false)
            }}
          />
        </div>
      </div>
    )
  }

  const Icon = getCategoryIcon(transaction.category.name)

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Math.abs(amount))
    return formatted
  }

  return (
    <div className="font-manrope min-h-screen bg-[#0e0e0e] p-4 text-white selection:bg-[#5cfd80]/30 selection:text-[#5cfd80] md:p-8">
      <div className="mx-auto max-w-xl pb-24">
        {/* Header */}
        <div className="mb-16 flex items-center justify-between">
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-[#5cfd80] transition-colors hover:text-[#5cfd80]/80"
          >
            <ChevronLeft size={24} />
            <span className="font-bold tracking-wide">Details</span>
          </Link>
          <button
            onClick={() => setIsEditing(true)}
            className="font-bold tracking-wide text-[#5cfd80] transition-colors hover:text-[#5cfd80]/80"
          >
            Edit
          </button>
        </div>

        {/* Big Icon & Amount */}
        <div className="mb-12 flex flex-col items-center">
          <div className="relative mb-8 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-b from-[#1a2820] to-[#121815] shadow-[0_0_30px_rgba(92,253,128,0.15)]">
            <div className="absolute inset-0 rounded-full border border-[#5cfd80]/20" />
            <Icon strokeWidth={2.5} size={36} className="text-[#5cfd80]" />
          </div>

          <h1 className="mb-4 text-6xl font-extrabold tracking-tighter text-white drop-shadow-md">
            <span className="mr-1 text-4xl text-gray-400">₹</span>
            {formatCurrency(transaction.amount)}
          </h1>
          <p className="max-w-[80%] truncate text-center text-lg font-bold tracking-wide text-gray-400">
            {transaction.note || transaction.category.name}
          </p>
        </div>

        {/* Detail Cards */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col justify-center rounded-[24px] border border-white/5 bg-[#161618] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <h3 className="mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              Date & Time
            </h3>
            <p className="text-[15px] font-bold tracking-wide text-gray-100">
              {new Date(transaction.transactionDate).toLocaleDateString(
                "en-IN",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}{" "}
              &middot;{" "}
              {new Date(transaction.transactionDate).toLocaleTimeString(
                "en-IN",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-center rounded-[20px] border border-white/5 bg-[#161618] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Category
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#5cfd80] shadow-[0_0_8px_rgba(92,253,128,0.5)]" />
                <p className="text-[15px] font-bold tracking-wide text-gray-100">
                  {transaction.category.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-[20px] border border-white/5 bg-[#161618] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Source
              </h3>
              <p className="text-[15px] font-bold tracking-wide text-gray-100">
                {transaction.account.name}
              </p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-[180px] overflow-hidden rounded-[24px] border border-white/5 bg-[#161618] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-15">
              <svg
                width="400"
                height="400"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#ffffff"
                strokeWidth="0.5"
                fill="none"
              >
                <path d="M-50 100l100-20 80 50 100-10 120 40M-50 200l150-50 100 80 150-10M50-50l20 100-30 80 40 100-20 120" />
                <path d="M150-50l-20 120 50 50-10 80 80 100M250-50l30 80-20 100 60 70-30 100M350-50l-10 120 40 60-30 80 20 90" />
                <circle cx="200" cy="200" r="40" />
                <circle cx="200" cy="200" r="55" strokeDasharray="4 8" />
              </svg>
            </div>

            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-xl border border-white/10 bg-[#121214]/80 px-4 py-2 backdrop-blur-sm">
              <MapPin size={16} className="text-[#5cfd80]" />
              <span className="text-xs font-bold tracking-wide text-white">
                452 Park Ave, New York
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="relative flex flex-col justify-center rounded-[24px] border border-white/5 bg-[#161618] p-6 pt-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#5cfd80]/30 bg-[#122217] px-4 py-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
              <div className="h-2.5 w-2.5 rounded-full bg-[#5cfd80] shadow-[0_0_8px_rgba(92,253,128,0.5)]" />
              <span className="text-[10px] font-extrabold tracking-widest text-[#5cfd80] uppercase">
                Cleared by Bank
              </span>
            </div>

            <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              Notes
            </h3>
            <p className="text-[15px] leading-relaxed font-medium tracking-wide text-gray-300 italic">
              "
              {transaction.note ||
                `Standard ${transaction.category.name} transaction.`}
              "
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <form action={deleteAction} className="mt-8">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-transparent p-[18px] font-bold tracking-wide text-red-500 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:bg-[#201010]"
          >
            <Trash2 size={20} />
            Delete Transaction
          </button>
        </form>
      </div>
    </div>
  )
}
