import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  User,
  Lock,
  Shield,
  LogOut,
  AlertCircle,
  CheckCircle,
  Edit,
  UserCog,
  UserCheck,
  Bell,
  Settings as SettingsIcon,
} from "./ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import type { User as UserType } from "../App";
import { getTalentGroupName } from "./ui/unc-colors";

interface SettingsProps {
  user: UserType;
  onLogout: () => void;
  allUsers: UserType[];
  onUpdateUser: (
    userId: string,
    updates: Partial<UserType>,
  ) => void;
  onUpdatePassword: (
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
  onNavigateBack?: () => void;
  initialTab?: "account" | "security" | "administration" | "logout";
}

export function Settings({
  user,
  onLogout,
  allUsers,
  onUpdateUser,
  onUpdatePassword,
  unreadNotifications = 0,
  onNotificationsClick,
  onNavigateBack,
  initialTab = "account",
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Role management states
  const [selectedUserForRole, setSelectedUserForRole] =
    useState<UserType | null>(null);
  const [newRole, setNewRole] =
    useState<UserType["role"]>("student");
  const [showRoleConfirmation, setShowRoleConfirmation] =
    useState(false);

  // Activation management states
  const [
    selectedUserForActivation,
    setSelectedUserForActivation,
  ] = useState<UserType | null>(null);
  const [
    showActivationConfirmation,
    setShowActivationConfirmation,
  ] = useState(false);

  // Logout confirmation
  const [showLogoutConfirmation, setShowLogoutConfirmation] =
    useState(false);

  const isDirector = user.role === "director";
  const isAdmin = user.role === "admin";
  const showAdministration = isDirector;

  // Get deactivated users - directors only see their own talent group
  const deactivatedUsers = allUsers.filter((u) => {
    const isDeactivated =
      u.applicationStatus === "disapproved" ||
      u.trainingStatus === "failed";

    // If user is a director, only show deactivated users from their talent group
    if (isDirector && user.talentGroup) {
      return (
        isDeactivated && u.talentGroup === user.talentGroup
      );
    }

    return isDeactivated;
  });

  const activeUsers = allUsers.filter(
    (u) =>
      u.applicationStatus !== "disapproved" &&
      u.trainingStatus !== "failed",
  );

  // Check if user is the last director
  const directorCount = allUsers.filter(
    (u) => u.role === "director",
  ).length;
  const isLastDirector =
    user.role === "director" && directorCount === 1;

  const handleSaveName = () => {
    if (newName.trim() && newName !== user.name) {
      onUpdateUser(user.id!, { name: newName.trim() });
      toast.success("Name updated successfully");
    }
    setEditingName(false);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const result = await onUpdatePassword(
      user.id!,
      currentPassword,
      newPassword,
    );

    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError(
        result.error || "Current password is incorrect",
      );
    }
  };

  const handleRoleChange = (
    targetUser: UserType,
    role: UserType["role"],
  ) => {
    // Check if trying to remove the last director
    if (
      targetUser.role === "director" &&
      directorCount === 1 &&
      role !== "director"
    ) {
      toast.error("Cannot remove the last Director role");
      return;
    }

    setSelectedUserForRole(targetUser);
    setNewRole(role);
    setShowRoleConfirmation(true);
  };

  const confirmRoleChange = () => {
    if (selectedUserForRole) {
      onUpdateUser(selectedUserForRole.id!, { role: newRole });
      toast.success(
        `Role updated to ${newRole} for ${selectedUserForRole.name}`,
      );
    }
    setShowRoleConfirmation(false);
    setSelectedUserForRole(null);
  };

  const handleActivateUser = (targetUser: UserType) => {
    setSelectedUserForActivation(targetUser);
    setShowActivationConfirmation(true);
  };

  const confirmActivation = () => {
    if (selectedUserForActivation) {
      onUpdateUser(selectedUserForActivation.id!, {
        applicationStatus: "approved",
        trainingStatus: "not_started",
      });
      toast.success(
        `Account activated for ${selectedUserForActivation.name}`,
      );
    }
    setShowActivationConfirmation(false);
    setSelectedUserForActivation(null);
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      student: "Student",
      scholar: "Scholar",
      admin: "Admin",
      director: "Director",
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: Record<string, string> = {
      director: "bg-[#7A1E1E] text-white",
      admin: "bg-[#6c757d] text-white",
      scholar:
        "bg-[#7A1E1E]/10 text-[#7A1E1E] border border-[#7A1E1E]",
      student: "bg-gray-100 text-[#6c757d]",
    };
    return colorMap[role] || "bg-gray-100 text-[#6c757d]";
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">
          {/* Left: branding */}
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl leading-tight">
                <span className="font-bold text-[#0F172A]">Talent</span>
                <span className="text-[#0F172A]">Track</span>
                <span className="font-bold text-[#7A1E1E]">UNC</span>
              </div>
              <p className="text-xs text-[#64748B] leading-none mt-0.5">
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
            {/* Notifications */}
            {onNotificationsClick && (
              <button
                className="relative h-9 w-9 rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:text-[#7A1E1E] hover:border-[#7A1E1E] transition-colors duration-150 flex items-center justify-center"
                onClick={onNotificationsClick}
                aria-label={
                  unreadNotifications > 0
                    ? `Notifications — ${unreadNotifications} unread`
                    : 'Notifications — no unread'
                }
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[#7A1E1E] text-white text-[9px] font-bold" aria-hidden="true">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>
            )}

            {/* User Info */}
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-[#F9EAEA] border border-[#7A1E1E]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#7A1E1E]" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{user.name}</p>
                <p className="text-[11px] text-[#64748B] leading-none mt-0.5">
                  {user.role === "director"
                    ? (user.talentGroup ? getTalentGroupName(user.talentGroup) : "Director")
                    : user.role === "admin"
                      ? "Admin"
                      : user.role === "scholar"
                        ? "Scholar"
                        : user.role === "trainee" || user.trainingStatus === "in_progress"
                          ? "Trainee"
                          : "Student"}
                </p>
              </div>
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 border border-[#7A1E1E] rounded-lg px-3 py-1.5 text-sm font-medium text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white transition-colors duration-200"
                  aria-label="Open settings menu"
                >
                  <SettingsIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('account')}>
                  <User className="w-4 h-4 mr-2" aria-hidden="true" />Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('security')}>
                  <Lock className="w-4 h-4 mr-2" aria-hidden="true" />Security
                </DropdownMenuItem>
                {showAdministration && (
                  <DropdownMenuItem onClick={() => setActiveTab('administration')}>
                    <Shield className="w-4 h-4 mr-2" aria-hidden="true" />Administration
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onNavigateBack && (
                  <DropdownMenuItem onClick={onNavigateBack}>
                    <User className="w-4 h-4 mr-2" aria-hidden="true" />Back to Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirmation(true)}
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-8">
        <div className="mb-6">
          <h1 className="text-[28px] leading-[36px] font-bold text-[#7A1E1E]">
            Settings
          </h1>
          <p className="text-[#6C757D] text-[14px] leading-[20px] mt-1">
            Manage your account, security, and system
            preferences
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white border border-[#E0E0E0] p-1 gap-1 w-full overflow-x-auto scrollbar-hide h-auto flex justify-start">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-[#7A1E1E] data-[state=active]:text-white px-3 sm:px-4 py-2 shrink-0 whitespace-nowrap"
            >
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[#7A1E1E] data-[state=active]:text-white px-3 sm:px-4 py-2 shrink-0 whitespace-nowrap"
            >
              <Lock className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            {showAdministration && (
              <TabsTrigger
                value="administration"
                className="data-[state=active]:bg-[#7A1E1E] data-[state=active]:text-white px-3 sm:px-4 py-2 shrink-0 whitespace-nowrap"
              >
                <Shield className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Administration</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="logout"
              className="data-[state=active]:bg-[#7A1E1E] data-[state=active]:text-white hover:bg-[#7A1E1E]/10 hover:text-[#7A1E1E] ml-auto px-3 sm:px-4 py-2 shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Section */}
          <TabsContent value="account">
            <Card className="border-[#E0E0E0]">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A]">
                  Account Details
                </CardTitle>
                <CardDescription className="text-[#6C757D]">
                  View and manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-full-name" className="text-[#6C757D]">
                    Full Name
                  </Label>
                  {editingName ? (
                    <>
                      <Alert className="bg-amber-50 border-amber-200 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <AlertDescription className="text-amber-700">
                          Warning: Changing your name will
                          update how your name appears
                          throughout the system.
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-2">
                        <Input
                          id="edit-full-name"
                          value={newName}
                          onChange={(e) =>
                            setNewName(e.target.value)
                          }
                          className="flex-1"
                          autoFocus
                          aria-required="true"
                        />
                        <Button
                          onClick={handleSaveName}
                          className="bg-[#7A1E1E] hover:bg-[#6A1919]"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingName(false);
                            setNewName(user.name);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                      <span className="text-[#1A1A1A]">
                        {user.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="text-[#7A1E1E] hover:text-[#6A1919] hover:bg-[#7A1E1E]/10"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label className="text-[#6C757D]">
                    Email Address
                  </Label>
                  <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                    <span className="text-[#1A1A1A]">
                      {user.email}
                    </span>
                  </div>
                  <p className="text-xs text-[#6C757D]">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Account Role */}
                <div className="space-y-2">
                  <Label className="text-[#6C757D]">
                    Account Role
                  </Label>
                  <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                    <Badge
                      className={getRoleBadgeColor(user.role)}
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6C757D]">
                    Role is managed by system administrators
                  </p>
                </div>

                {/* Account Status */}
                <div className="space-y-2">
                  <Label className="text-[#6C757D]">
                    Account Status
                  </Label>
                  <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                    <Badge className="bg-[#28a745] text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Section */}
          <TabsContent value="security">
            <Card className="border-[#E0E0E0]">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A]">
                  Security Settings
                </CardTitle>
                <CardDescription className="text-[#6C757D]">
                  Update your password to keep your account
                  secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {passwordSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Password updated successfully
                    </AlertDescription>
                  </Alert>
                )}

                {passwordError && (
                  <Alert id="pw-error" role="alert" className="bg-red-50 border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {passwordError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-password"
                      className="text-[#6C757D]"
                    >
                      Current Password{" "}
                      <span className="text-red-600" aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      placeholder="Enter your current password"
                      className="border-[#E0E0E0]"
                      required
                      aria-required="true"
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? 'pw-error' : undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-[#6C757D]"
                    >
                      New Password{" "}
                      <span className="text-red-600" aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Enter your new password"
                      className="border-[#E0E0E0]"
                      required
                      aria-required="true"
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? 'pw-error' : undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-[#6C757D]"
                    >
                      Confirm New Password{" "}
                      <span className="text-red-600" aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm your new password"
                      className="border-[#E0E0E0]"
                      required
                      aria-required="true"
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? 'pw-error' : undefined}
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full sm:w-auto"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Administration Section - Director & Admin */}
          {showAdministration && (
            <TabsContent value="administration">
              {/* Deactivated Members Management */}
              <Card className="border-[#E0E0E0]">
                <CardHeader>
                  <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Deactivated Members
                  </CardTitle>
                  <CardDescription className="text-[#6C757D]">
                    View and manage deactivated accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deactivatedUsers.length === 0 ? (
                    <div className="text-center py-8 text-[#6C757D]">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No deactivated accounts</p>
                    </div>
                  ) : (
                    <div className="rounded-md border border-[#E0E0E0] overflow-auto max-h-[420px]">
                      <Table className="min-w-max">
                        <TableHeader>
                          <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA]">
                            <TableHead className="text-[#6C757D]">
                              Name
                            </TableHead>
                            <TableHead className="text-[#6C757D]">
                              Email
                            </TableHead>
                            <TableHead className="text-[#6C757D]">
                              Role
                            </TableHead>
                            <TableHead className="text-[#6C757D]">
                              Status
                            </TableHead>
                            <TableHead className="text-[#6C757D]">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deactivatedUsers.map(
                            (targetUser) => (
                              <TableRow key={targetUser.id}>
                                <TableCell className="text-[#1A1A1A]">
                                  {targetUser.name}
                                </TableCell>
                                <TableCell className="text-[#6C757D]">
                                  {targetUser.email}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getRoleBadgeColor(
                                      targetUser.role,
                                    )}
                                  >
                                    {getRoleLabel(
                                      targetUser.role,
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {/* Deactivated status - using burgundy theme color */}
                                  <Badge className="bg-[#7A1E1E]/10 text-[#7A1E1E] border border-[#7A1E1E]/20">
                                    Deactivated
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleActivateUser(
                                        targetUser,
                                      )
                                    }
                                    className="text-[#7A1E1E] border-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Activate
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Logout Section */}
          <TabsContent value="logout">
            <Card className="border-[#E0E0E0]">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A]">
                  Logout
                </CardTitle>
                <CardDescription className="text-[#6C757D]">
                  End your current session and return to the
                  login page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    You will be logged out and redirected to the
                    login page. Any unsaved changes will be
                    lost.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() =>
                    setShowLogoutConfirmation(true)
                  }
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout from Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Role Change Confirmation Dialog */}
      <Dialog
        open={showRoleConfirmation}
        onOpenChange={setShowRoleConfirmation}
      >
        <DialogContent className="border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A]">
              Confirm Role Change
            </DialogTitle>
            <DialogDescription className="text-[#6C757D]">
              Are you sure you want to change the role for this
              user?
            </DialogDescription>
          </DialogHeader>

          {selectedUserForRole && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                <span className="text-sm text-[#6C757D]">
                  User:
                </span>
                <span className="text-[#1A1A1A]">
                  {selectedUserForRole.name}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                <span className="text-sm text-[#6C757D]">
                  Current Role:
                </span>
                <Badge
                  className={getRoleBadgeColor(
                    selectedUserForRole.role,
                  )}
                >
                  {getRoleLabel(selectedUserForRole.role)}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                <span className="text-sm text-[#6C757D]">
                  New Role:
                </span>
                <Badge className={getRoleBadgeColor(newRole)}>
                  {getRoleLabel(newRole)}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Activation Confirmation Dialog */}
      <Dialog
        open={showActivationConfirmation}
        onOpenChange={setShowActivationConfirmation}
      >
        <DialogContent className="border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A]">
              Confirm Account Activation
            </DialogTitle>
            <DialogDescription className="text-[#6C757D]">
              Are you sure you want to activate this account?
            </DialogDescription>
          </DialogHeader>

          {selectedUserForActivation && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                <span className="text-sm text-[#6C757D]">
                  User:
                </span>
                <span className="text-[#1A1A1A]">
                  {selectedUserForActivation.name}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-md border border-[#E0E0E0]">
                <span className="text-sm text-[#6C757D]">
                  Email:
                </span>
                <span className="text-[#1A1A1A]">
                  {selectedUserForActivation.email}
                </span>
              </div>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  This account will be reactivated and the user
                  will regain access to the system.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setShowActivationConfirmation(false)
              }
            >
              Cancel
            </Button>
            <Button
              onClick={confirmActivation}
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Activate Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutConfirmation}
        onOpenChange={setShowLogoutConfirmation}
      >
        <DialogContent className="border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A]">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-[#6C757D]">
              Are you sure you want to logout? You will be
              redirected to the login page.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLogoutConfirmation(false);
                onLogout();
              }}
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}