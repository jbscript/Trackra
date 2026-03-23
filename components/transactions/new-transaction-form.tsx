"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  X,
  Calendar,
  Delete,
  Shapes,
  Wallet,
  FileEdit,
  ArrowRight,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Monitor,
  HeartPulse,
  Briefcase,
  Coffee,
  Plane,
  Gift,
  Landmark,
  PiggyBank,
  DollarSign,
  Trash2,
} from "lucide-react"
import { createTransaction, updateTransaction, deleteTransaction } from "@/app/transactions/actions"
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

const getCategoryIcon = (name: string, props: any) => {
  const n = name.toLowerCase()
  if (n.includes("food") || n.includes("eat") || n.includes("dining"))
    return <Utensils {...props} />
  if (
    n.includes("shopping") ||
    n.includes("store") ||
    n.includes("market") ||
    n.includes("buy")
  )
    return <ShoppingCart {...props} />
  if (
    n.includes("transport") ||
    n.includes("car") ||
    n.includes("gas") ||
    n.includes("fuel") ||
    n.includes("travel")
  )
    return <Car {...props} />
  if (
    n.includes("home") ||
    n.includes("rent") ||
    n.includes("mortgage") ||
    n.includes("house")
  )
    return <Home {...props} />
  if (n.includes("tech") || n.includes("electronics") || n.includes("software"))
    return <Monitor {...props} />
  if (
    n.includes("health") ||
    n.includes("medical") ||
    n.includes("pharmacy") ||
    n.includes("doctor")
  )
    return <HeartPulse {...props} />
  if (
    n.includes("work") ||
    n.includes("salary") ||
    n.includes("wages") ||
    n.includes("job")
  )
    return <Briefcase {...props} />
  if (n.includes("coffee") || n.includes("cafe")) return <Coffee {...props} />
  if (n.includes("flight") || n.includes("hotel") || n.includes("holiday"))
    return <Plane {...props} />
  if (n.includes("gift") || n.includes("present")) return <Gift {...props} />
  if (
    n.includes("bank") ||
    n.includes("finance") ||
    n.includes("fee") ||
    n.includes("tax")
  )
    return <Landmark {...props} />
  if (n.includes("savings") || n.includes("investment"))
    return <PiggyBank {...props} />
  if (n.includes("income") || n.includes("bonus") || n.includes("cash"))
    return <DollarSign {...props} />

  return <Shapes {...props} />
}

