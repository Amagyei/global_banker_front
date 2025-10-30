import { Link, useLocation } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const location = useLocation();
  
  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "US Cards", path: "/us-cards" },
    { name: "UK Cards", path: "/uk-cards" },
    { name: "Canada Cards", path: "/canada-cards" },
    { name: "Transactions", path: "/transactions" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">GiftCard Pro</span>
          </Link>
          
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
