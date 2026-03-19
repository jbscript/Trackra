import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({ url: "file:./db/dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.transaction.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()

  const accountsData = [
    { name: "Jabis ICICI Debit", type: "savings" },
    { name: "Jabis ICICI Credit", type: "credit_card" },
    { name: "Jabis Federal Bank", type: "savings" },
    { name: "Rounas HDFC Debit", type: "savings" },
    { name: "Rounas HDFC Credit", type: "credit_card" },
  ];

  const categoriesData = [
    { name: "Salary", type: "income", description: "Monthly salary, bonuses, or employer payments" },
    { name: "Business", type: "income", description: "Freelance, side projects, or business income" },
    { name: "Other Income", type: "income", description: "Interest, refunds, asset sales, unexpected money" },
    { name: "Rent", type: "expense", description: "House rent or lease payments only" },
    { name: "Utilities", type: "expense", description: "Electricity, water, mobile recharge, internet, gas" },
    { name: "Groceries", type: "expense", description: "Food items bought for home cooking (Lulu, Zepto, Blinkit)" },
    { name: "Insurance", type: "expense", description: "Health, life, vehicle insurance premiums" },
    { name: "EMI", type: "expense", description: "Loan repayments, credit EMIs, gold loans" },
    { name: "Dining", type: "expense", description: "Eating outside, Swiggy, Zomato, cafes, snacks, tea" },
    { name: "Transport", type: "expense", description: "Petrol, Uber, train, bus, parking, tolls" },
    { name: "Shopping", type: "expense", description: "Clothes, gadgets, home items, random purchases (non-essential)" },
    { name: "Entertainment", type: "expense", description: "Movies, subscriptions (YouTube, Netflix), outings" },
    { name: "Personal Care", type: "expense", description: "Haircuts, grooming, cosmetics, salon" },
    { name: "Family Support", type: "expense", description: "Money given to parents, relatives, household support" },
    { name: "Gifts", type: "expense", description: "Gifts for others, celebrations, special occasions" },
    { name: "Investment", type: "transfer", description: "Money moved into stocks, mutual funds, gold, crypto (not an expense)" },
    { name: "Taxes", type: "expense", description: "Income tax, property tax, government payments" },
    { name: "Misc", type: "expense", description: "Use only if nothing else fits (should be <5% of transactions)" }
  ];

  const accounts = await Promise.all(
    accountsData.map(acc => prisma.account.create({ data: acc }))
  );

  const categories = await Promise.all(
    categoriesData.map(cat => prisma.category.create({ data: cat }))
  );

  const rawTransactions = [
    { "date": "2026-01-01", "type": "income", "category": "Salary", "amount": 87465, "note": "jb salary" },
    { "date": "2026-01-02", "type": "income", "category": "Salary", "amount": 65371, "note": "rb salary" },
    { "date": "2026-01-03", "type": "expense", "category": "Dining", "amount": 278, "note": "rb food" },
    { "date": "2026-01-04", "type": "expense", "category": "Dining", "amount": 472, "note": "jb food" },
    { "date": "2026-01-05", "type": "expense", "category": "Dining", "amount": 249, "note": "cake" },
    { "date": "2026-01-06", "type": "expense", "category": "Rent", "amount": 23000, "note": "rent" },
    { "date": "2026-01-07", "type": "transfer", "category": "Investment", "amount": 10000, "note": "mf investment" },
    { "date": "2026-01-08", "type": "expense", "category": "Dining", "amount": 135, "note": "tea" },
    { "date": "2026-01-09", "type": "expense", "category": "Transport", "amount": 200, "note": "petrol" },
    { "date": "2026-01-10", "type": "expense", "category": "Groceries", "amount": 399, "note": "lulu" },
    { "date": "2026-01-11", "type": "expense", "category": "Gifts", "amount": 6990, "note": "gift" },
    { "date": "2026-01-12", "type": "expense", "category": "Transport", "amount": 10, "note": "parking" },
    { "date": "2026-01-13", "type": "expense", "category": "Shopping", "amount": 340, "note": "miniso" },
    { "date": "2026-01-14", "type": "expense", "category": "Dining", "amount": 456, "note": "chaya pidiya" },
    { "date": "2026-01-15", "type": "expense", "category": "Groceries", "amount": 148, "note": "blinkit" },
    { "date": "2026-01-16", "type": "expense", "category": "Dining", "amount": 136, "note": "swiggy" },
    { "date": "2026-01-17", "type": "expense", "category": "Dining", "amount": 734, "note": "burger" },
    { "date": "2026-01-18", "type": "expense", "category": "Shopping", "amount": 950, "note": "slippers" },
    { "date": "2026-01-19", "type": "expense", "category": "Gifts", "amount": 720, "note": "flowers" },
    { "date": "2026-01-20", "type": "expense", "category": "Dining", "amount": 650, "note": "cake" },
    { "date": "2026-01-21", "type": "expense", "category": "Insurance", "amount": 16959, "note": "health insurance" },
    { "date": "2026-01-22", "type": "expense", "category": "EMI", "amount": 10000, "note": "loan" },
    { "date": "2026-01-23", "type": "expense", "category": "EMI", "amount": 3500, "note": "gold emi" },
    { "date": "2026-01-24", "type": "expense", "category": "Utilities", "amount": 299, "note": "mobile recharge" },
    { "date": "2026-01-25", "type": "expense", "category": "Utilities", "amount": 474, "note": "electricity" },
    { "date": "2026-01-26", "type": "expense", "category": "Utilities", "amount": 1053, "note": "electricity" },
    { "date": "2026-01-27", "type": "expense", "category": "Entertainment", "amount": 487, "note": "movie" },
    { "date": "2026-01-28", "type": "expense", "category": "Personal Care", "amount": 350, "note": "haircut" },
    { "date": "2026-01-29", "type": "expense", "category": "Family Support", "amount": 5000, "note": "home support" },
    { "date": "2026-01-30", "type": "transfer", "category": "Investment", "amount": 113500, "note": "multiple investments aggregated" },
    { "date": "2026-01-31", "type": "income", "category": "Other Income", "amount": 7300, "note": "debt sell" },
    { "date": "2026-02-01", "type": "income", "category": "Salary", "amount": 83200, "note": "jb salary" },
    { "date": "2026-02-02", "type": "income", "category": "Salary", "amount": 65979, "note": "rb salary" },
    { "date": "2026-02-03", "type": "transfer", "category": "Investment", "amount": 30000, "note": "investment" },
    { "date": "2026-02-04", "type": "expense", "category": "Rent", "amount": 23000, "note": "rent" },
    { "date": "2026-02-05", "type": "expense", "category": "Groceries", "amount": 2091, "note": "instamart" },
    { "date": "2026-02-06", "type": "expense", "category": "Dining", "amount": 998, "note": "restaurant" },
    { "date": "2026-02-07", "type": "expense", "category": "Shopping", "amount": 1075, "note": "electronics" },
    { "date": "2026-02-08", "type": "expense", "category": "Utilities", "amount": 707, "note": "wifi" },
    { "date": "2026-02-09", "type": "expense", "category": "EMI", "amount": 10000, "note": "loan" },
    { "date": "2026-02-10", "type": "expense", "category": "Family Support", "amount": 10000, "note": "home" },
    { "date": "2026-02-11", "type": "expense", "category": "Entertainment", "amount": 541, "note": "movie" },
    { "date": "2026-02-12", "type": "expense", "category": "Personal Care", "amount": 350, "note": "haircut" },
    { "date": "2026-02-13", "type": "transfer", "category": "Investment", "amount": 10030, "note": "nifty + gold" },
    { "date": "2026-03-01", "type": "income", "category": "Salary", "amount": 83200, "note": "jb salary" },
    { "date": "2026-03-02", "type": "income", "category": "Salary", "amount": 80410, "note": "rb salary" },
    { "date": "2026-03-03", "type": "expense", "category": "Rent", "amount": 23000, "note": "rent" },
    { "date": "2026-03-04", "type": "expense", "category": "Groceries", "amount": 248, "note": "market" },
    { "date": "2026-03-05", "type": "expense", "category": "Dining", "amount": 328, "note": "swiggy" },
    { "date": "2026-03-06", "type": "expense", "category": "Dining", "amount": 687, "note": "restaurant" },
    { "date": "2026-03-07", "type": "expense", "category": "Entertainment", "amount": 195, "note": "youtube" },
    { "date": "2026-03-08", "type": "expense", "category": "Family Support", "amount": 10000, "note": "home" },
    { "date": "2026-03-09", "type": "expense", "category": "Shopping", "amount": 2624, "note": "dress" },
    { "date": "2026-03-10", "type": "expense", "category": "Utilities", "amount": 299, "note": "recharge" },
    { "date": "2026-03-11", "type": "expense", "category": "Transport", "amount": 230, "note": "uber" },
    { "date": "2026-03-12", "type": "expense", "category": "Personal Care", "amount": 350, "note": "haircut" },
    { "date": "2026-03-13", "type": "transfer", "category": "Investment", "amount": 25000, "note": "mutual fund + stocks" },
    { "date": "2026-03-14", "type": "income", "category": "Other Income", "amount": 4233, "note": "other" }
  ];

  function pickAccount(note: string) {
    const lowerNote = note.toLowerCase();
    if (lowerNote.includes("jb ")) {
      return accounts.find(a => a.name === "Jabis ICICI Debit")!;
    }
    if (lowerNote.includes("rb ")) {
      return accounts.find(a => a.name === "Rounas HDFC Debit")!;
    }
    // Random fallback logic with some intelligent guesses
    if (lowerNote.includes("rent") || lowerNote.includes("emi") || lowerNote.includes("investment")) {
       return accounts.find(a => a.name === "Jabis ICICI Debit")!; // Typically debit
    }
    // Shopping, dining use credit card sometimes
    if (Math.random() < 0.5) {
       return accounts.find(a => a.name === "Jabis ICICI Credit")!;
    }
    return accounts.find(a => a.name === "Jabis ICICI Debit")!;
  }

  const insertData = rawTransactions.map(t => {
    const category = categories.find(c => c.name === t.category);
    if (!category) throw new Error(`Category ${t.category} not found!`);
    
    const account = pickAccount(t.note);

    return {
      accountId: account.id,
      categoryId: category.id,
      amount: t.amount,
      type: t.type,
      note: t.note,
      transactionDate: new Date(t.date)
    };
  });

  for (const t of insertData) {
    await prisma.transaction.create({ data: t });
  }

  console.log(`Database seeded successfully with ${insertData.length} exact user transactions!`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
