import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface BreadcrumbNavItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbNavItem[];
  className?: string;
}

export const BreadcrumbNav = ({ items, className }: BreadcrumbNavProps) => {
  const { user } = useAuth();
  
  // For authenticated users, Home should go to admin dashboard
  const homeUrl = user ? "/admin" : "/";
  
  return (
    <div className={`px-4 md:px-6 py-3 bg-white/30 backdrop-blur-sm border-b ${className || ''}`}>
      <div className="max-w-7xl mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={homeUrl} className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {items.map((item, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};