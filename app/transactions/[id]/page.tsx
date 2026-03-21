import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Utensils,
  Coffee,
  ShoppingBag,
  Car,
  Banknote,
  ArrowRightLeft,
  MapPin,
  Trash2
} from "lucide-react"
import { deleteTransaction } from "./actions"

export default async function TransactionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const transaction = await db.transaction.findUnique({
    where: { id },
    include: {
      account: true,
      category: true,
    },
  })

  if (!transaction) {
    notFound()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getIconForCategory = (categoryName: string, type: string) => {
    const name = categoryName.toLowerCase()
    const baseClass = "w-10 h-10"
    
    if (type === "income") return <Banknote className={`${baseClass} text-primary`} />
    if (name.includes("food") || name.includes("coffee") || name.includes("dining")) return <Utensils className={`${baseClass} text-primary`} />
    if (name.includes("shop") || name.includes("tech")) return <ShoppingBag className={`${baseClass} text-primary`} />
    if (name.includes("transport") || name.includes("auto") || name.includes("uber")) return <Car className={`${baseClass} text-primary`} />
    
    return <ArrowRightLeft className={`${baseClass} text-primary`} />
  }

  const formatDateTime = (date: Date) => {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
    
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
    
    return `${formattedDate} • ${formattedTime}`
  }

  // Delete Server Action binding
  const deleteTxAction = deleteTransaction.bind(null, transaction.id)

  return (
    <div className="relative min-h-screen bg-background pb-12 text-foreground font-sans selection:bg-primary/30">
      <main className="container mx-auto max-w-md p-6 pt-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <Link href="/transactions" className="flex items-center gap-1 text-primary hover:text-primary-container transition-colors py-2 -ml-2">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">Details</span>
          </Link>
          <button className="text-sm font-bold text-primary hover:text-primary-container transition-colors py-2">
            Edit
          </button>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-24 h-24 rounded-full bg-surface-container shadow-[0_0_40px_rgba(92,253,128,0.1)] flex items-center justify-center mb-6 border border-primary/20">
            {getIconForCategory(transaction.category.name, transaction.type)}
          </div>
          <h1 className="text-6xl font-black tracking-tight text-foreground mb-3">
            {formatCurrency(transaction.amount)}
          </h1>
          <p className="text-lg text-on-surface-variant">
            {transaction.note || transaction.category.name}
          </p>
        </div>

        {/* Details Cards */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface-container-low border border-outline-variant p-5 rounded-[1.2rem]">
            <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
              Date & Time
            </p>
            <p className="text-base font-bold text-foreground">
              {formatDateTime(transaction.transactionDate)}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-surface-container-low border border-outline-variant p-5 rounded-[1.2rem]">
              <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Category
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(92,253,128,0.6)]"></span>
                <p className="text-base font-bold text-foreground truncate">
                  {transaction.category.name}
                </p>
              </div>
            </div>
            <div className="flex-1 bg-surface-container-low border border-outline-variant p-5 rounded-[1.2rem]">
              <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                Source
              </p>
              <p className="text-base font-bold text-foreground truncate">
                {transaction.account.name}
              </p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-[120px] rounded-[1.2rem] overflow-hidden border border-outline-variant group">
            <div className="absolute inset-0 bg-[#131313] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none"></div>
            
            {/* Visual map route simulation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-primary/20 rounded-full flex items-center justify-center opacity-70">
              <div className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(92,253,128,0.8)]"></div>
              </div>
            </div>

            <div className="absolute bottom-3 left-4 flex items-center gap-2 z-10">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground font-medium drop-shadow-md">
                Location Details Hidden
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-surface-container-low border border-outline-variant p-5 rounded-[1.2rem] flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <p className="text-[0.65rem] uppercase tracking-widest text-on-surface-variant font-bold">
                Notes
              </p>
              <div className="flex items-center gap-1.5 bg-[#102a1b] border border-primary/20 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(92,253,128,0.6)]"></span>
                <span className="text-[0.55rem] font-bold text-primary uppercase tracking-widest">
                  Cleared by Bank
                </span>
              </div>
            </div>
            <p className="text-sm italic text-foreground leading-relaxed">
              "{transaction.note ? transaction.note : 'No extra notes provided. Transaction processed successfully.'}"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button className="w-full py-4 rounded-[2rem] bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase shadow-[0_8px_24px_rgba(92,253,128,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
            Generate Receipt PDF
          </button>
          
          <form action={deleteTxAction}>
            <button 
              type="submit"
              className="w-full py-4 flex items-center justify-center gap-2 rounded-[2rem] border border-transparent hover:border-destructive/30 text-destructive font-bold text-sm tracking-widest uppercase transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Transaction
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
