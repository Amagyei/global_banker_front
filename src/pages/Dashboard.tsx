import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, DollarSign, Users, Wallet, ShoppingBag, Gift, Award } from "lucide-react";

const Dashboard = () => {
  const userStats = [
    {
      title: "My Balance",
      value: "$2,450.00",
      change: "Available to spend",
      icon: Wallet,
      color: "text-success",
    },
    {
      title: "Available Cards",
      value: "156",
      change: "Across all markets",
      icon: Gift,
      color: "text-primary",
    },
    {
      title: "Recent Purchases",
      value: "12",
      change: "This month",
      icon: ShoppingBag,
      color: "text-secondary",
    },
    {
      title: "Reward Points",
      value: "3,420",
      change: "$34 in credits",
      icon: Award,
      color: "text-accent",
    },
  ];

  const platformStats = [
    {
      title: "Total Sales",
      value: "$45,231",
      change: "+20.1%",
      icon: DollarSign,
      color: "text-success",
    },
    {
      title: "Active Cards",
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
            <CardDescription>Best selling gift card types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Gaming", "Retail", "Entertainment", "Food & Dining"].map((category, index) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary"
                        style={{ width: `${85 - index * 15}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {85 - index * 15}%
                    </span>
                  </div>
                </div>
              ))}
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
              {[
                { action: "PlayStation Plus purchased", time: "2 minutes ago", amount: "$773.00" },
                { action: "Amazon gift card sold", time: "15 minutes ago", amount: "$50.00" },
                { action: "Steam Wallet added", time: "1 hour ago", amount: "$100.00" },
                { action: "iTunes card redeemed", time: "2 hours ago", amount: "$25.00" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <span className="font-semibold text-success">{activity.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
