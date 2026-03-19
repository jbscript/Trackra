import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({ url: "file:./db/dev.db" })
const prisma = new PrismaClient({ adapter })

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

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
    { name: "Salary", type: "income" },
    { name: "Freelance", type: "income" },
    { name: "Cashback", type: "income" },
    { name: "Groceries", type: "expense" },
    { name: "Rent", type: "expense" },
    { name: "Utilities", type: "expense" },
    { name: "Dining Out", type: "expense" },
    { name: "Investment", type: "expense" },
    { name: "Entertainment", type: "expense" },
    { name: "Shopping", type: "expense" },
    { name: "Healthcare", type: "expense" },
  ];

  const accounts = await Promise.all(
    accountsData.map(acc => prisma.account.create({ data: acc }))
  );

  const categories = await Promise.all(
    categoriesData.map(cat => prisma.category.create({ data: cat }))
  );

  const incomeCategories = categories.filter(c => c.type === "income");
  const expenseCategories = categories.filter(c => c.type === "expense");

  const transactions = [];
  
  // 4 months ago for 3+ months of data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 4);
  const now = new Date();

  // Generate around 200 transactions
  for (let i = 0; i < 200; i++) {
    const isIncome = Math.random() < 0.20; // 20% probability of income
    
    // Pick account
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    
    // Edge case: credit cards usually don't have large income like salary, mostly it's cashback or payment.
    let _isIncome = isIncome;
    if (account.type === "credit_card" && isIncome) {
      // 5% chance of getting a cashback on credit card, otherwise force expense
      if (Math.random() < 0.05) {
        _isIncome = true;
      } else {
        _isIncome = false;
      }
    }

    const categoryList = _isIncome ? incomeCategories : expenseCategories;
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    
    let amount = getRandomInt(100, 15000);
    
    // Edge cases for specific categories
    if (_isIncome && category.name === "Salary") {
      amount = getRandomInt(40000, 120000); // larger amounts for Salary
    } else if (_isIncome && category.name === "Cashback") {
      amount = getRandomInt(10, 500); // smaller amounts for Cashback
    } else if (!_isIncome && category.name === "Rent") {
      amount = getRandomInt(15000, 30000); // Fixed range for rent
    } else if (!_isIncome && category.name === "Investment") {
      amount = getRandomInt(5000, 50000); // Investments are usually bigger lumpsums or SIPs
    }

    const transactionDate = getRandomDate(startDate, now);

    const expenseNotes = [
      "Weekend trip", "Amazon purchase", "Dinner with friends",
      "Grocery run", "Uber ride", "Movie tickets", "Pharmacy", 
      "Monthly SIP", "Stock purchase", "Electricity bill", "Internet bill"
    ];
    
    const incomeNotes = [
      "Monthly Salary", "Freelance project", "Credit card reward", "Reimbursement"
    ];

    transactions.push({
      accountId: account.id,
      categoryId: category.id,
      amount,
      type: _isIncome ? "income" : "expense",
      note: _isIncome 
        ? incomeNotes[Math.floor(Math.random() * incomeNotes.length)]
        : expenseNotes[Math.floor(Math.random() * expenseNotes.length)],
      transactionDate,
    });
  }

  // Sort by date inside seed purely to insert sequentially, though it's optional
  transactions.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());

  // Insert sequentially because SQLite better-sqlite3 handles them fast anyway
  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }

  console.log(`Database seeded successfully with ${transactions.length} transactions across 3+ months!`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
