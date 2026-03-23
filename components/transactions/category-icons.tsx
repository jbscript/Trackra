import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  HeartPulse,
  Gift,
  Landmark,
  PiggyBank,
  DollarSign,
  Shapes,
  Clapperboard,
  BriefcaseBusiness,
  HousePlug,
  Banknote,
  BanknoteArrowDown,
  BanknoteArrowUp,
} from "lucide-react"

type IconComponent = typeof Utensils

const CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  // Income
  salary: DollarSign,
  "other income": Banknote,
  "money received": BanknoteArrowDown,

  // Expenses
  "debt payments": Landmark,
  "entertainment & subscriptions": Clapperboard,
  "family & gifts": Gift,
  food: Utensils,
  healthcare: HeartPulse,
  housing: Home,
  professional: BriefcaseBusiness,
  "shopping & personal care": ShoppingCart,
  transportation: Car,
  utilities: HousePlug,

  // Transfers
  investments: PiggyBank,
  "loans given": BanknoteArrowUp,
}

export function getCategoryIcon(categoryName: string): IconComponent {
  const key = categoryName.toLowerCase().trim()
  return CATEGORY_ICON_MAP[key] ?? Shapes
}
