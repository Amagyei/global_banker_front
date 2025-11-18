import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, DollarSign, Users, Wallet, ShoppingBag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWallet, getTransactions, getBanks } from "@/lib/api";
import { Link } from "react-router-dom";

// Generate a seeded random number (0-1) based on date and seed
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate daily sales between $35k-$50k based on date
const getDailySales = (): string => {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const random = seededRandom(dateSeed);
  const sales = 35000 + random * 15000; // $35k to $50k
  return `$${Math.round(sales).toLocaleString()}`;
};

// Generate popular categories with gradual daily changes
const getPopularCategories = (banks: any[], previousData?: { date: string; percentages: Record<string, number> }) => {
  if (!banks || banks.length === 0) {
    return [];
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Check if previous data is from yesterday (exactly 1 day ago)
  let isFromYesterday = false;
  if (previousData && previousData.date !== todayStr) {
    const prevDate = new Date(previousData.date);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Check if previous date is yesterday (same year, month, day)
    isFromYesterday = prevDate.getFullYear() === yesterday.getFullYear() &&
                      prevDate.getMonth() === yesterday.getMonth() &&
                      prevDate.getDate() === yesterday.getDate();
  }
  
  // Select 4 random banks as categories (seeded by date for consistency)
  const selectedBanks = [...banks]
    .sort((a, b) => {
      // Use seeded random to shuffle consistently
      const seedA = dateSeed + a.name.charCodeAt(0);
      const seedB = dateSeed + b.name.charCodeAt(0);
      return seededRandom(seedA) - seededRandom(seedB);
    })
    .slice(0, 4);

  // Generate percentages that change gradually from previous day
  const categories = selectedBanks.map((bank, index) => {
    const bankName = bank.name;
    let percentage: number;

    if (isFromYesterday && previousData!.percentages[bankName] !== undefined) {
      // Change by ±10% from previous day (gradual change)
      const change = (seededRandom(dateSeed + index) - 0.5) * 20; // -10% to +10%
      percentage = Math.max(10, Math.min(90, previousData!.percentages[bankName] + change));
    } else {
      // First time or new bank: generate initial percentage (40-85%)
      percentage = 40 + seededRandom(dateSeed + index) * 45;
    }

    return {
      name: bankName,
      percentage: Math.round(percentage),
    };
  });

  // Sort by percentage descending
  categories.sort((a, b) => b.percentage - a.percentage);

  // Store for next day (in localStorage with date)
  const dataToStore = {
    date: todayStr,
    percentages: {} as Record<string, number>
  };
  categories.forEach(cat => {
    dataToStore.percentages[cat.name] = cat.percentage;
  });
  localStorage.setItem('dashboard_categories', JSON.stringify(dataToStore));

  return categories;
};

const Dashboard = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionsData, banksData] = await Promise.all([
        getWallet(),
        getTransactions({ ordering: "-created_at" }),
        getBanks({ is_active: true }),
      ]);
      setWallet(walletData);
      // Handle paginated response (results array) or direct array
      const transactions = transactionsData.results || transactionsData || [];
      // Limit to 4 most recent transactions
      setRecentTransactions(Array.isArray(transactions) ? transactions.slice(0, 4) : []);
      
      // Get banks for categories
      const banksList = banksData.results || banksData || [];
      setBanks(Array.isArray(banksList) ? banksList : []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get previous day's data from localStorage
  const previousData = useMemo(() => {
    try {
      const stored = localStorage.getItem('dashboard_categories');
      if (stored) {
        const data = JSON.parse(stored);
        // Return if it has the expected structure
        if (data.date && data.percentages) {
          return data;
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, []);

  // Generate daily sales
  const dailySales = useMemo(() => getDailySales(), []);

  // Generate popular categories
  const popularCategories = useMemo(() => {
    return getPopularCategories(banks, previousData);
  }, [banks, previousData]);

  const userStats = [
    {
      title: "My Balance",
      value: loading ? "Loading..." : (wallet?.balance || "$0.00"),
      change: "Available to spend",
      icon: Wallet,
      color: wallet && wallet.balance_minor === 0 ? "text-destructive" : "text-success",
    },
    {
      title: "Available Banks",
      value: banks.length.toString(),
      change: "Across all markets",
      icon: Gift,
      color: "text-primary",
    },
    {
      title: "Recent Purchases",
      value: recentTransactions.filter(t => t.direction === 'debit').length.toString(),
      change: "This month",
      icon: ShoppingBag,
      color: "text-secondary",
    },
  ];

  const platformStats = [
    {
      title: "Total Sales",
      value: dailySales,
      change: "+20.1%",
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Active Banks",
      value: "2,350",
      change: "+15.3%",
      icon: CreditCard,
      color: "text-primary",
    },
    {
      title: "Customers",
      value: "1,234",
      change: "+12.5%",
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Growth",
      value: "+18.2%",
      change: "This month",
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview</p>
      </div>

      {/* User-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {userStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden shadow-card hover:shadow-hover transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platformStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden shadow-card hover:shadow-hover transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
            <CardDescription>Best selling bank types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading categories...</div>
              ) : popularCategories.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No categories available</div>
              ) : (
                popularCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-primary transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading recent activity...</div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No recent transactions</div>
              ) : (
                recentTransactions.map((transaction) => {
                  const isCredit = transaction.direction === "credit";
                  const amount = transaction.amount || "$0.00";
                  const timeAgo = transaction.created_at 
                    ? new Date(transaction.created_at).toLocaleString()
                    : "Recently";
                  
                  return (
                    <div key={transaction.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${isCredit ? "bg-success" : "bg-primary"}`} />
                  <div className="flex-1">
                        <p className="font-medium text-sm">{transaction.description || "Transaction"}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                      <span className={`font-semibold ${isCredit ? "text-success" : "text-foreground"}`}>
                        {isCredit ? "+" : "-"}{amount}
                      </span>
                </div>
                  );
                })
              )}
            </div>
            {recentTransactions.length > 0 && (
              <div className="mt-4">
                <Link to="/transactions">
                  <Button variant="outline" className="w-full">View All Transactions</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
