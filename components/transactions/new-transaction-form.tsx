"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Info, Paperclip, Calendar, ChevronDown } from "lucide-react"
import { createTransaction } from "@/app/transactions/new/actions"

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

export function NewTransactionForm({
  accounts,
  categories,
}: {
  accounts: Account[]
  categories: Category[]
}) {
  const router = useRouter()
  const [type, setType] = useState<"expense" | "income" | "transfer">("expense")
  const [amount, setAmount] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [categoryId, setCategoryId] = useState<string>(
    categories.find((c) => c.type === type)?.id || categories[0]?.id || ""
  )
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "")
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
    formData.append("type", type)
    formData.append("amount", amount)
    formData.append("note", note)
    formData.append("date", date)
    formData.append("categoryId", categoryId)
    formData.append("accountId", accountId)

    try {
      await createTransaction(formData)
    } catch (error) {
      console.error("Failed to create transaction", error)
      setIsLoading(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full relative">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 text-foreground hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold tracking-widest uppercase">
          New Transaction
        </h1>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-foreground transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </header>

      {/* Type Toggle */}
      <div className="flex bg-surface-container-low rounded-[1rem] p-1 border border-outline-variant mb-10 mx-auto w-full max-w-[320px]">
        {(["expense", "income", "transfer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 py-3 text-[0.65rem] font-bold uppercase tracking-wider rounded-[0.8rem] transition-all ${
              type === t
                ? "bg-surface-container-high text-primary border border-primary/30 shadow-[0_4px_12px_rgba(92,253,128,0.1)]"
                : "text-on-surface-variant hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="text-center mb-10">
        <p className="label-sm text-on-surface-variant uppercase tracking-widest mb-4">
          Set Amount
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl sm:text-5xl font-light text-primary/80">$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent text-5xl sm:text-6xl font-light text-foreground text-center w-[200px] sm:w-[250px] outline-none placeholder:text-surface-container-highest"
            required
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {/* Recipient / Merchant */}
        <div className="border-b border-surface-container-high pb-4">
          <label className="label-sm text-on-surface-variant uppercase tracking-widest block mb-2">
            Recipient / Merchant
          </label>
          <input
            type="text"
            placeholder="e.g. Apple Store, Inc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-transparent text-lg text-foreground outline-none placeholder:text-surface-container-high font-medium"
            required
          />
        </div>

        {/* Date and Category Row */}
        <div className="flex gap-4 border-b border-surface-container-high pb-4">
          <div className="flex-1">
            <label className="label-sm text-on-surface-variant uppercase tracking-widest block mb-2">
              Date
            </label>
            <div className="flex items-center gap-2 text-lg text-foreground">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-foreground outline-none w-full appearance-none font-medium custom-date-input"
                required
              />
            </div>
          </div>
          <div className="flex-1 border-l border-surface-container-high pl-4">
            <label className="label-sm text-on-surface-variant uppercase tracking-widest block mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-transparent text-lg text-foreground outline-none appearance-none font-medium pr-8"
                required
              >
                {availableCategories.length === 0 && (
                  <option value="" className="bg-surface text-foreground">
                    No categories
                  </option>
                )}
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-surface text-foreground">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-on-surface-variant absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Source Account */}
        <div className="pt-2">
          <label className="label-sm text-on-surface-variant uppercase tracking-widest block mb-4">
            Source Account
          </label>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar -mx-6 px-6">
            {accounts.map((acc, idx) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setAccountId(acc.id)}
                className={`snap-start shrink-0 w-[160px] h-[100px] rounded-[1.2rem] p-4 flex flex-col justify-between text-left transition-all border ${
                  accountId === acc.id
                    ? "bg-[#102a1b] border-primary/40 shadow-[0_4px_20px_rgba(92,253,128,0.05)]"
                    : "bg-surface-container-low border-outline-variant hover:bg-surface-container"
                }`}
              >
                <span
                  className={`text-[0.65rem] font-bold uppercase tracking-widest ${
                    accountId === acc.id ? "text-primary" : "text-on-surface-variant"
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
        <div className="flex gap-4 mt-2 mb-20">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-surface-container-highest text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <Paperclip className="w-4 h-4" />
            <span className="uppercase text-[0.65rem] tracking-widest">Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border border-surface-container-highest text-sm font-bold transition-colors ${
              isRecurring
                ? "bg-[#102a1b] border-primary/40 text-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRecurring ? "bg-primary shadow-[0_0_8px_rgba(92,253,128,0.6)]" : "bg-on-surface-variant"
              }`}
            />
            <span
              className={`uppercase text-[0.65rem] tracking-widest ${
                isRecurring ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              Recurring
            </span>
          </button>
        </div>
      </div>

      {/* Generic spacing to push button to bottom if screen is tall */}
      <div className="mt-auto pt-6 fixed bottom-6 left-6 right-6 max-w-md mx-auto z-50">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-5 rounded-[2rem] bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase shadow-[0_10px_30px_rgba(92,253,128,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:hover:scale-100"
        >
          {isLoading ? "Processing..." : "Process Transaction"}
        </button>
      </div>
      
      <style jsx global>{`
        /* Hide scrollbar for account cards */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
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
