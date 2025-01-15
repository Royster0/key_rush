"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut, Trophy, Keyboard, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User as UserType } from "@/lib/types";

interface NavProps {
  user: UserType | null;
}

export default function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    {
      name: "Type",
      href: "/",
      icon: Keyboard,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
    },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors
              ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
          >
            <Icon className="h-3 w-3" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="sticky top-0 z-50">
      <nav
        className={`border-b bg-background transition-shadow duration-200 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-12 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-l font-bold">
              Key Rush
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLinks />
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors
                      ${
                        isActive("/profile")
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                  >
                    <User className="h-4 w-4" />
                    {user.name || user.email}
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="ghost">Register</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavLinks />
                    <div className="border-t pt-4">
                      {user ? (
                        <>
                          <Link
                            href="/profile"
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                              ${
                                isActive("/profile")
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <form action="/api/auth/logout" method="POST">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 mt-2"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </Button>
                          </form>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" className="w-full">
                              Login
                            </Button>
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setIsOpen(false)}
                          >
                            <Button className="w-full">Register</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
