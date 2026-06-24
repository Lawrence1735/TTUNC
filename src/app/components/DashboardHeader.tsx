import { useState, memo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOut, Bell, ChevronRight, Settings, User, Lock, Menu } from './ui/icons';
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
  variant?: 'default' | 'director';
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
  showMenuButton = false,
  variant = 'default'
}: DashboardHeaderProps) {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const normalizedRole = String(user.role || '').toLowerCase();
  const hasTalentGroup = Boolean(user.talentGroup);
  const showTraineeLikeBadge = (normalizedRole === 'trainee' || (normalizedRole === 'student' && hasTalentGroup));

  const userRecord = user as Record<string, unknown>;
  const normalizedTalentGroup =
    (typeof user.talentGroup === 'string' && user.talentGroup.trim())
    || (typeof userRecord.talent_group === 'string' && userRecord.talent_group.trim())
    || '';
  const directorGroupRoleLabelMap: Record<string, string> = {
    'marching-band': 'Band Master',
    'majorettes': 'Majorette Coordinator',
    'glee-club': 'Choir Master',
    'dance-club': 'Dance Director',
  };
  const rawPhoto = userRecord.photo_url ?? userRecord.photoUrl ?? userRecord.photo_path ?? userRecord.avatar_url ?? userRecord.avatar;
  const photoPath = typeof rawPhoto === 'string' ? rawPhoto.trim() : '';
  const photoSrc = photoPath
    ? (photoPath.startsWith('http://') || photoPath.startsWith('https://')
      ? photoPath
      : `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/storage/${photoPath.replace(/^\/+/, '')}`)
    : null;
  const nameParts = String(user.name || '').trim().split(/\s+/).filter(Boolean);
  const fallbackInitials = nameParts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U';
  const secondaryDirectorLabel = normalizedTalentGroup
    ? (directorGroupRoleLabelMap[normalizedTalentGroup] || getTalentGroupName(normalizedTalentGroup))
    : 'Director';
  const secondaryDefaultLabel = normalizedTalentGroup
    ? getTalentGroupName(normalizedTalentGroup)
    : (normalizedRole === 'admin'
      ? 'Admin'
      : normalizedRole === 'director'
        ? 'Director'
        : showTraineeLikeBadge
          ? 'Trainee'
          : normalizedRole === 'scholar'
            ? 'Scholar'
            : 'Student');

  return (
    <>
    <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          {/* Left Section - Menu Button (Mobile), Logo and Title */}
          <div className="flex items-center gap-3">
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

            <div className="min-w-0">
                {variant === 'director' ? (
                  <>
                    <h1 className="text-xl leading-tight truncate">
                      <span className="font-bold text-[#0F172A]">Talent</span>
                      <span className="text-[#0F172A]">Track</span>
                      <span className="font-bold text-[#7A1E1E]">UNC</span>
                    </h1>
                    <p className="text-[11px] text-[#64748B] leading-none mt-0.5 truncate">{dashboardTitle}</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-lg sm:text-xl leading-tight truncate">
                      <span className="font-bold text-[#0F172A]">Talent</span>
                      <span className="text-[#0F172A]">Track</span>
                      <span className="font-bold text-[#7A1E1E]">UNC</span>
                    </h1>
                    <p className="text-xs text-muted-foreground truncate">{dashboardTitle}</p>
                  </>
                )}
            </div>
          </div>

          {/* Right Section - User Info and Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications */}
            {onNotificationsClick && (
              <button
                onClick={onNotificationsClick}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:border-[#7A1E1E] hover:text-[#7A1E1E] text-[#475569] transition-colors"
                aria-label={`Notifications${unreadNotifications && unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ''}`}
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unreadNotifications && unreadNotifications > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[#7A1E1E] text-white text-[9px] font-bold"
                    aria-live="polite"
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>
            )}

            {/* User Info */}
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
              <Avatar className="w-8 h-8 border border-[#7A1E1E]/20 flex-shrink-0">
                {photoSrc && <AvatarImage src={photoSrc} alt={`${user.name} profile photo`} />}
                <AvatarFallback className="bg-[#F9EAEA] text-[#7A1E1E] text-[11px] font-semibold">
                  {photoSrc ? fallbackInitials : <User className="w-4 h-4" aria-hidden="true" />}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{user.name}</p>
                <p className="text-[11px] text-[#64748B] leading-none mt-0.5">{variant === 'director' ? secondaryDirectorLabel : secondaryDefaultLabel}</p>
              </div>
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="flex items-center gap-1.5 border border-[#7A1E1E] rounded-lg px-3 py-1.5 text-sm font-medium text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors duration-200 h-auto min-h-0"
                  aria-label="User settings menu"
                >
                  <Settings className="w-3.5 h-3.5" aria-hidden="true" />
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