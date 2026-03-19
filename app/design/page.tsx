import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BottomNav, BottomNavItem } from "@/components/ui/bottom-nav"
import { PulseChip } from "@/components/ui/pulse-chip"
import { Home, Wallet, PieChart, Info, ArrowUpRight } from "lucide-react"

export default function DesignSystemPlayground() {
  return (
    <div className="min-h-screen space-y-12 p-8 pb-32">
      <header className="space-y-4">
        <h1 className="display-lg text-primary">The Obsidian Vault</h1>
        <p className="headline-md">
          Financial Atelier Design System Playground
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="headline-md">Buttons & Chips</h2>
        <div className="flex flex-wrap items-center gap-6 rounded-[1.5rem] bg-[var(--surface-container-low)] p-8">
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary ghost</Button>
          <Button className="shrink-0">
            <ArrowUpRight className="size-6 text-primary-foreground" />
          </Button>
          <PulseChip active>Live Data</PulseChip>
          <PulseChip active={false}>Synced 1m ago</PulseChip>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="headline-md">Cards: Wealth Containers</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>Liquid Assets</CardTitle>
                  <CardDescription>Available for deployment</CardDescription>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Wallet className="size-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="display-lg">
                $142,500
                <span className="text-3xl text-muted-foreground">.00</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button className="w-full">Deposit</Button>
              <Button variant="secondary" className="w-[80px]">
                ...
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Allocation</CardTitle>
              <CardDescription>
                Target a specific portfolio sector
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="label-sm text-foreground">Sector Name</label>
                <Input placeholder="E.g., Tech Equities" />
              </div>
              <div className="space-y-2">
                <label className="label-sm text-foreground">Amount ($)</label>
                <Input type="number" placeholder="0.00" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Commit Capital</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <BottomNav>
        <BottomNavItem icon={<Home className="size-6" />} active />
        <BottomNavItem icon={<PieChart className="size-6" />} />
        <BottomNavItem icon={<Wallet className="size-6" />} />
        <BottomNavItem icon={<Info className="size-6" />} />
      </BottomNav>
    </div>
  )
}
