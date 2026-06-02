import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { NotificationPanel } from './NotificationPanel';
import { toast } from 'sonner';
import { 
  User as UserIcon, 
  LogOut, 
  Package, 
  Upload,
  CheckCircle,
  Bell,
  Edit,
  Save,
  Calendar,
  Award,
  AlertCircle,
  ChevronDown,
  Settings as SettingsIcon,
  Lock,
  Shield
} from './ui/icons';
import type { User, InventoryItem, Notification } from '../App';
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
// ── Accessibility components (WCAG 2.1 AA / ISO 9241 / ISO 25010) ──────────────
import { SkipToContent, EmptyState } from './accessibility';

interface MemberProfileDashboardProps {
  user: User;
  onLogout: () => void;
  inventory: InventoryItem[];
  notifications: Notification[];
  onMarkNotificationRead: (notificationId: string) => void;
  onNavigate?: (view: 'scholar' | 'member-profile' | 'engagement' | 'scholarship' | 'settings', tab?: 'account' | 'security' | 'administration' | 'logout') => void;
  onUpdateProfile?: (updatedUser: Partial<User>) => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
    emergencyContact: user.emergencyContact || '',
    emergencyPhone: user.emergencyPhone || '',
    emergencyRelationship: user.emergencyRelationship || '',
    guardianName: user.guardianName || '',
    guardianContact: user.guardianContact || '',
    allergies: user.allergies || '',
    medicalConditions: user.medicalConditions || ''
  });
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  // Assigned items data - categorized based on talent group using REAL inventory data
  const isMarchingBand = user.talentGroup === 'marching-band';
  const isDanceClub = user.talentGroup === 'dance-club';
  const isMajorettes = user.talentGroup === 'majorettes';
  const isGleeClub = user.talentGroup === 'glee-club';

  // Filter inventory items assigned to this user
  const myInventory = inventory.filter(item => item.userId === user.id && item.status === 'assigned');

  // Assigned items by type
  const assignedInstruments = myInventory.filter(item => item.type === 'instrument');
  const assignedUniforms = myInventory.filter(item => item.type === 'uniform');
  const assignedAccessories = myInventory.filter(item => item.type === 'accessory');

  const visibleNotifications = notifications.filter(n => !hiddenNotifIds.includes(n.id));
  const unreadNotifications = visibleNotifications.filter(n => !n.read);

  // Calculate profile completion
  const profileFields = [
    user.email,
    user.phone,
    user.address,
    user.dateOfBirth,
    user.gender,
    user.emergencyContact,
    user.emergencyPhone
  ];
  const filledFields = profileFields.filter(field => field && field.trim() !== '').length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast.success(`Navigated to ${sectionId.replace('-', ' ')}`);
    }
  };

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile(profileData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      // If no onUpdateProfile is provided, show a warning
      toast.error('Profile update function not available');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      toast.success(`File "${file.name}" uploaded successfully!`);
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

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content — WCAG 2.4.1 */}
      <SkipToContent />

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50" role="banner">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={uncLogo} 
                  alt="University of Nueva Caceres Logo"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="unc-burgundy-text">TalentTrackUNC</h1>
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
            </div>
            
            {/* Right Section - User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative min-h-[44px] min-w-[44px]"
                  aria-label={
                    unreadNotifications.length > 0
                      ? `Notifications — ${unreadNotifications.length} unread`
                      : 'Notifications — no unread'
                  }
                  aria-expanded={showNotifications}
                  aria-controls="notifications-panel"
                  aria-haspopup="dialog"
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {unreadNotifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#7A1E1E] text-white text-xs" aria-hidden="true">
                      {unreadNotifications.length}
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
                  {user.role === "scholar" && user.talentGroup && user.trainingStatus !== "in_progress" && (
                    <>
                      <Badge className="bg-[#7A1E1E] text-white">
                        {getTalentGroupName(user.talentGroup)}
                      </Badge>
                      {user.studentId && (
                        <span className="text-xs text-muted-foreground">{user.studentId}</span>
                      )}
                    </>
                  )}
                  {(user.role === "trainee" || user.trainingStatus === "in_progress") && user.talentGroup && (
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
                    size="sm" 
                    className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors min-h-[44px]"
                    aria-label="Open settings menu"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" aria-hidden="true" />
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
        </div>
      </header>

      {/* Dashboard Navigation */}
      {onNavigate && (
        <nav className="bg-white border-b" aria-label="Dashboard sections">
          <div className="container mx-auto px-4 py-3">
            <div className="flex overflow-x-auto scrollbar-hide pb-1 gap-1" role="tablist" aria-label="Dashboard views">
              <Button
                role="tab"
                variant="default"
                size="sm"
                className="bg-[#7A1E1E] text-white hover:bg-[#7A1E1E] min-h-[44px]"
                aria-selected={true}
                aria-current="page"
              >
                <UserIcon className="w-4 h-4 mr-2" aria-hidden="true" /><span className="hidden sm:inline">Member Profile</span>              </Button>
              <Button
                role="tab"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('engagement')}
                className="min-h-[44px]"
                aria-selected={false}
              >
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" /><span className="hidden sm:inline">Engagement</span>              </Button>
              <Button
                role="tab"
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('scholarship')}
                className="min-h-[44px]"
                aria-selected={false}
              >
                <Award className="w-4 h-4 mr-2" aria-hidden="true" /><span className="hidden sm:inline">Scholarship</span>              </Button>
            </div>
          </div>
        </nav>
      )}

      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Quick Stats - Dashboard Overview */}
        <section aria-labelledby="quick-stats-heading" className="mb-8">
          <h2 id="quick-stats-heading" className="sr-only">Quick Statistics</h2>
          <div className={`grid ${isDanceClub ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-4`} role="list" aria-label="Profile quick statistics">
          <Card
            role="listitem"
            className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
            onClick={() => scrollToSection('personal-information')}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToSection('personal-information'); } }}
            aria-label={`Profile completion: ${profileCompletion}%. Activate to view personal information.`}
          >
            <CardContent className="p-2 sm:p-3">
              <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Profile Completion</p>
              <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{profileCompletion}%</p>
            </CardContent>
          </Card>

          <Card
            role="listitem"
            className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
            onClick={() => scrollToSection('assigned-items')}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToSection('assigned-items'); } }}
            aria-label="Assigned items. Activate to view inventory."
          >
            <CardContent className="p-2 sm:p-3">
              <p className="text-[#6B7280] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">Assigned Items</p>
              <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">
                {myInventory.length}
              </p>
            </CardContent>
          </Card>
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
                  <CardDescription>Your profile details and contact information</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="shrink-0 min-h-[44px]" aria-label="Edit your profile">
                    <Edit className="w-4 h-4 mr-2" aria-hidden="true" />Edit Profile                  </Button>
                ) : (
                  <div className="flex shrink-0 space-x-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="min-h-[44px]">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="btn-unc min-h-[44px]">
                      <Save className="w-4 h-4 mr-2" aria-hidden="true" />Save Changes                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <p className="text-sm mt-1 text-gray-600">{user.name}</p>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground mt-1 italic">Name cannot be edited</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <p className="text-sm mt-1 text-gray-600">{user.studentId}</p>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.phone || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="talentGroup">Talent Group</Label>
                  <p className="text-sm mt-1">{user.talentGroup?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>

                {/* Assigned Instrument - only show for Marching Band */}
                {isMarchingBand && (
                  <div>
                    <Label>Assigned Instrument</Label>
                    {isEditing ? (
                      <p className="text-sm mt-1 text-gray-600">{user.assignedInstrument || 'Not assigned'}</p>
                    ) : (
                      <p className="text-sm mt-1">{user.assignedInstrument || 'Not assigned'}</p>
                    )}
                  </div>
                )}

                {/* Address - always show */}
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your complete address"
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.address || 'Not provided'}</p>
                  )}
                </div>

                {/* Date of Birth - always show */}
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="mt-1 border-[#D1D5DC] bg-white cursor-pointer"
                      style={{ colorScheme: 'light' }}
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                  )}
                </div>

                {/* Age - always show */}
                <div>
                  <Label>Age</Label>
                  <p className="text-sm mt-1">
                    {user.dateOfBirth && calculateAge(user.dateOfBirth) !== null 
                      ? `${calculateAge(user.dateOfBirth)} years old` 
                      : 'Not provided'}
                  </p>
                </div>

                {/* Gender - always show */}
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Input
                      id="gender"
                      value={profileData.gender}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.gender || 'Not provided'}</p>
                  )}
                </div>

                {/* Allergies - always show */}
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  {isEditing ? (
                    <Input
                      id="allergies"
                      value={profileData.allergies}
                      onChange={(e) => setProfileData(prev => ({ ...prev, allergies: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.allergies || 'Not provided'}</p>
                  )}
                </div>

                {/* Medical Conditions - always show */}
                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  {isEditing ? (
                    <Input
                      id="medicalConditions"
                      value={profileData.medicalConditions}
                      onChange={(e) => setProfileData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.medicalConditions || 'Not provided'}</p>
                  )}
                </div>

                {/* Emergency Contact Name - always show */}
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  {isEditing ? (
                    <Input
                      id="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.emergencyContact || 'Not provided'}</p>
                  )}
                </div>

                {/* Emergency Contact Phone - always show */}
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  {isEditing ? (
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={profileData.emergencyPhone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.emergencyPhone || 'Not provided'}</p>
                  )}
                </div>

                {/* Emergency Contact Relationship - always show */}
                <div>
                  <Label htmlFor="emergencyRelationship">Emergency Contact Relationship</Label>
                  {isEditing ? (
                    <Input
                      id="emergencyRelationship"
                      value={profileData.emergencyRelationship}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyRelationship: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.emergencyRelationship || 'Not provided'}</p>
                  )}
                </div>

                {/* Guardian Name - always show */}
                <div>
                  <Label htmlFor="guardianName">Guardian's Name</Label>
                  {isEditing ? (
                    <Input
                      id="guardianName"
                      value={profileData.guardianName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, guardianName: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.guardianName || 'Not provided'}</p>
                  )}
                </div>

                {/* Guardian Contact - always show */}
                <div>
                  <Label htmlFor="guardianContact">Guardian's Contact</Label>
                  {isEditing ? (
                    <Input
                      id="guardianContact"
                      type="tel"
                      value={profileData.guardianContact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, guardianContact: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.guardianContact || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card className="card-unc" id="document-upload">
            <CardHeader>
              <CardTitle className="unc-burgundy-text flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Requirements
              </CardTitle>
              <CardDescription>Submit required documents (ID, certificates, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm text-blue-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Important: File Naming Convention
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Please rename your files before uploading using this format:
                  </p>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Example:</strong> MATRICULATION 1ST YEAR 1ST SEM</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Example:</strong> STUDENT_ID_FRONT_AND_BACK</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Example:</strong> CERTIFICATE_OF_REGISTRATION_2024</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Use descriptive names without spaces (use underscores instead)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="fileUpload">Select File</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported formats: PDF, JPG, PNG (Max 5MB)
                  </p>
                </div>

                {uploadedFile && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">{uploadedFile}</p>
                        <p className="text-xs text-green-700 mt-1">File uploaded successfully! Your director will review it.</p>
                      </div>
                    </div>
                  </div>
                )}
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
                    {assignedInstruments.length > 0 ? (
                      assignedInstruments.map((instrument, index) => (
                        <Card key={index} className="border-[#e0e0e0] bg-gradient-to-r from-[#880808]/5 to-transparent">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-[#1A1A1A]">{instrument.itemName}</p>
                                  {instrument.instrumentType && <p className="text-[11px] text-[#6c757d] mt-1">{instrument.instrumentType}</p>}
                                </div>
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  {instrument.condition}
                                </Badge>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <p className="text-xs text-[#6c757d]">Item ID</p>
                                  <p className="font-mono text-xs">{instrument.id}</p>
                                </div>
                                {instrument.serialNumber && (
                                  <div>
                                    <p className="text-xs text-[#6c757d]">Serial Number</p>
                                    <p className="text-xs">{instrument.serialNumber}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-[#6c757d]">Date Issued</p>
                                  <p className="text-xs">{instrument.assignedDate?.toLocaleDateString() || 'Not specified'}</p>
                                </div>
                                {instrument.notes && (
                                  <div>
                                    <p className="text-xs text-[#6c757d]">Notes</p>
                                    <p className="text-xs">{instrument.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
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
                    <p className="mt-1 font-mono text-sm">{selectedItem.serialNumber}</p>
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