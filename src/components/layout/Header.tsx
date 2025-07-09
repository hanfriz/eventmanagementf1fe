"use client";

import Link from "next/link";
import { useState } from "react";
import { User, LogOut, Menu, X, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="mx-auto px-4 container ">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Browse Events
            </Link>
            {user?.role === "ORGANIZER" && (
              <>
                <Link
                  href="/my-events"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  My Events
                </Link>
                <Link
                  href="/organizer/profile"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Profile & Reviews
                </Link>
                <Link
                  href="/events/create"
                  className="text-gray-600 hover:text-blue-600 font-medium flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Event</span>
                </Link>
              </>
            )}
            {user?.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-red-600 font-medium"
                >
                  Admin Panel
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-600 hover:text-red-600 font-medium"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/events"
                  className="text-gray-600 hover:text-red-600 font-medium"
                >
                  Manage Events
                </Link>
              </>
            )}
            {user && user.role === "CUSTOMER" && (
              <Link
                href="/my-bookings"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                My Bookings
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <span className="text-sm font-medium text-black">
                        {user.fullName || user.email}
                      </span>
                      {/* Role Badge */}
                      <div className="text-xs">
                        {user.role === "ORGANIZER" && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                            🎯 Organizer
                          </span>
                        )}
                        {user.role === "ADMIN" && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                            👑 Admin
                          </span>
                        )}
                        {user.role === "CUSTOMER" && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                            🎟️ Customer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {user.points > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {user.points.toLocaleString()} pts
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/events"
                className="text-gray-600 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Events
              </Link>
              {user?.role === "ORGANIZER" && (
                <>
                  <Link
                    href="/my-events"
                    className="text-gray-600 hover:text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Events
                  </Link>
                  <Link
                    href="/organizer/profile"
                    className="text-gray-600 hover:text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile & Reviews
                  </Link>
                  <Link
                    href="/events/create"
                    className="text-gray-600 hover:text-blue-600 font-medium flex items-center space-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </Link>
                </>
              )}
              {user && user.role === "CUSTOMER" && (
                <Link
                  href="/my-bookings"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
              )}

              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-black">
                        {user.fullName}
                      </span>
                      {user.points > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          {user.points} pts
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center space-x-1 w-full justify-center"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
