import fs from "fs"
import path from "path"
import { db } from "@/lib/db"

function getRandomDateInMonth(year: number, monthName: string) {
  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  }
  const month = monthMap[monthName]
  if (month === undefined) return new Date()

  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

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
      transactionDate: getRandomDateInMonth(2026, t.month),
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
