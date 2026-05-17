import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft } from './ui/icons';
import { toast } from 'sonner';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';

interface AuthPageProps {
  onLogin: (email: string, password: string, role: string) => { success: boolean; error?: string };
  onBack: () => void;
}

export function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [loginData, setLoginData] = useState({
    role: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<string>('');

  // Test account quick login options
  const testAccounts = [
    { role: 'Admin', email: 'admin@unc.edu.ph', name: 'Test Admin' },
    { role: 'Director - Marching Band', email: 'm.santos@unc.edu.ph', name: 'Prof. Michael Santos' },
    { role: 'Director - Majorettes', email: 'p.reyes@unc.edu.ph', name: 'Ms. Patricia Reyes' },
    { role: 'Director - Glee Club', email: 'c.villanueva@unc.edu.ph', name: 'Prof. Carmen Villanueva' },
    { role: 'Director - Dance Club', email: 'i.torres@unc.edu.ph', name: 'Ms. Isabella Torres' },
    { role: 'Scholar (Completed)', email: 'scholar@unc.edu.ph', name: 'Test Scholar' },
    { role: 'Trainee - Marching Band', email: 'roberto.villanueva@unc.edu.ph', name: 'Roberto Villanueva' },
    { role: 'Trainee - Majorettes', email: 'isabella.perez@unc.edu.ph', name: 'Isabella Grace Perez' },
    { role: 'Trainee - Glee Club', email: 'training@unc.edu.ph', name: 'Test Training Student' },
    { role: 'Trainee - Dance Club', email: 'rafael.santiago@unc.edu.ph', name: 'Rafael Santiago' },
  ];

  const handleQuickLogin = (email: string) => {
    setLoginData({ role: '', email, password: 'test123' });
    toast.success('Test account loaded! Click Sign In to continue.');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    
    if (!loginData.role) {
      setErrors('Please select your account role');
      toast.error('Please select your account role');
      return;
    }
    
    if (!loginData.email || !loginData.password) {
      setErrors('Please fill in all fields');
      return;
    }

    const result = onLogin(loginData.email, loginData.password, loginData.role);
    if (!result.success) {
      setErrors(result.error || 'Login failed');
      toast.error(result.error || 'Invalid email or password');
    } else {
      toast.success('Login successful! Welcome to TalentTrackUNC');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#7A1E1E]/5 via-white to-amber-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Button - Top Left Corner */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
        className="absolute top-4 left-4 unc-burgundy-text hover:bg-[#7A1E1E]/10 transition-all duration-200 hover:scale-110 rounded-full w-10 h-10"
        aria-label="Go back to home page"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </Button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-3">
            <img 
              src={uncLogo} 
              alt="UNC Logo" 
              className="w-14 h-14 object-contain"
              width="56"
              height="56"
              loading="eager"
              fetchpriority="high"
            />
          </div>
          <h1 className="text-2xl unc-burgundy-text mb-1">TalentTrackUNC</h1>
          <p className="text-sm text-muted-foreground">University of Nueva Caceres</p>
        </div>

        <Card className="card-unc shadow-xl border-[#7A1E1E]/20 border-2 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-3 pt-5">
            <CardTitle className="unc-burgundy-text text-xl mb-1">Welcome Back</CardTitle>
            <CardDescription className="text-sm">
              Sign in with your UNC credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="login-role" className="text-gray-700 text-sm">
                  Login As: <span className="text-red-600" aria-hidden="true">*</span>
                </Label>
                <Select 
                  value={loginData.role} 
                  onValueChange={(value) => setLoginData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger
                    id="login-role"
                    className="h-10 border-gray-300 focus:border-[#7A1E1E] focus:ring-[#7A1E1E]/20"
                    aria-required="true"
                    aria-invalid={!!errors && !loginData.role}
                    aria-describedby={errors ? 'login-error' : undefined}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="scholar">Scholar</SelectItem>
                    <SelectItem value="trainee">Trainee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-gray-700 text-sm">
                  Email <span className="text-red-600" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your.email@unc.edu.ph"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-10 border-gray-300 focus:border-[#7A1E1E] focus:ring-[#7A1E1E]/20"
                  required
                  aria-required="true"
                  aria-invalid={!!errors && !loginData.email}
                  aria-describedby={errors ? 'login-error' : undefined}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-gray-700 text-sm">
                  Password <span className="text-red-600" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="h-10 border-gray-300 focus:border-[#7A1E1E] focus:ring-[#7A1E1E]/20"
                  required
                  aria-required="true"
                  aria-invalid={!!errors && !loginData.password}
                  aria-describedby={errors ? 'login-error' : undefined}
                />
              </div>
              <Button type="submit" className="w-full btn-unc h-10 mt-5 shadow-md hover:shadow-lg transition-shadow">
                Sign In
              </Button>
            </form>

            {errors && (
              <Alert
                id="login-error"
                role="alert"
                variant="destructive"
                className="mt-3 border-red-300 bg-red-50"
              >
                <AlertDescription className="text-sm">{errors}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}