import React, { useState, memo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { LogOut, Bell, ChevronRight, Settings, User, Lock, Shield, Menu } from './ui/icons';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import { getTalentGroupName } from './ui/unc-colors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DashboardHeaderProps {
  user: {
    name: string;
    studentId?: string;
    email?: string;
    role: string;
    talentGroup?: string;
  };
  onLogout: () => void;
  dashboardTitle: string;
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
  navigationPath?: Array<{ label: string; onClick?: () => void }>;
  onNavigateToSettings?: (tab?: 'account' | 'security' | 'administration' | 'logout') => void;
  hideStudentId?: boolean;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

function DashboardHeaderComponent({
  user,
  onLogout,
  dashboardTitle,
  unreadNotifications,
  onNotificationsClick,
  navigationPath,
  onNavigateToSettings,
  hideStudentId,
  onMenuClick,
  showMenuButton = false
}: DashboardHeaderProps) {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  return (
    <>
    <header className="bg-white border-b shadow-sm sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 gap-2 sm:gap-4">
          {/* Left Section - Menu Button (Mobile), Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            {showMenuButton && onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden min-h-[44px] min-w-[44px]"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
                aria-expanded="false"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
            )}

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src={uncLogo}
                alt="University of Nueva Caceres logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                width="48"
                height="48"
                loading="eager"
                fetchpriority="high"
              />
              <div className="min-w-0">
                <h1 className="unc-burgundy-text text-base sm:text-lg truncate">TalentTrackUNC</h1>
                <p className="text-xs text-muted-foreground truncate">{dashboardTitle}</p>
              </div>
            </div>
          </div>

          {/* Right Section - User Info and Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Notifications */}
            {onNotificationsClick && (
              <Button
                variant="ghost"
                size="icon"
                className="relative min-h-[44px] min-w-[44px]"
                onClick={onNotificationsClick}
                aria-label={`Notifications${unreadNotifications && unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ''}`}
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadNotifications && unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#7A1E1E] text-white text-xs" aria-live="polite">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Info */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <div className="flex items-center justify-end space-x-2">
                {user.role === "admin" && (
                  <Badge className="bg-[#6c757d] text-white">Admin</Badge>
                )}
                {user.role === "director" && user.talentGroup && (
                  <Badge className="bg-[#7A1E1E] text-white">
                    {getTalentGroupName(user.talentGroup)}
                  </Badge>
                )}
                {user.role === "scholar" && user.talentGroup && (
                  <>
                    <Badge className="bg-[#7A1E1E] text-white">
                      {getTalentGroupName(user.talentGroup)}
                    </Badge>
                    {user.studentId && !hideStudentId && (
                      <span className="text-xs text-muted-foreground">{user.studentId}</span>
                    )}
                  </>
                )}
                {user.role === "trainee" && user.talentGroup && (
                  <Badge className="bg-[#7A1E1E] text-white">
                    {getTalentGroupName(user.talentGroup)}
                  </Badge>
                )}
                {user.role === "student" && !user.talentGroup && user.email && (
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                )}
              </div>
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors min-h-[44px] min-w-[44px] px-3 sm:px-4"
                  aria-label="User settings menu"
                >
                  <Settings className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onNavigateToSettings && (
                  <>
                    <DropdownMenuItem onClick={() => onNavigateToSettings('account')}>
                      <User className="w-4 h-4 mr-2" aria-hidden="true" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigateToSettings('security')}>
                      <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                      Security
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setShowLogoutConfirmation(true)} variant="destructive">
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Breadcrumbs */}
        {navigationPath && navigationPath.length > 0 && (
          <nav aria-label="Breadcrumb" className="pb-3">
            <ol className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
              {navigationPath.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="text-muted-foreground hover:text-[#7A1E1E] transition-colors min-h-[44px] flex items-center"
                      aria-label={`Navigate to ${item.label}`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="text-[#7A1E1E] font-medium" aria-current="page">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </header>

    {/* Logout Confirmation Dialog */}
    <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
      <DialogContent className="border-[#E0E0E0]" aria-describedby="logout-description">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A]">Confirm Logout</DialogTitle>
          <DialogDescription id="logout-description" className="text-[#6C757D]">
            Are you sure you want to logout? You will be redirected to the login page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowLogoutConfirmation(false)}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowLogoutConfirmation(false);
              onLogout();
            }}
            className="min-h-[44px] w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

export const DashboardHeader = memo(DashboardHeaderComponent);