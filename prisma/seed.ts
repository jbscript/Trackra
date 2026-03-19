import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({ url: "file:./db/dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.transaction.deleteMany()
  await prisma.account.deleteMany()
  await prisma.category.deleteMany()

  const account1 = await prisma.account.create({
    data: { name: "HDFC", type: "savings" },
  })
  const account2 = await prisma.account.create({
    data: { name: "Cash", type: "cash" },
  })

  const catIncome = await prisma.category.create({
    data: { name: "Salary", type: "income" },
  })
  const catGrocery = await prisma.category.create({
    data: { name: "Groceries", type: "expense" },
  })
  const catRent = await prisma.category.create({
    data: { name: "Rent", type: "expense" },
  })

  await prisma.transaction.create({
    data: {
      accountId: account1.id,
      categoryId: catIncome.id,
      amount: 50000,
      type: "income",
      note: "Monthly Salary",
      transactionDate: new Date(),
    },
  })

  await prisma.transaction.create({
    data: {
      accountId: account1.id,
      categoryId: catRent.id,
      amount: 15000,
      type: "expense",
      note: "Apartment Rent",
      transactionDate: new Date(),
    },
  })

  await prisma.transaction.create({
    data: {
      accountId: account2.id,
      categoryId: catGrocery.id,
      amount: 2500,
      type: "expense",
      note: "Weekly groceries",
      transactionDate: new Date(),
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
