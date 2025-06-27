"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Disease Prediction", href: "/disease-prediction" },
  { name: "Recommendation", href: "/recommendation" },
  { name: "Weather", href: "/weather" },
  { name: "Contact-Us", href: "/contact" },
];

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check for user in localStorage
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }

    // Listen for localStorage changes (cross-tab and same tab)
    const handleStorage = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("user-updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("user-updated", handleStorage);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      localStorage.removeItem("user");
      setUser(null);
      router.push("/");
    }
  };

  const getUserInitials = (userData: UserData) => {
    if (!userData.firstName || !userData.lastName) return "U";
    return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-8 w-8 text-green-600" />
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-green-600" />
            </div>
          </div>
          <span className="text-xl font-bold text-green-700 dark:text-green-400">
            Crop Care
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-green-600 dark:hover:text-green-400",
                pathname === item.href
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle: Render always, no disabled prop */}
          <ThemeToggle />

          {/* Auth Buttons */}
          {!isLoading ? (
            user ? (
              mounted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden sm:flex"
                disabled={!mounted}
              >
                <Link href="/login">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )
          ) : (
            <div style={{ width: 80, height: 32 }} />
          )}
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-green-600 dark:hover:text-green-400 py-2",
                      pathname === item.href
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                {!isLoading && (
                  <>
                    {user ? (
                      <div className="pt-4 border-t">
                        <div className="flex items-center space-x-2 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          asChild
                          className="w-full justify-start mb-2"
                        >
                          <Link href="/profile">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        asChild
                        className="mt-4"
                        disabled={!mounted}
                      >
                        <Link href="/login">
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
