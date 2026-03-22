"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Info, Paperclip, Calendar, ChevronDown } from "lucide-react"
import { createTransaction } from "@/app/transactions/actions"

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
  const [amount, setAmount] = useState<string>(
    initialData?.amount.toString() || ""
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
  const [isRecurring, setIsRecurring] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  // Filter categories based on selected type
  const availableCategories = categories.filter((c) => c.type === type)

  const handleTypeChange = (newType: "expense" | "income" | "transfer") => {
    setType(newType)
    // Update category to match new type
    const newCat = categories.find((c) => c.type === newType)
    if (newCat) setCategoryId(newCat.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    if (initialData?.id) formData.append("id", initialData.id)
    formData.append("type", type)
    formData.append("amount", amount)
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(val)
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex h-full flex-col">
      {/* Header */}
      <header className="z-10 mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onClose?.() || router.back()}
          className="-ml-2 rounded-full p-2 text-foreground transition-colors hover:bg-surface-container"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase">
          {initialData ? "Edit Transaction" : "New Transaction"}
        </h1>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:text-foreground"
        >
          <Info className="h-4 w-4" />
        </button>
      </header>

      {/* Type Toggle */}
      <div className="mx-auto mb-10 flex w-full max-w-[320px] rounded-[1rem] border border-outline-variant bg-surface-container-low p-1">
        {(["expense", "income", "transfer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 rounded-[0.8rem] py-3 text-[0.65rem] font-bold tracking-wider uppercase transition-all ${
              type === t
                ? "border border-primary/30 bg-surface-container-high text-primary shadow-[0_4px_12px_rgba(92,253,128,0.1)]"
                : "text-on-surface-variant hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="mb-10 text-center">
        <p className="mb-4 label-sm tracking-widest text-on-surface-variant uppercase">
          Set Amount
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-light text-primary/80 sm:text-5xl">
            $
          </span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-[200px] bg-transparent text-center text-5xl font-light text-foreground outline-none placeholder:text-surface-container-highest sm:w-[250px] sm:text-6xl"
            required
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {/* Recipient / Merchant */}
        <div className="border-b border-surface-container-high pb-4">
          <label className="mb-2 block label-sm tracking-widest text-on-surface-variant uppercase">
            Recipient / Merchant
          </label>
          <input
            type="text"
            placeholder="e.g. Apple Store, Inc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-transparent text-lg font-medium text-foreground outline-none placeholder:text-surface-container-high"
            required
          />
        </div>

        {/* Date and Category Row */}
        <div className="flex gap-4 border-b border-surface-container-high pb-4">
          <div className="flex-1">
            <label className="mb-2 block label-sm tracking-widest text-on-surface-variant uppercase">
              Date & Time
            </label>
            <div className="flex items-center gap-2 text-lg text-foreground">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="custom-date-input w-full appearance-none bg-transparent font-medium text-foreground outline-none"
                required
              />
            </div>
          </div>
          <div className="flex-1 border-l border-surface-container-high pl-4">
            <label className="mb-2 block label-sm tracking-widest text-on-surface-variant uppercase">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none bg-transparent pr-8 text-lg font-medium text-foreground outline-none"
                required
              >
                {availableCategories.length === 0 && (
                  <option value="" className="bg-surface text-foreground">
                    No categories
                  </option>
                )}
                {availableCategories.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-surface text-foreground"
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            </div>
          </div>
        </div>

        {/* Source Account */}
        <div className="pt-2">
          <label className="mb-4 block label-sm tracking-widest text-on-surface-variant uppercase">
            Source Account
          </label>
          <div className="-mx-6 no-scrollbar flex snap-x gap-4 overflow-x-auto px-6 pb-4">
            {accounts.map((acc, idx) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setAccountId(acc.id)}
                className={`flex h-[100px] w-[160px] shrink-0 snap-start flex-col justify-between rounded-[1.2rem] border p-4 text-left transition-all ${
                  accountId === acc.id
                    ? "border-primary/40 bg-[#102a1b] shadow-[0_4px_20px_rgba(92,253,128,0.05)]"
                    : "border-outline-variant bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <span
                  className={`text-[0.65rem] font-bold tracking-widest uppercase ${
                    accountId === acc.id
                      ? "text-primary"
                      : "text-on-surface-variant"
                  }`}
                >
                  {acc.name}
                </span>
                <span className="text-lg font-medium tracking-tight">
                  {formatCurrency(acc.balance)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-2 mb-20 flex gap-4">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-surface-container-highest px-4 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Paperclip className="h-4 w-4" />
            <span className="text-[0.65rem] tracking-widest uppercase">
              Receipt
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`flex items-center gap-2 rounded-full border border-surface-container-highest px-4 py-2.5 text-sm font-bold transition-colors ${
              isRecurring
                ? "border-primary/40 bg-[#102a1b] text-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isRecurring
                  ? "bg-primary shadow-[0_0_8px_rgba(92,253,128,0.6)]"
                  : "bg-on-surface-variant"
              }`}
            />
            <span
              className={`text-[0.65rem] tracking-widest uppercase ${
                isRecurring ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              Recurring
            </span>
          </button>
        </div>
      </div>

      {/* Generic spacing to push button to bottom if screen is tall */}
      <div className="fixed right-6 bottom-6 left-6 z-50 mx-auto mt-auto max-w-md pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-[2rem] bg-primary py-5 text-sm font-bold tracking-widest text-primary-foreground uppercase shadow-[0_10px_30px_rgba(92,253,128,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
        >
          {isLoading
            ? "Processing..."
            : initialData
              ? "Update Transaction"
              : "Process Transaction"}
        </button>
      </div>

      <style jsx global>{`
        /* Hide scrollbar for account cards */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        /* Style date input to match native feel but hide default icon */
        .custom-date-input::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }
      `}</style>
    </form>
  )
}
