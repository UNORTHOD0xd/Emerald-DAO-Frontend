'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Building2, 
  Vote, 
  Wallet, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  Bell,
  User
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEmeraldDAO } from '@/hooks/useEmeraldDAO';
import { Badge } from '@/components/ui';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  disabled?: boolean;
  description?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Overview and portfolio'
  },
  { 
    name: 'Properties', 
    href: '/dashboard/properties', 
    icon: Building2,
    description: 'Real estate portfolio'
  },
  { 
    name: 'Governance', 
    href: '/dashboard/governance', 
    icon: Vote,
    description: 'Proposals and voting'
  },
  { 
    name: 'Treasury', 
    href: '/dashboard/treasury', 
    icon: Wallet,
    description: 'DAO finances'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    description: 'Account settings'
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const { isDAOMember, balance, healthScore, emergencyMode } = useEmeraldDAO();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-gray-600 opacity-75"
              onClick={closeSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/EmeraldDAO.png" 
              alt="Emerald DAO" 
              className="w-8 h-8"
            />
            <span className="text-lg font-semibold text-gray-900">Emerald DAO</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        {isConnected && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-emerald-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {isDAOMember ? (
                    <Badge variant="emerald" size="sm">Member</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Non-member</Badge>
                  )}
                  {emergencyMode && (
                    <Badge variant="error" size="sm">Emergency</Badge>
                  )}
                </div>
              </div>
            </div>
            {isDAOMember && (
              <div className="mt-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-medium">{parseFloat(balance).toFixed(2)} ERLD</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Health:</span>
                  <span className="font-medium">{healthScore}/100</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <IconComponent
                  size={18}
                  className={`mr-3 flex-shrink-0 ${
                    isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge variant="info" size="sm">
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <ChevronRight size={16} className="text-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Connect wallet section */}
        {!isConnected && (
          <div className="p-4 border-t border-gray-200">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu size={20} />
              </button>
              <h1 className="ml-2 text-lg font-semibold text-gray-900 lg:ml-0">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                {emergencyMode && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Account menu */}
              {isConnected && (
                <div className="hidden sm:block">
                  <ConnectButton />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 pt-6 pb-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};