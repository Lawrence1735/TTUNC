import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { NotificationPanel } from './NotificationPanel';
import { toast } from 'sonner';
import { 
  User as UserIcon, 
  LogOut, 
  Package, 
  Bell,
  Calendar,
  Award,
  Settings as SettingsIcon,
  Lock,
  Shield
} from './ui/icons';
import type { User, InventoryItem, Notification } from '../App';
import { getTalentGroupName } from './ui/unc-colors';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
// ── Accessibility components (WCAG 2.1 AA / ISO 9241 / ISO 25010) ──────────────
import { SkipToContent, EmptyState } from './accessibility';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';

interface MemberProfileDashboardProps {
  user: User;
  onLogout: () => void;
  inventory: InventoryItem[];
  notifications: Notification[];
  onMarkNotificationRead: (notificationId: string) => void;
  onNavigate?: (view: 'scholar' | 'member-profile' | 'engagement' | 'scholarship' | 'settings', tab?: 'account' | 'security' | 'administration' | 'logout') => void;
  onUpdateProfile?: (updatedUser: Partial<User>) => Promise<void> | void;
}

export function MemberProfileDashboard({ 
  user, 
  onLogout, 
  inventory,
  notifications,
  onMarkNotificationRead,
  onNavigate,
  onUpdateProfile
}: MemberProfileDashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [hiddenNotifIds, setHiddenNotifIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [profileDraft, setProfileDraft] = useState<Partial<User>>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  useEffect(() => {
    setProfileDraft({
      name: user.name,
      phone: user.phone || '',
      address: user.address || '',
      course: user.course || '',
      yearLevel: user.yearLevel || '',
      department: user.department || '',
    });
  }, [user]);

  const currentProfile: User = {
    ...user,
    ...profileDraft,
  } as User;


  // Assigned items data - categorized based on talent group using REAL inventory data
  const isMarchingBand = user.talentGroup === 'marching-band';
  const isDanceClub = user.talentGroup === 'dance-club';
  const isMajorettes = user.talentGroup === 'majorettes';
  const isGleeClub = user.talentGroup === 'glee-club';

  // Scholars should only see items assigned directly to them.
  const myInventory = inventory.filter(item =>
    item.userId === user.id &&
    item.status === 'assigned'
  );

  // Assigned items by type
  const assignedInstruments = myInventory.filter(item => item.type === 'instrument');
  const assignedInstrument = assignedInstruments
    .slice()
    .sort((a, b) => {
      const aTime = a.assignedDate ? new Date(a.assignedDate).getTime() : 0;
      const bTime = b.assignedDate ? new Date(b.assignedDate).getTime() : 0;
      return bTime - aTime;
    })[0] ?? null;
  const assignedUniforms = myInventory.filter(item => item.type === 'uniform');
  const assignedAccessories = myInventory.filter(item => item.type === 'accessory');

  const visibleNotifications = notifications.filter(n => !hiddenNotifIds.includes(n.id));
  const unreadNotifications = visibleNotifications.filter(n => !n.read);

  // Calculate profile completion using backend-supported profile fields
  const profileFields = [
    currentProfile.email,
    currentProfile.phone,
    currentProfile.address,
    currentProfile.studentId,
    currentProfile.course,
    currentProfile.yearLevel,
    currentProfile.department
  ];
  const filledFields = profileFields.filter(field => field && field.trim() !== '').length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    try {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast.success(`Navigated to ${sectionId.replace(/-/g, ' ')}`);
      } else {
        console.warn(`Section with id "${sectionId}" not found`);
        toast.error(`Could not find section`);
      }
    } catch (error) {
      console.error('Scroll error:', error);
      toast.error('Navigation failed');
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'needs_repair': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Skip to main content — WCAG 2.4.1 */}
      <SkipToContent />

      {/* Header */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">
            {/* Left Section - Logo and Title */}
            <div>
              <div>
                <h1 className="text-xl leading-tight">
                  <span className="font-bold text-[#0F172A]">Talent</span>
                  <span className="text-[#0F172A]">Track</span>
                  <span className="font-bold text-[#7A1E1E]">UNC</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  {user.role === "admin"
                    ? "Admin Dashboard"
                    : user.role === "director"
                      ? "Director Dashboard"
                      : user.role === "trainee" || user.trainingStatus === "in_progress"
                        ? "Trainee Dashboard"
                        : user.role === "student"
                          ? "Student Dashboard"
                          : "Scholar Dashboard"}
                </p>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-9 h-9 p-0 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:border-[#7A1E1E] hover:text-[#7A1E1E] text-[#475569] transition-colors"
                  aria-label={
                    unreadNotifications.length > 0
                      ? `Notifications — ${unreadNotifications.length} unread`
                      : 'Notifications — no unread'
                  }
                  aria-expanded={showNotifications}
                  aria-controls="notifications-panel"
                  aria-haspopup="dialog"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {unreadNotifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-[#7A1E1E] text-white text-[9px] font-bold" aria-hidden="true">
                      {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                    </Badge>
                  )}
                </Button>
                
                {showNotifications && (
                  <NotificationPanel
                    notifications={visibleNotifications}
                    onMarkAsRead={(id) => onMarkNotificationRead(id)}
                    onMarkAllAsRead={() => visibleNotifications.filter(n => !n.read).forEach(n => onMarkNotificationRead(n.id))}
                    onDeleteNotification={(id) => setHiddenNotifIds(prev => [...prev, id])}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {/* User Info */}
              <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
                <div className="w-8 h-8 rounded-full bg-[#F9EAEA] border border-[#7A1E1E]/20 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-[#7A1E1E]" aria-hidden="true" />
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{currentProfile.name}</p>
                  <p className="text-[11px] text-[#64748B] leading-none mt-0.5">
                    {user.talentGroup
                      ? getTalentGroupName(user.talentGroup)
                      : user.role === 'admin'
                        ? 'Admin'
                        : user.role === 'director'
                          ? 'Director'
                          : user.role === 'scholar'
                            ? 'Scholar'
                            : user.role === 'trainee' || user.trainingStatus === 'in_progress'
                              ? 'Trainee'
                              : 'Student'}
                  </p>
                </div>
              </div>
              
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="flex items-center gap-1.5 border border-[#7A1E1E] rounded-lg px-3 py-1.5 text-sm font-medium text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors duration-200 h-auto min-h-0"
                    aria-label="Open settings menu"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate?.('settings', 'account')}>
                    <UserIcon className="w-4 h-4 mr-2" aria-hidden="true" />Account Settings                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate?.('settings', 'security')}>
                    <Lock className="w-4 h-4 mr-2" aria-hidden="true" />Security                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowLogoutConfirmation(true)} variant="destructive">
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />Logout                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>
      </header>

      {/* Dashboard Navigation */}
      {onNavigate && (
        <nav className="bg-white border-b border-[#E2E8F0]" aria-label="Dashboard sections">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px]">
            <div className="flex gap-0 overflow-x-auto" role="tablist" aria-label="Dashboard views">
              {([
                { key: 'member-profile', label: 'Member Profile', active: true,  cb: undefined,                        Icon: UserIcon },
                { key: 'engagement',     label: 'Engagement',     active: false, cb: () => onNavigate('engagement'),   Icon: Calendar },
                { key: 'scholarship',    label: 'Scholarship',    active: false, cb: () => onNavigate('scholarship'),  Icon: Award },
              ] as const).map(({ key, label, active, cb, Icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? 'page' : undefined}
                  onClick={cb}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-b-2 ${
                    active
                      ? 'border-[#7A1E1E] text-[#7A1E1E]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-6">
        {/* Quick Stats - Dashboard Overview */}
        <section aria-labelledby="quick-stats-heading" className="mb-8">
          <h2 id="quick-stats-heading" className="sr-only">Quick Statistics</h2>
          <div className={`grid ${isDanceClub ? 'grid-cols-1' : 'grid-cols-2'} gap-4`} role="list" aria-label="Profile quick statistics">
            <div role="listitem" aria-label={`Profile completion: ${profileCompletion}%. Activate to view personal information.`}>
              <DashboardQuickStatCard
                label="Profile Completion"
                value={`${profileCompletion}%`}
                onClick={() => scrollToSection('personal-information')}
              />
            </div>

            <div role="listitem" aria-label="Assigned items. Activate to view inventory.">
              <DashboardQuickStatCard
                label="Assigned Items"
                value={myInventory.length}
                onClick={() => scrollToSection('assigned-items')}
              />
            </div>
          </div>
        </section>

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="mb-2 text-[#7A1E1E]">Member Profile</h2>
          <p className="text-muted-foreground">
            {isMarchingBand ? 'Manage your profile information.' : 'Manage your profile information and view assigned items.'}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Personal Information */}
          <Card className="card-unc" id="personal-information">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="unc-burgundy-text flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 shrink-0" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Profile information fetched from the backend</CardDescription>
                </div>
                {!isEditingProfile ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px]"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Details
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-[44px]"
                      onClick={() => {
                        setProfileDraft({
                          name: user.name,
                          phone: user.phone || '',
                          address: user.address || '',
                          course: user.course || '',
                          yearLevel: user.yearLevel || '',
                          department: user.department || '',
                        });
                        setIsEditingProfile(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="min-h-[44px] bg-[#7A1E1E] hover:bg-[#6A1919] text-white"
                      disabled={isSavingProfile}
                      onClick={async () => {
                        try {
                          setIsSavingProfile(true);
                          await onUpdateProfile?.({
                            name: String(profileDraft.name || '').trim(),
                            phone: String(profileDraft.phone || '').trim(),
                            address: String(profileDraft.address || '').trim(),
                            course: String(profileDraft.course || '').trim(),
                            yearLevel: String(profileDraft.yearLevel || '').trim(),
                            department: String(profileDraft.department || '').trim(),
                          });
                          setIsEditingProfile(false);
                          toast.success('Profile details updated');
                        } catch {
                          // Error toast is handled by caller to avoid duplicate messages.
                        } finally {
                          setIsSavingProfile(false);
                        }
                      }}
                    >
                      {isSavingProfile ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditingProfile ? (
                    <input
                      id="name"
                      className="mt-1 w-full h-10 rounded-md border border-[#D1D5DC] px-3 text-sm"
                      value={String(profileDraft.name || '')}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm mt-1 text-gray-600">{currentProfile.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm text-gray-600">{currentProfile.studentId}</p>
                    <Badge variant="outline" className="text-[10px]">Locked</Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm">{currentProfile.email}</p>
                    <Badge variant="outline" className="text-[10px]">Locked</Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditingProfile ? (
                    <input
                      id="phone"
                      className="mt-1 w-full h-10 rounded-md border border-[#D1D5DC] px-3 text-sm"
                      value={String(profileDraft.phone || '')}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Not provided"
                    />
                  ) : (
                    <p className="text-sm mt-1">{currentProfile.phone || 'Not provided'}</p>
                  )}
                </div>
                {/* Assigned Instrument - only show for Marching Band */}
                {isMarchingBand && (
                  <div>
                    <Label>Assigned Instrument</Label>
                    <p className="text-sm mt-1">{assignedInstrument?.itemName || 'Not assigned'}</p>
                  </div>
                )}

                {/* Address - always show */}
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditingProfile ? (
                    <textarea
                      id="address"
                      className="mt-1 w-full rounded-md border border-[#D1D5DC] px-3 py-2 text-sm"
                      rows={2}
                      value={String(profileDraft.address || '')}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Not provided"
                    />
                  ) : (
                    <p className="text-sm mt-1">{currentProfile.address || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="course">Course</Label>
                  {isEditingProfile ? (
                    <input
                      id="course"
                      className="mt-1 w-full h-10 rounded-md border border-[#D1D5DC] px-3 text-sm"
                      value={String(profileDraft.course || '')}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, course: e.target.value }))}
                      placeholder="Not provided"
                    />
                  ) : (
                    <p className="text-sm mt-1">{currentProfile.course || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="yearLevel">Year Level</Label>
                  {isEditingProfile ? (
                    <input
                      id="yearLevel"
                      className="mt-1 w-full h-10 rounded-md border border-[#D1D5DC] px-3 text-sm"
                      value={String(profileDraft.yearLevel || '')}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, yearLevel: e.target.value }))}
                      placeholder="Not provided"
                    />
                  ) : (
                    <p className="text-sm mt-1">{currentProfile.yearLevel || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  {isEditingProfile ? (
                    <input
                      id="department"
                      className="mt-1 w-full h-10 rounded-md border border-[#D1D5DC] px-3 text-sm"
                      value={String(profileDraft.department || '')}
                      onChange={(e) => setProfileDraft((prev) => ({ ...prev, department: e.target.value }))}
                      placeholder="Not provided"
                    />
                  ) : (
                    <p className="text-sm mt-1">{currentProfile.department || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Items */}
          {!isDanceClub && (
          <Card className="border-[#e0e0e0]" id="assigned-items">
            <CardHeader>
              <CardTitle className="text-[#880808] flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Assigned Items
              </CardTitle>
              <CardDescription className="text-[#6c757d]">Equipment and materials assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Instrument Section - only show for Marching Band */}
                {isMarchingBand && (
                  <div>
                    <h4 className="text-sm font-medium text-[#880808] mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Instrument
                    </h4>
                    {assignedInstrument ? (
                      <Card className="border-[#e0e0e0] bg-gradient-to-r from-[#880808]/5 to-transparent">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-[#1A1A1A]">{assignedInstrument.itemName}</p>
                                {assignedInstrument.instrumentType && <p className="text-[11px] text-[#6c757d] mt-1">{assignedInstrument.instrumentType}</p>}
                              </div>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {assignedInstrument.condition}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-xs text-[#6c757d]">Item ID</p>
                                <p className="text-xs">{assignedInstrument.id}</p>
                              </div>
                              {assignedInstrument.serialNumber && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Serial Number</p>
                                  <p className="text-xs">{assignedInstrument.serialNumber}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-[#6c757d]">Date Issued</p>
                                <p className="text-xs">{assignedInstrument.assignedDate?.toLocaleDateString() || 'Not specified'}</p>
                              </div>
                              {assignedInstrument.notes && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Notes</p>
                                  <p className="text-xs">{assignedInstrument.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center py-8 text-[#6c757d] border border-dashed border-[#e0e0e0] rounded-lg">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No instrument assigned</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Uniform Section */}
                <div>
                  <h4 className="text-sm font-medium text-[#880808] mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Uniform
                  </h4>
                  {assignedUniforms.length > 0 ? (
                    assignedUniforms.map((uniform, index) => (
                      <Card key={index} className="border-[#e0e0e0]">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-[#1A1A1A] text-sm">{uniform.itemName || 'Uniform Set'}</p>
                                <p className="text-xs text-[#6c757d] mt-1">ID: {uniform.id}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {uniform.condition}
                              </Badge>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 text-sm">
                              {uniform.uniformSet && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Set</p>
                                  <p className="font-medium text-xs">{uniform.uniformSet}</p>
                                </div>
                              )}
                              {uniform.serialNumber && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Serial Number</p>
                                  <p className="font-medium text-xs">{uniform.serialNumber}</p>
                                </div>
                              )}
                              {uniform.propertyType && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Property Type</p>
                                  <p className="font-medium text-xs">{uniform.propertyType}</p>
                                </div>
                              )}
                              {uniform.headpieceSize && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Headpiece Size</p>
                                  <p className="font-medium text-xs">{uniform.headpieceSize}</p>
                                </div>
                              )}
                              {uniform.topSize && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Top Size</p>
                                  <p className="font-medium text-xs">{uniform.topSize}</p>
                                </div>
                              )}
                              {uniform.pantsSize && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Pants Size</p>
                                  <p className="font-medium text-xs">{uniform.pantsSize}</p>
                                </div>
                              )}
                              {uniform.bandShoesSize && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Band Shoes Size</p>
                                  <p className="font-medium text-xs">{uniform.bandShoesSize}</p>
                                </div>
                              )}
                              {uniform.dressSize && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Dress Size</p>
                                  <p className="font-medium text-xs">{uniform.dressSize}</p>
                                </div>
                              )}
                              {uniform.shoesSize && (
                                <div>
                                  <p className="text-xs text-[#6c757d]">Shoes Size</p>
                                  <p className="font-medium text-xs">{uniform.shoesSize}</p>
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-[#e0e0e0] text-sm">
                              <p className="text-xs text-[#6c757d]">Issued: {uniform.assignedDate?.toLocaleDateString() || 'Not specified'}</p>
                              {uniform.description && <p className="text-xs text-[#6c757d] mt-1">{uniform.description}</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#6c757d] border border-dashed border-[#e0e0e0] rounded-lg">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No uniforms assigned</p>
                    </div>
                  )}
                </div>

                {/* Accessories Section - Not for Dance Club or Glee Club */}
                {(isMarchingBand || isMajorettes) && (
                <div>
                  <h4 className="text-sm font-medium text-[#880808] mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Accessories ({assignedAccessories.length})
                  </h4>
                  {assignedAccessories.length > 0 ? (
                    <div className="space-y-3">
                      {assignedAccessories.map((accessory, index) => (
                        <Card key={index} className="border-[#e0e0e0]">
                          <CardContent className="pt-3 pb-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-sm text-[#1A1A1A]">{accessory.itemName || accessory.name || 'Accessory'}</p>
                                <Badge className={
                                  accessory.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                                  accessory.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                                  accessory.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                } variant="secondary">
                                  {accessory.condition}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-[#6c757d]">ID: {accessory.id}</p>
                                {accessory.quantity !== undefined && <p className="text-xs text-[#6c757d]">Quantity: {accessory.quantity}</p>}
                                <p className="text-xs text-[#6c757d]">Issued: {accessory.assignedDate?.toLocaleDateString() || 'Not specified'}</p>
                              </div>
                              {accessory.description && (
                                <div className="pt-2 border-t border-[#e0e0e0]">
                                  <p className="text-xs text-[#6c757d]">{accessory.description}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#6c757d] border border-dashed border-[#e0e0e0] rounded-lg">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No accessories assigned</p>
                    </div>
                  )}
                </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </main>

      {/* Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#880808]">Item Details</DialogTitle>
            <DialogDescription>Complete information about this assigned item</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Instrument Section */}
                <div>
                  <Label className="text-muted-foreground">Item Name</Label>
                  <p className="font-medium mt-1">{selectedItem.itemName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Item Type</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {selectedItem.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Condition</Label>
                  <p className={`font-medium mt-1 capitalize ${getConditionColor(selectedItem.condition)}`}>
                    {selectedItem.condition.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={
                      selectedItem.status === 'assigned' ? 'bg-green-600' :
                      selectedItem.status === 'returned' ? 'bg-gray-600' :
                      selectedItem.status === 'lost' ? 'bg-red-600' :
                      'bg-yellow-600'
                    }>
                      {selectedItem.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned Date</Label>
                  <p className="mt-1">{selectedItem.assignedDate?.toLocaleDateString() || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned By</Label>
                  <p className="mt-1">{selectedItem.assignedBy || 'Admin'}</p>
                </div>
                {selectedItem.returnDate && (
                  <div>
                    <Label className="text-muted-foreground">Return Date</Label>
                    <p className="mt-1">{selectedItem.returnDate.toLocaleDateString()}</p>
                  </div>
                )}
                {selectedItem.serialNumber && (
                  <div>
                    <Label className="text-muted-foreground">Serial Number</Label>
                    <p className="mt-1 text-sm">{selectedItem.serialNumber}</p>
                  </div>
                )}
              </div>
              
              {selectedItem.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedItem.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Please take good care of this item. Report any damage or loss immediately to your director.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
        <DialogContent className="border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A]">Confirm Logout</DialogTitle>
            <DialogDescription className="text-[#6C757D]">
              Are you sure you want to logout? You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" className="min-h-[44px]" onClick={() => setShowLogoutConfirmation(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="min-h-[44px]"
              onClick={() => {
                setShowLogoutConfirmation(false);
                onLogout();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />Logout            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}