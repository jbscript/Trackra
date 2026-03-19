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

  const incomeCategories = categories.filter(c => c.type === "income");
  const expenseCategories = categories.filter(c => c.type === "expense");
  const transferCategories = categories.filter(c => c.type === "transfer");

  const transactions = [];
  
  // 4 months ago for 3+ months of data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 4);
  const now = new Date();

  // Generate around 200 transactions
  for (let i = 0; i < 200; i++) {
    const isIncome = Math.random() < 0.20; // 20% probability of income
    const isTransfer = !isIncome && Math.random() < 0.05; // 5% probability of transfer among non-incomes
    
    // Pick account
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    
    // Edge case: credit cards usually don't have large income like salary
    let _isIncome = isIncome;
    let _isTransfer = isTransfer;
    if (account.type === "credit_card") {
      if (_isIncome) {
        // limit income on credit cards to generic "Other Income" like cashback
        if (Math.random() < 0.05) _isIncome = true;
        else _isIncome = false;
      }
      if (_isTransfer) {
         // usually you don't do investments directly from credit card (or rarely)
         _isTransfer = false;
      }
    }

    const _isExpense = !_isIncome && !_isTransfer;

    const categoryList = _isIncome ? incomeCategories : (_isTransfer ? transferCategories : expenseCategories);
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    
    let amount = getRandomInt(100, 15000);
    
    // Edge cases for specific categories
    if (_isIncome && category.name === "Salary") {
      amount = getRandomInt(40000, 120000); 
    } else if (_isIncome && category.name === "Business") {
      amount = getRandomInt(15000, 50000);
    } else if (_isIncome && category.name === "Other Income") {
      amount = getRandomInt(100, 3000); 
    } else if (_isExpense && category.name === "Rent") {
      amount = getRandomInt(15000, 30000);
    } else if (_isExpense && category.name === "EMI") {
      amount = getRandomInt(5000, 20000);
    } else if (_isTransfer && category.name === "Investment") {
      amount = getRandomInt(5000, 50000); 
    }

    const transactionDate = getRandomDate(startDate, now);

    const expenseNotes = [
      "Weekend trip", "Amazon purchase", "Dinner with friends",
      "Grocery run", "Uber ride", "Movie tickets", "Pharmacy", 
      "Electricity bill", "Internet bill"
    ];
    
    const incomeNotes = [
      "Monthly Salary", "Freelance project", "Credit card reward", "Reimbursement"
    ];

    const transferNotes = [
      "Monthly SIP", "Stock purchase", "Gold fund", "Crypto investment"
    ];

    transactions.push({
      accountId: account.id,
      categoryId: category.id,
      amount,
      type: _isIncome ? "income" : (_isTransfer ? "transfer" : "expense"),
      note: _isIncome 
        ? incomeNotes[Math.floor(Math.random() * incomeNotes.length)]
        : (_isTransfer ? transferNotes[Math.floor(Math.random() * transferNotes.length)] : expenseNotes[Math.floor(Math.random() * expenseNotes.length)]),
      transactionDate,
    });
  }

  // Sort by date purely to insert sequentially
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
