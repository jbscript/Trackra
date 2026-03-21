import fs from "fs"
import path from "path"
import { db } from "@/lib/db"

// Date generator relocated to main()

async function main() {
  await db.transaction.deleteMany()
  await db.category.deleteMany()
  // Keep accounts or recreate them if deleted earlier
  await db.account.deleteMany()

  const accountsData = [
    { name: "Jabis ICICI Debit", type: "savings" },
    { name: "Jabis ICICI Credit", type: "credit_card" },
    { name: "Jabis Federal Bank", type: "savings" },
    { name: "Rounas HDFC Debit", type: "savings" },
    { name: "Rounas HDFC Credit", type: "credit_card" },
  ]

  const accounts = await Promise.all(
    accountsData.map((acc) => db.account.create({ data: acc }))
  )

  const dataPath = path.join(process.cwd(), "public/transactions.json")
  const rawData = fs.readFileSync(dataPath, "utf-8")
  const parsedData = JSON.parse(rawData)

  const { categories: rawCategories, transactions: rawTransactions } =
    parsedData

  const categories = await Promise.all(
    rawCategories.map((cat: any) =>
      db.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          description: cat.description,
        },
      })
    )
  )

  function pickAccount(note: string) {
    const lowerNote = (note || "").toLowerCase()
    if (lowerNote.includes("jb ") || lowerNote.includes("jabir")) {
      return accounts.find((a) => a.name === "Jabis ICICI Debit")!
    }
    if (lowerNote.includes("rb ") || lowerNote.includes("rouna")) {
      return accounts.find((a) => a.name === "Rounas HDFC Debit")!
    }
    // Random fallback logic with some intelligent guesses
    if (
      lowerNote.includes("rent") ||
      lowerNote.includes("emi") ||
      lowerNote.includes("investment")
    ) {
      return accounts.find((a) => a.name === "Jabis ICICI Debit")!
    }
    // Shopping, dining use credit card sometimes
    if (Math.random() < 0.5) {
      return accounts.find((a) => a.name === "Jabis ICICI Credit")!
    }
    return accounts.find((a) => a.name === "Jabis ICICI Debit")!
  }

  const monthCounts: Record<string, number> = {}
  for (const t of rawTransactions) {
    const monthName = t.month
    monthCounts[monthName] = (monthCounts[monthName] || 0) + 1
  }

  const monthState: Record<string, { current: Date; stepMs: number }> = {}
  const now = new Date()

  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }

  function getStrictSequentialDate(year: number, monthName: string) {
    const month = monthMap[monthName]
    if (month === undefined) return new Date()

    if (!monthState[monthName]) {
      const startOfMonth = new Date(year, month, 1, 8, 0, 0)
      let endOfMonth = new Date(year, month + 1, 0, 20, 0, 0)

      if (year === now.getFullYear() && month === now.getMonth()) {
        endOfMonth = now
      } else if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())) {
        endOfMonth = new Date(year, month, 1, 8, 0, 0)
      }

      const totalMs = Math.max(0, endOfMonth.getTime() - startOfMonth.getTime())
      const count = monthCounts[monthName] || 1
      const stepMs = totalMs / count

      monthState[monthName] = { current: startOfMonth, stepMs }
    }

    const state = monthState[monthName]
    const date = new Date(state.current.getTime())
    state.current = new Date(state.current.getTime() + state.stepMs)
    
    return date
  }

  const insertData = rawTransactions.map((t: any) => {
    // Categories matched by name
    const categoryNameInput = (t.category_name || t.category || "")
      .trim()
      .toLowerCase()

    // Some fuzzy matching due to case differences in category names
    const category = categories.find(
      (c) => c.name.toLowerCase() === categoryNameInput
    )
    if (!category) {
      console.warn(`Category not found for name: "${t.category_name}"`)
    }

    const account = pickAccount(t.note)

    let parsedAmount = parseFloat(t.amount)
    if (isNaN(parsedAmount)) {
      // In case amount comes as a string with currency symbol
      parsedAmount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""))
    }

    return {
      accountId: account.id,
      categoryId: category ? category.id : categories[0].id, // fallback if not found
      amount: parsedAmount,
      type: t.type.toLowerCase(),
      note: t.note,
      transactionDate: getStrictSequentialDate(2026, t.month),
    }
  })

  // Insert sequentially
  for (const t of insertData) {
    await db.transaction.create({ data: t })
  }

  console.log(
    `Database seeded successfully with ${insertData.length} transactions from JSON!`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
