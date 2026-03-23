import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Monitor,
  HeartPulse,
  Briefcase,
  Coffee,
  Plane,
  Gift,
  Landmark,
  PiggyBank,
  DollarSign,
  Shapes,
  ArrowRightLeft,
  Zap
} from "lucide-react"

export function getCategoryIcon(categoryName: string) {
  const n = categoryName.toLowerCase()
  if (n.includes('food') || n.includes('eat') || n.includes('dining')) return Utensils
  if (n.includes('shopping') || n.includes('store') || n.includes('market') || n.includes('buy')) return ShoppingCart
  if (n.includes('transport') || n.includes('car') || n.includes('gas') || n.includes('fuel') || n.includes('travel') || n.includes('cab')) return Car
  if (n.includes('home') || n.includes('rent') || n.includes('mortgage') || n.includes('house')) return Home
  if (n.includes('tech') || n.includes('electronics') || n.includes('software')) return Monitor
  if (n.includes('health') || n.includes('medical') || n.includes('pharmacy') || n.includes('doctor')) return HeartPulse
  if (n.includes('work') || n.includes('salary') || n.includes('wages') || n.includes('job') || n.includes('income')) return Briefcase
  if (n.includes('coffee') || n.includes('cafe')) return Coffee
  if (n.includes('flight') || n.includes('hotel') || n.includes('holiday')) return Plane
  if (n.includes('gift') || n.includes('present') || n.includes('family')) return Gift
  if (n.includes('bank') || n.includes('finance') || n.includes('fee') || n.includes('tax')) return Landmark
  if (n.includes('savings') || n.includes('investment')) return PiggyBank
  if (n.includes('bonus') || n.includes('cash')) return DollarSign
  if (n.includes('utilit') || n.includes('bill') || n.includes('water') || n.includes('electric')) return Zap
  if (n.includes('transfer')) return ArrowRightLeft
  
  return Shapes
}
