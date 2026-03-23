"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  X,
  Utensils,
  CreditCard,
  Calendar,
  ChevronRight,
  Delete,
} from "lucide-react"
import { createTransaction } from "@/app/transactions/actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

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

export function TransactionForm({
  accounts,
  categories,
  initialData,
  onSave,
  onClose,
}: {
  accounts: Account[]
  categories: Category[]
  initialData?: {
    id?: string
    type: "expense" | "income" | "transfer"
    amount: number
    note: string | null
    date: Date
    categoryId: string
    accountId: string
  }
  onSave?: (formData: FormData) => Promise<void>
  onClose?: () => void
}) {
  const router = useRouter()
  const [type, setType] = useState<"expense" | "income" | "transfer">(
    initialData?.type || "expense"
  )
  const [expr, setExpr] = useState<string>(
    initialData ? initialData.amount.toString() : "0"
  )
  const [note, setNote] = useState<string>(initialData?.note || "")
  const [date, setDate] = useState<string>(() => {
    const d = initialData ? new Date(initialData.date) : new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  })
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId ||
      categories.find((c) => c.type === type)?.id ||
      categories[0]?.id ||
      ""
  )
  const [accountId, setAccountId] = useState<string>(
    initialData?.accountId || accounts[0]?.id || ""
  )
  const [isLoading, setIsLoading] = useState(false)

  // Filter categories based on selected type
  const availableCategories = categories.filter((c) => c.type === type)

  const handleTypeChange = (newType: "expense" | "income" | "transfer") => {
    setType(newType)
    const newCat = categories.find((c) => c.type === newType)
    if (newCat) setCategoryId(newCat.id)
  }

  const handleKeypadPress = (key: string) => {
    if (key === "delete") {
      setExpr((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"))
      return
    }
    if (key === "=") {
      try {
        const sanitized = expr.replace(/[^-()\d/*+.]/g, "")
        // Safe evaluation
        const result = new Function(`return ${sanitized}`)()
        setExpr(String(result))
      } catch {
        // Ignored, don't update if invalid
      }
      return
    }

    if (expr === "0" && !["+", "-", "*", "/", "."].includes(key)) {
      setExpr(key)
    } else {
      setExpr((prev) => prev + key)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    let finalAmount = "0"
    try {
      const sanitized = expr.replace(/[^-()\d/*+.]/g, "")
      const result = new Function(`return ${sanitized}`)()
      finalAmount = String(result)
    } catch {
      finalAmount = expr
    }

    const formData = new FormData()
    if (initialData?.id) formData.append("id", initialData.id)
    formData.append("type", type)
    formData.append("amount", finalAmount)
    formData.append("note", note)
    formData.append("date", new Date(date).toISOString())
    formData.append("categoryId", categoryId)
    formData.append("accountId", accountId)

    try {
      if (onSave) {
        await onSave(formData)
      } else {
        await createTransaction(formData)
      }
    } catch (error) {
      console.error("Failed to save transaction", error)
      setIsLoading(false)
    }
  }

  const formatDisplayDate = (dateString: string) => {
    try {
      const d = new Date(dateString)
      const today = new Date()
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()

      const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      if (isToday) return `Today, ${time}`
      return `${d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}, ${time}`
    } catch (e) {
      return "Invalid date"
    }
  }

  const selectedCategory = categories.find((c) => c.id === categoryId)

  // Map symbols for display vs math
  const displayExpr = expr.replace(/\*/g, "×").replace(/\//g, "÷")

  // For Save Button check
  let currentVal = 0
  try {
    const s = expr.replace(/[^-()\d/*+.]/g, "")
    currentVal = new Function(`return ${s}`)()
  } catch {}

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col text-white sm:px-6 md:min-h-full">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onClose?.() || router.back()}
          className="p-1 text-gray-400 transition-colors hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-medium text-[#4ADE80]">
          {initialData ? "Edit Transaction" : "New Transaction"}
        </h1>
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#E5CDC1]">
          {/* Avatar placeholder with small internal shapes */}
          <div className="mt-3 mr-1 h-2 w-2 rounded-sm bg-black/20"></div>
          <div className="mt-3 h-2 w-2 -rotate-12 rounded-sm bg-black/20"></div>
        </div>
      </header>

      {/* Type Toggle */}
      <div className="mx-auto mb-8 flex w-full max-w-[340px] rounded-full bg-[#16181C] p-[5px] shadow-inner">
        {(["expense", "income", "transfer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 rounded-full py-2.5 text-[0.85rem] font-medium capitalize transition-all ${
              type === t
                ? "bg-[#4ADE80] text-black shadow-md shadow-green-900/20"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Display */}
      <div className="mb-8 flex flex-col items-center justify-center">
        <span className="mb-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#8E8E93] uppercase">
          Amount Due
        </span>
        <div className="flex items-center">
          <span className="text-[4rem] font-bold tracking-tight text-[#4ADE80] drop-shadow-[0_0_25px_rgba(74,222,128,0.3)]">
            ₹{displayExpr}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <Select value={accountId} onValueChange={(val) => { if (val) setAccountId(val) }}>
            <SelectTrigger className="flex h-[38px] w-auto min-w-[180px] items-center gap-2 rounded-full border-0 bg-[#292A3E] px-4 py-0 text-[14.5px] font-medium text-white shadow-none hover:bg-[#34354A] focus:ring-0">
              <div className="flex flex-1 items-center justify-center gap-2">
                <CreditCard className="h-4 w-4 text-white" />
                <span className="truncate">{accounts.find((a) => a.id === accountId)?.name || "Select Account"}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="border-[#292A3E] bg-[#1C1C1E] text-white">
              {accounts.map((a) => (
                <SelectItem 
                  key={a.id} 
                  value={a.id} 
                  className="cursor-pointer py-2.5 text-[14.5px] focus:bg-[#292A3E] focus:text-white"
                >
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selectors Area */}
      <div className="mb-6 flex w-full flex-col gap-3">
        {/* Category Selector */}
        <Select value={categoryId} onValueChange={(val) => { if (val) setCategoryId(val) }}>
          <SelectTrigger className="relative flex w-full h-auto items-center justify-between rounded-2xl border-0 bg-[#16181C] p-4 shadow-sm transition-transform active:scale-[0.98] outline-none focus:ring-0 [&>svg]:hidden hover:bg-[#16181C]">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#133021]">
                  <Utensils className="h-6 w-6 text-[#4ADE80]" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[0.65rem] font-medium text-[#8E8E93]">
                    Category
                  </span>
                  <span className="max-w-[150px] truncate text-[1.05rem] font-semibold text-white">
                    {categories.find((c) => c.id === categoryId)?.name || "Select"}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-[#292A3E] bg-[#1C1C1E] text-white">
            {availableCategories.length === 0 && (
              <SelectItem value="empty" disabled className="text-gray-500">No categories</SelectItem>
            )}
            {availableCategories.map((c) => (
              <SelectItem 
                key={c.id} 
                value={c.id} 
                className="cursor-pointer py-2.5 text-[14.5px] focus:bg-[#292A3E] focus:text-white"
              >
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Selector */}
        <div className="relative flex w-full items-center gap-3 rounded-2xl bg-[#16181C] p-4 shadow-sm transition-transform active:scale-[0.98]">
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="absolute inset-0 z-10 w-full appearance-none opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            required
          />
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#222428]">
            <Calendar className="h-5 w-5 text-gray-300" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="mb-0.5 text-[0.65rem] font-medium text-[#8E8E93]">
              Date
            </span>
            <span className="text-sm leading-tight font-semibold whitespace-pre-wrap text-white">
              {formatDisplayDate(date)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Keypad (Calculator Mode) */}
      <div className="mb-6 flex w-full flex-col gap-2">
        {/* Row 1 */}
        <div className="grid grid-cols-4 gap-2">
          {["7", "8", "9", "/"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeypadPress(key)}
              className="flex h-14 items-center justify-center rounded-xl bg-[#1C1C1E] text-2xl font-medium transition-all active:bg-[#2C2C2E]"
            >
              {key === "/" ? (
                <span className="text-3xl font-light text-[#4ADE80]">÷</span>
              ) : (
                <span className="text-white">{key}</span>
              )}
            </button>
          ))}
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-2">
          {["4", "5", "6", "*"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeypadPress(key)}
              className="flex h-14 items-center justify-center rounded-xl bg-[#1C1C1E] text-2xl font-medium transition-all active:bg-[#2C2C2E]"
            >
              {key === "*" ? (
                <span className="text-3xl font-light text-[#4ADE80]">×</span>
              ) : (
                <span className="text-white">{key}</span>
              )}
            </button>
          ))}
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-4 gap-2">
          {["1", "2", "3", "-"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeypadPress(key)}
              className="flex h-14 items-center justify-center rounded-xl bg-[#1C1C1E] text-2xl font-medium transition-all active:bg-[#2C2C2E]"
            >
              {key === "-" ? (
                <span className="text-3xl font-light text-[#4ADE80]">-</span>
              ) : (
                <span className="text-white">{key}</span>
              )}
            </button>
          ))}
        </div>
        {/* Row 4 */}
        <div className="grid grid-cols-4 gap-2">
          {[".", "0", "delete", "+"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeypadPress(key)}
              className="flex h-14 items-center justify-center rounded-xl bg-[#1C1C1E] text-2xl font-medium transition-all active:bg-[#2C2C2E]"
            >
              {key === "delete" ? (
                <div className="flex items-center justify-center">
                  <Delete className="h-[22px] w-[22px] fill-current text-white" />
                </div>
              ) : key === "+" ? (
                <span className="text-3xl font-light text-[#4ADE80]">+</span>
              ) : (
                <span className="text-white">{key}</span>
              )}
            </button>
          ))}
        </div>
        {/* Row 5: Equals spans full width */}
        <button
          type="button"
          onClick={() => handleKeypadPress("=")}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-[#1C1C1E] transition-all active:bg-[#2C2C2E]"
        >
          <span className="text-[2rem] font-light text-[#4ADE80]">=</span>
        </button>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || isNaN(currentVal) || currentVal <= 0}
        className="mt-auto w-full rounded-full bg-[#4ADE80] py-[18px] text-center text-[15px] font-bold text-black transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
      >
        {isLoading ? "Saving..." : "Save Transaction"}
      </button>
    </div>
  )
}