export function TransactionForm({
  accounts,
  categories,
  initialData,
  onSave,
  onDelete,
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
  onDelete?: () => Promise<void> | void
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
        if (initialData?.id) {
          await updateTransaction(formData)
        } else {
          await createTransaction(formData)
        }
      }
      if (onClose) onClose()
    } catch (error) {
      console.error("Failed to save transaction", error)
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    setIsLoading(true)
    try {
      if (onDelete) {
        await onDelete()
      } else {
        const formData = new FormData()
        formData.append("id", initialData.id)
        await deleteTransaction(formData)
        if (onClose) onClose()
        else router.push("/transactions")
      }
    } catch (e) {
      console.error(e)
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
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-[#0D0D11] font-sans text-white selection:bg-[#2DE05F]/30 sm:px-6 md:min-h-full">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between px-4 pt-6 sm:px-0">
        <button
          type="button"
          onClick={() => onClose?.() || router.back()}
          className="p-1 text-[#2DE05F] transition-colors hover:text-green-400"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-[1.15rem] font-bold tracking-wide text-white">
          {initialData ? "Edit Transaction" : "New Transaction"}
        </h1>
        {initialData ? (
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1C22]/80 text-red-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="flex h-[28px] items-center justify-center gap-2 rounded-full bg-[#1C1C22] px-3">
            <span className="h-2 w-2 rounded-full bg-[#2DE05F] shadow-[0_0_8px_#2DE05F]"></span>
            <span className="text-[0.65rem] font-bold tracking-wider text-gray-400 uppercase">
              Live Sync
            </span>
          </div>
        )}
      </header>

      {/* Type Toggle */}
      <div className="mx-4 mb-8 flex w-full max-w-[340px] rounded-full bg-[#1A1A1F] p-[4px] sm:mx-auto">
        {(["expense", "income", "transfer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 rounded-full py-[10px] text-[0.85rem] font-bold capitalize transition-all ${
              type === t
                ? "bg-[#25252A] text-[#2DE05F] shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Display */}
      <div className="mb-5 flex flex-col items-center justify-center">
        <div className="flex items-start">
          <span className="mt-2 text-3xl font-bold text-[#2DE05F]">$</span>
          <span className="text-[4.5rem] leading-none font-bold tracking-tight text-white">
            {displayExpr}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-center">
          <Select
            value={accountId}
            onValueChange={(val) => {
              if (val) setAccountId(val)
            }}
          >
            <SelectTrigger className="flex h-[32px] w-auto items-center justify-center gap-2 rounded-lg border-0 bg-[#1A1A1F] px-4 shadow-none transition-transform outline-none hover:bg-[#202026] focus:ring-0 active:scale-[0.98] [&>svg]:hidden">
              <span className="text-[0.65rem] font-bold tracking-[0.1em] text-gray-400 uppercase">
                {accounts.find((a) => a.id === accountId)?.name ||
                  "Select Account"}
              </span>
            </SelectTrigger>
            <SelectContent className="border-[#202026] bg-[#16161A] text-white">
              {accounts.map((a) => (
                <SelectItem
                  key={a.id}
                  value={a.id}
                  className="cursor-pointer py-2.5 text-[14.5px] focus:bg-[#202026] focus:text-white"
                >
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-6 sm:px-0">
        {/* Row of 2 Selectors */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {/* Category */}
          <Select
            value={categoryId}
            onValueChange={(val) => {
              if (val) setCategoryId(val)
            }}
          >
            <SelectTrigger className="!flex !h-[65px] w-full !flex-col !items-center !justify-center gap-2 rounded-2xl border-0 bg-[#1A1A1F] shadow-none transition-transform outline-none hover:bg-[#202026] focus:ring-0 active:scale-[0.98] [&>svg]:hidden">
              <div className="flex flex-col items-center justify-center gap-2">
                {getCategoryIcon(
                  categories.find((c) => c.id === categoryId)?.name ||
                    "Category",
                  {
                    className: "size-[22px] text-[#2DE05F]",
                    strokeWidth: 2.5,
                  }
                )}
                <span className="text-[0.7rem] font-medium text-gray-300">
                  {categories.find((c) => c.id === categoryId)?.name ||
                    "Category"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="border-[#202026] bg-[#16161A] text-white">
              {availableCategories.length === 0 && (
                <SelectItem value="empty" disabled className="text-gray-500">
                  No categories
                </SelectItem>
              )}
              {availableCategories.map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id}
                  className="cursor-pointer py-2.5 text-[14.5px] focus:bg-[#202026] focus:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    {getCategoryIcon(c.name, {
                      className: "h-4 w-4 text-[#2DE05F]",
                      strokeWidth: 2.5,
                    })}
                    <span>{c.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Selector */}
          <div className="relative flex h-[65px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#1A1A1F] transition-transform hover:bg-[#202026] active:scale-[0.98]">
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 z-10 w-full appearance-none opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              required
            />
            <Calendar
              className="h-[22px] w-[22px] text-[#1DA1F2]"
              strokeWidth={2.5}
            />
            <span className="pointer-events-none text-[0.7rem] font-medium text-gray-300">
              {new Date(date).toDateString() === new Date().toDateString()
                ? "Today"
                : new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
            </span>
          </div>
        </div>

        {/* Note Input */}
        <div className="mb-5 flex w-full items-center justify-between rounded-2xl bg-[#1A1A1F] px-5 py-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a quick note..."
            className="flex-1 bg-transparent text-[0.9rem] text-white placeholder-gray-500 outline-none"
          />
          <FileEdit className="h-4 w-4 text-gray-400" />
        </div>

        {/* Expanded Keypad */}
        <div className="flex w-full flex-col gap-2">
          {/* Main Keypad Grid (4x4) */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: "7" },
              { key: "8" },
              { key: "9" },
              { key: "/", label: "÷", color: "text-[#2DE05F]" },
              { key: "4" },
              { key: "5" },
              { key: "6" },
              { key: "*", label: "×", color: "text-[#2DE05F]" },
              { key: "1" },
              { key: "2" },
              { key: "3" },
              { key: "-", color: "text-[#2DE05F]" },
              { key: "." },
              { key: "0" },
              { key: "delete", isIcon: true },
              { key: "+", color: "text-[#2DE05F]" },
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => handleKeypadPress(btn.key)}
                className="border-outline-white flex h-[50px] items-center justify-center rounded-[1rem] border border-white/10 bg-[#1A1A1F]/50 text-lg font-bold transition-all hover:bg-[#202026] active:bg-[#25252A]"
              >
                {btn.isIcon ? (
                  <Delete className="h-6 w-6 text-white" strokeWidth={2.5} />
                ) : (
                  <span className={btn.color || "text-white"}>
                    {btn.label || btn.key}
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Bottom Row */}
          <div className="mt-1 grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleKeypadPress("=")}
              className="flex h-[60px] items-center justify-center rounded-[1.1rem] bg-[#1A1A1F] transition-all hover:bg-[#202026] active:bg-[#25252A]"
            >
              <span className="text-[1.8rem] font-bold text-[#2DE05F]">=</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isNaN(currentVal) || currentVal <= 0}
              className="col-span-3 flex h-[60px] items-center justify-center gap-3 rounded-[1.1rem] bg-[#2DE05F] shadow-[0_8px_30px_rgba(45,224,95,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="text-[0.95rem] font-bold tracking-wide text-[#0D0D11]">
                {isLoading ? "SAVING..." : "SAVE TRANSACTION"}
              </span>
              <ArrowRight
                className="h-5 w-5 text-[#0D0D11]"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
