"use client";

import { motion } from "framer-motion";
import { HomeIcon, NewspaperIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Home", icon: HomeIcon, href: "/" },
  { name: "Latest News", icon: NewspaperIcon, href: "/latest" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="hidden md:flex w-64 bg-black border-r border-gray-800"
    >
      <div className="flex flex-col w-full p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">News Aggregator</h1>
        </div>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}