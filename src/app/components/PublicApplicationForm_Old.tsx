import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import {
  Send, User, Phone, Home, GraduationCap,
  AlertCircle, X, Shield, ChevronRight, ChevronDown,
  ArrowLeft, FileText, Award,
} from './ui/icons';
import { Separator } from './ui/separator';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import marchingBandImage from 'figma:asset/b242c5c349e0b89983c68f7897a6a917cfadb783.png';
import majorettesImage from 'figma:asset/720c2c7918c80e99d38a856e37434c03a71dfb51.png';
import gleeClubImage from 'figma:asset/64360cbb01ae76c176fb14f1e5d341950738dfa7.png';
import danceClubImage from 'figma:asset/a2be20b0c6962239c4e654249dbc602dbc00c37e.png';
import {
  PH_REGIONS,
  PH_PROVINCES_BY_REGION,
  PH_CITIES_BY_PROVINCE,
  PH_BARANGAYS_BY_CITY,
} from './PhilippineAddressData';

interface PublicApplicationFormProps {
  onSubmit: (applicationData: ApplicationFormData) => void;
  onBack: () => void;
  talentGroup: string;
  onSelectGroup?: (group: string) => void;
}

export interface ApplicationFormData {
  // Personal Information
  fullName: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthdate: string;
  age: string;
  gender: string;

  // Permanent Address
  permRegion: string;
  permProvince: string;
  permCity: string;
  permBarangay: string;
  permStreet: string;

  // Residing Address
  residRegion: string;
  residProvince: string;
  residCity: string;
  residBarangay: string;
  residStreet: string;

  // Contact Information
  mobileNo: string;
  email: string;
  socialMediaLink: string;

  // Academic Information
  studentId: string;
  yearLevel: string;
  course: string;
  department: string;

  // Emergency Contact
  guardianName: string;
  guardianRelationship: string;
  guardianContactNo: string;

  // Talent Group
  talentGroup: 'marching-band' | 'glee-club' | 'majorettes' | 'dance-club' | '';

  // Group-specific (kept for backward compat)
  hasBandExperience: boolean | null;
  vocalRange: string;
  previousSingingExperience: string;
  musicalBackground: string;
  primaryDanceGenre: string;
  yearsOfExperience: string;
  performedOnStage: string;
  willingToAttendRehearsals: string;
  previousMajoretteTeam: string;
  previousOrganization: string;
  canPerformBasicRoutines: string;
  willingToAttendRehearsalsMajorettes: string;

  // Consent
  dataPrivacyConsent: boolean;
  confirmedAccuracy: boolean;

  // Legacy
  address: string;
  guardianName_legacy?: string;

  submittedAt: Date;
}

const TALENT_GROUPS = [
  { value: 'marching-band', label: 'Marching Band', desc: 'Precision, rhythm & musical excellence', longDesc: 'Perform at university events, parades, and competitions with brass, woodwind, and percussion instruments.', icon: marchingBandImage },
  { value: 'glee-club',     label: 'Glee Club',     desc: 'Vocal harmony & choral tradition',      longDesc: 'Showcase your vocal talent in choral performances, university concerts, and regional competitions.', icon: gleeClubImage },
  { value: 'majorettes',    label: 'Majorettes',    desc: 'Grace, coordination & showmanship',     longDesc: 'Combine dance and precision movements to enhance band performances at parades and special events.', icon: majorettesImage },
  { value: 'dance-club',    label: 'Dance Club',    desc: 'Movement, expression & artistry',       longDesc: 'Express yourself through various dance styles in university performances and inter-school competitions.', icon: danceClubImage },
];

const DEPARTMENTS = [
  { value: 'College of Engineering & Architecture', label: 'College of Engineering & Architecture' },
  { value: 'College of Business & Accountancy', label: 'College of Business & Accountancy' },
  { value: 'College of Arts & Sciences', label: 'College of Arts & Sciences' },
  { value: 'College of Computer Science', label: 'College of Computer Science' },
  { value: 'College of Education', label: 'College of Education' },
  { value: 'College of Criminal Justice Education', label: 'College of Criminal Justice Education' },
  { value: 'Senior High School', label: 'Senior High School' },
];

const COURSES: Record<string, string[]> = {
  'College of Engineering & Architecture': [
    'BS Civil Engineering', 'BS Mechanical Engineering', 'BS Electrical Engineering',
    'BS Electronics Engineering', 'BS Computer Engineering', 'BS Architecture',
  ],
  'College of Business & Accountancy': [
    'BS Accountancy', 'BS Accounting Information Systems',
    'BS Business Administration – Financial Management',
    'BS Business Administration – Marketing Management',
    'BS Entrepreneurship', 'BS Hospitality Management',
  ],
  'College of Arts & Sciences': [
    'BA Political Science', 'BA Psychology', 'BS Biology',
  ],
  'College of Computer Science': [
    'BS Computer Science', 'BS Information Technology', 'BS Library and Information Science',
  ],
  'College of Education': [
    'Bachelor of Elementary Education', 'BS Physical Education',
    'BS Secondary Education – Science', 'BS Secondary Education – Filipino',
    'BS Secondary Education – Social Studies', 'BS Secondary Education – English',
    'BS Secondary Education – Mathematics',
  ],
  'College of Criminal Justice Education': ['BS Criminology'],
  'Senior High School': [
    'STEM', 'ABM', 'HUMSS', 'ICT', 'HE', 'IA', 'GAS',
  ],
};

const COLLEGE_YEAR_LEVELS = ['Incoming 1st Year', 'Incoming 2nd Year'];
const SHS_YEAR_LEVELS = ['Grade 11', 'Grade 12'];
const RELATIONSHIP_OPTIONS = ['Parent', 'Sibling', 'Aunt/Uncle', 'Grandparent'];

const COUNTRY_CODES = [
  { code: '+63', label: '🇵🇭 +63' },
  { code: '+1',  label: '🇺🇸 +1'  },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+82', label: '🇰🇷 +82' },
  { code: '+852',label: '🇭🇰 +852'},
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+971',label: '🇦🇪 +971'},
  { code: '+966',label: '🇸🇦 +966'},
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const toTitleCase = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

const formatPhoneDigits = (raw: string) => {
  // Keep only digits, max 10, must start with 9
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  return digits;
};

const displayPhone = (digits: string) => {
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const formatStudentId = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 7);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const calculateAge = (birthdate: string): string => {
  if (!birthdate) return '';
  const today = new Date();
  const bd = new Date(birthdate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age.toString();
};

// Max birthdate = today minus 15 years
const getMaxBirthdate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 15);
  return d.toISOString().split('T')[0];
};

// ── Address sub-form ──────────────────────────────────────────────────────────

interface AddressBlockProps {
  prefix: 'perm' | 'resid';
  label: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

function AddressBlock({ prefix, label, region, province, city, barangay, street, errors, onChange }: AddressBlockProps) {
  const provinces = region ? PH_PROVINCES_BY_REGION[region] || [] : [];
  const cities = province ? PH_CITIES_BY_PROVINCE[province] || [] : [];
  const barangays = city ? PH_BARANGAYS_BY_CITY[city] || [] : [];
  const hasBarangayDropdown = barangays.length > 0;

  const field = (f: string) => `${prefix}_${f}`;

  return (
    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-[#7A1E1E] border-b border-[#e0e0e0] pb-1">{label}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Region */}
        <div>
          <Label className="text-xs">Region *</Label>
          <Select value={region} onValueChange={(v) => { onChange(field('region'), v); onChange(field('province'), ''); onChange(field('city'), ''); onChange(field('barangay'), ''); }}>
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {PH_REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors[field('region')] && <p className="text-red-500 text-xs mt-1">{errors[field('region')]}</p>}
        </div>

        {/* Province */}
        <div>
          <Label className="text-xs">Province *</Label>
          <Select value={province} disabled={!region} onValueChange={(v) => { onChange(field('province'), v); onChange(field('city'), ''); onChange(field('barangay'), ''); }}>
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue placeholder={region ? 'Select province' : 'Select region first'} />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors[field('province')] && <p className="text-red-500 text-xs mt-1">{errors[field('province')]}</p>}
        </div>

        {/* City/Municipality */}
        <div>
          <Label className="text-xs">City / Municipality *</Label>
          <Select value={city} disabled={!province} onValueChange={(v) => { onChange(field('city'), v); onChange(field('barangay'), ''); }}>
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue placeholder={province ? 'Select city' : 'Select province first'} />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors[field('city')] && <p className="text-red-500 text-xs mt-1">{errors[field('city')]}</p>}
        </div>

        {/* Barangay */}
        <div>
          <Label className="text-xs">Barangay *</Label>
          {hasBarangayDropdown ? (
            <Select value={barangay} disabled={!city} onValueChange={(v) => onChange(field('barangay'), v)}>
              <SelectTrigger className="mt-1 h-9 text-sm">
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {barangays.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <div className="relative mt-1">
              <input
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                placeholder={city ? 'Type barangay name' : 'Select city first'}
                disabled={!city}
                value={barangay}
                onChange={(e) => onChange(field('barangay'), toTitleCase(e.target.value))}
              />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          )}
          {errors[field('barangay')] && <p className="text-red-500 text-xs mt-1">{errors[field('barangay')]}</p>}
        </div>
      </div>

      {/* Street */}
      <div>
        <Label className="text-xs">Street Name / Building / House No. *</Label>
        <Input
          className="mt-1 h-9 text-sm"
          placeholder="e.g. 123 Mayon St., Brgy. Centro"
          value={street}
          onChange={(e) => onChange(field('street'), toTitleCase(e.target.value))}
        />
        {errors[field('street')] && <p className="text-red-500 text-xs mt-1">{errors[field('street')]}</p>}
      </div>
    </div>
  );
}

// ── Phone Input ───────────────────────────────────────────────────────────────

interface PhoneInputProps {
  id: string;
  value: string;
  onChange: (digits: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  error?: string;
  required?: boolean;
}

function PhoneInput({ id, value, onChange, countryCode, onCountryCodeChange, error, required }: PhoneInputProps) {
  return (
    <div>
      <div className="flex mt-1">
        <Select value={countryCode} onValueChange={onCountryCodeChange}>
          <SelectTrigger className="w-[90px] rounded-r-none border-r-0 h-9 text-xs shrink-0 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_CODES.map(cc => (
              <SelectItem key={cc.code} value={cc.code} className="text-sm">{cc.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          type="tel"
          className="rounded-l-none h-9 text-sm"
          placeholder="9XX-XXX-XXXX"
          value={displayPhone(value)}
          required={required}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            onChange(formatPhoneDigits(raw));
          }}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PublicApplicationForm({ onSubmit, onBack, talentGroup: initialGroup, onSelectGroup }: PublicApplicationFormProps) {
  const emptyForm = (): ApplicationFormData => ({
    fullName: '',
    lastName: '',
    firstName: '',
    middleName: '',
    birthdate: '',
    age: '',
    gender: '',
    permRegion: '',
    permProvince: '',
    permCity: '',
    permBarangay: '',
    permStreet: '',
    residRegion: '',
    residProvince: '',
    residCity: '',
    residBarangay: '',
    residStreet: '',
    mobileNo: '',
    email: '',
    socialMediaLink: '',
    studentId: '',
    yearLevel: '',
    course: '',
    department: '',
    guardianName: '',
    guardianRelationship: '',
    guardianContactNo: '',
    talentGroup: initialGroup as any,
    hasBandExperience: null as any,
    vocalRange: '',
    previousSingingExperience: '',
    musicalBackground: '',
    primaryDanceGenre: '',
    yearsOfExperience: '',
    performedOnStage: '',
    willingToAttendRehearsals: '',
    previousMajoretteTeam: '',
    previousOrganization: '',
    canPerformBasicRoutines: '',
    willingToAttendRehearsalsMajorettes: '',
    dataPrivacyConsent: false,
    confirmedAccuracy: false,
    address: '',
    submittedAt: new Date(),
  });

  const [formData, setFormData] = useState<ApplicationFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [mobileCC, setMobileCC] = useState('+63');
  const [guardianCC, setGuardianCC] = useState('+63');

  const update = <K extends keyof ApplicationFormData>(field: K, value: ApplicationFormData[K]) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const setError = (field: string, msg: string) =>
    setErrors(prev => ({ ...prev, [field]: msg }));
  const clearError = (field: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const handleAddressChange = (field: string, value: string) => {
    // Convert perm_region → permRegion, resid_street → residStreet, etc.
    const parts = field.split('_');
    const key = (parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')) as keyof ApplicationFormData;
    update(key, value as any);
    clearError(field);

    // Mirror to resid if "same as permanent" is active
    if (sameAsPermanent && parts[0] === 'perm') {
      const residKey = ('resid' + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')) as keyof ApplicationFormData;
      update(residKey, value as any);
    }
  };

  const handleSameAsPermanent = (checked: boolean) => {
    setSameAsPermanent(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        residRegion: prev.permRegion,
        residProvince: prev.permProvince,
        residCity: prev.permCity,
        residBarangay: prev.permBarangay,
        residStreet: prev.permStreet,
      }));
    }
  };

  const handleBirthdate = (value: string) => {
    update('birthdate', value);
    update('age', calculateAge(value));
  };

  const getYearLevels = () => {
    if (!formData.department) return [];
    if (formData.department === 'Senior High School') return SHS_YEAR_LEVELS;
    return COLLEGE_YEAR_LEVELS;
  };

  const getDepartments = () => {
    if (formData.talentGroup === 'marching-band') return DEPARTMENTS;
    return DEPARTMENTS.filter(d => d.value !== 'Senior High School');
  };

  const isMajorettes = formData.talentGroup === 'majorettes';

  const validatePhone = (digits: string, cc: string) =>
    cc === '+63' ? (digits.length === 10 && digits.startsWith('9')) : digits.length >= 7;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required';
    else if (parseInt(formData.age) < 15) newErrors.birthdate = 'You must be at least 15 years old to apply';
    if (!isMajorettes && !formData.gender) newErrors.gender = 'Gender is required';

    // Permanent address
    if (!formData.permRegion) newErrors.perm_region = 'Required';
    if (!formData.permProvince) newErrors.perm_province = 'Required';
    if (!formData.permCity) newErrors.perm_city = 'Required';
    if (!formData.permBarangay) newErrors.perm_barangay = 'Required';
    if (!formData.permStreet.trim()) newErrors.perm_street = 'Required';

    // Residing address (only if different from permanent)
    if (!sameAsPermanent) {
      if (!formData.residRegion) newErrors.resid_region = 'Required';
      if (!formData.residProvince) newErrors.resid_province = 'Required';
      if (!formData.residCity) newErrors.resid_city = 'Required';
      if (!formData.residBarangay) newErrors.resid_barangay = 'Required';
      if (!formData.residStreet.trim()) newErrors.resid_street = 'Required';
    }

    if (!formData.mobileNo) newErrors.mobileNo = 'Mobile number is required';
    else if (!validatePhone(formData.mobileNo, mobileCC)) newErrors.mobileNo = mobileCC === '+63' ? 'Must be 10 digits starting with 9' : 'Enter a valid number';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!formData.email.includes('@')) newErrors.email = 'Invalid email address';

    if (formData.studentId && !/^\d{2}-\d{5}$/.test(formData.studentId)) {
      newErrors.studentId = 'Format must be XX-XXXXX (e.g. 24-12345)';
    }

    if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
    if (!formData.guardianRelationship) newErrors.guardianRelationship = 'Relationship is required';
    if (!formData.guardianContactNo) newErrors.guardianContactNo = 'Contact number is required';
    else if (!validatePhone(formData.guardianContactNo, guardianCC)) newErrors.guardianContactNo = guardianCC === '+63' ? 'Must be 10 digits starting with 9' : 'Enter a valid number';

    if (!formData.dataPrivacyConsent) newErrors.dataPrivacyConsent = 'You must agree to the Data Privacy consent';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix all errors before submitting.');
      const firstKey = Object.keys(newErrors)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Build composite fields for backward compatibility
    const fullName = `${formData.lastName}, ${formData.firstName}${formData.middleName ? ' ' + formData.middleName : ''}`;
    const address = `${formData.permStreet}, ${formData.permBarangay}, ${formData.permCity}, ${formData.permProvince}`;
    const gender = isMajorettes ? 'Female' : formData.gender;

    const finalData: ApplicationFormData = {
      ...formData,
      fullName,
      address,
      gender,
      confirmedAccuracy: true,
      mobileNo: `${mobileCC}${formData.mobileNo}`,
      guardianContactNo: `${guardianCC}${formData.guardianContactNo}`,
      submittedAt: new Date(),
    };

    onSubmit(finalData);
    const groupName = TALENT_GROUPS.find(g => g.value === formData.talentGroup)?.label || '';
    toast.success(`Application submitted! Check your email for updates on your ${groupName} application.`, { duration: 6000 });
    setTimeout(() => window.location.reload(), 2000);
  };

  // ── Group selection screen ──────────────────────────────────────────────────
  if (!formData.talentGroup) {
    const journeySteps = [
      { num: 1, label: 'Submit Application', sub: 'Fill out the form with your details', color: '#7A1E1E', gold: false },
      { num: 2, label: 'Audition',           sub: 'Showcase your talent',               color: '#7A1E1E', gold: false },
      { num: 3, label: 'Training',           sub: 'Practice & develop skills',           color: '#7A1E1E', gold: false },
      { num: 4, label: 'Official Scholar',   sub: "You're one of us!",                   color: '#C49A2A', gold: true  },
    ];

    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={uncLogo} alt="UNC" className="w-12 h-12 object-contain" />
              <div>
                <p className="text-[#7A1E1E] text-base leading-tight">TalentTrackUNC</p>
                <p className="text-xs text-[#6B7280]">Scholarship Application Portal</p>
              </div>
            </div>
            <button type="button" onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 border border-[#7A1E1E] rounded-md text-[#7A1E1E] text-sm bg-[#F7F8FA] hover:bg-[#7A1E1E]/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-5xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl text-[#7A1E1E] mb-3">Choose Your Talent Group</h1>
            <div className="w-24 h-1 bg-[#e9c0c0] mx-auto mb-4 rounded-full" />
            <p className="text-[#6c757d] text-lg">Choose a talent group to apply for and start your journey as a UNC talent scholar.</p>
          </div>

          {/* Application Journey Card */}
          <div className="rounded-2xl border border-[#7A1E1E]/10 shadow-lg mb-8 overflow-hidden"
            style={{ background: 'linear-gradient(164deg, rgba(122,30,30,0.05) 0%, #ffffff 50%, rgba(255,251,235,0.3) 100%)' }}>
            <div className="px-10 pt-10 pb-8">
              <div className="text-center mb-8">
                <p className="text-[#7A1E1E] text-base">Your Application Journey</p>
                <p className="text-[#6B7280] text-sm mt-1">Follow these steps to become a UNC talent scholar</p>
              </div>
              <div className="flex items-start justify-center gap-0">
                {journeySteps.map((step, i) => (
                  <div key={step.num} className="flex items-start">
                    <div className="flex flex-col items-center w-36 text-center">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${step.color} 0%, ${step.gold ? '#B8860B' : '#6A1919'} 100%)` }}>
                          {step.gold
                            ? <Award className="w-7 h-7 text-white" />
                            : <FileText className="w-7 h-7 text-white" />}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-xs shadow"
                          style={{ borderColor: step.color, color: step.color, fontWeight: 700 }}>
                          {step.num}
                        </span>
                      </div>
                      <p className="text-sm text-[#1a1a1a] leading-tight mb-1">{step.label}</p>
                      <p className="text-xs text-[#6c757d] leading-tight">{step.sub}</p>
                    </div>
                    {i < journeySteps.length - 1 && (
                      <div className="flex items-center mt-7 mx-1 shrink-0">
                        <div className="h-[3px] w-16 rounded-full relative" style={{ background: 'linear-gradient(90deg, #7A1E1E, rgba(122,30,30,0.4))' }}>
                          <span className="absolute -top-[2.5px] right-0 w-2 h-2 rounded-full bg-[#e9c0c0] shadow-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Talent Group Cards */}
          <div className="space-y-5">
            {TALENT_GROUPS.map((group) => (
              <div key={group.value} className="bg-white rounded-xl border border-[#e0e0e0] shadow overflow-hidden flex"
                style={{ minHeight: '240px' }}>
                {/* Left: text + buttons */}
                <div className="flex flex-col justify-between p-10 w-1/2 shrink-0">
                  <div>
                    <p className="text-[#880808] text-lg mb-3">{group.label}</p>
                    <p className="text-[#6c757d] text-sm leading-relaxed">{group.longDesc}</p>
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <button type="button" onClick={onBack}
                      className="w-full rounded-lg py-3 flex items-center justify-center gap-2 text-[#880808] text-sm transition-colors hover:bg-[rgba(136,8,8,0.15)]"
                      style={{ background: 'rgba(136,8,8,0.08)' }}>
                      <FileText className="w-4 h-4" />
                      View Requirements
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => { update('talentGroup', group.value as any); onSelectGroup?.(group.value); }}
                      className="w-full bg-[#880808] hover:bg-[#6d0606] text-white rounded-md py-2.5 flex items-center justify-center gap-2 text-sm transition-colors">
                      <Send className="w-4 h-4" />
                      Apply Now
                    </button>
                  </div>
                </div>
                {/* Right: image */}
                <div className="flex-1 relative">
                  <img src={group.icon} alt={group.label} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(270deg, transparent 0%, rgba(136,8,8,0.18) 100%)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Application form ────────────────────────────────────────────────────────
  const groupLabel = TALENT_GROUPS.find(g => g.value === formData.talentGroup)?.label || '';

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <img src={uncLogo} alt="UNC Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="unc-burgundy-text">TalentTrackUNC</h1>
            <p className="text-sm text-muted-foreground">Scholarship Application</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="unc-burgundy-text text-2xl">{groupLabel} Application Form</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">University of Nueva Caceres</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => { update('talentGroup', '' as any); onSelectGroup?.(''); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">

              {/* ── 1. Personal Information ── */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 pl-3 border-l-4 border-[#7A1E1E]">
                  <User className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                  <h3 className="unc-burgundy-text text-sm uppercase tracking-wide">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Last Name *</Label>
                    <Input id="lastName" className="mt-1 h-9" placeholder="Dela Cruz" value={formData.lastName}
                      onChange={(e) => { update('lastName', toTitleCase(e.target.value)); clearError('lastName'); }} />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">First Name *</Label>
                    <Input id="firstName" className="mt-1 h-9" placeholder="Juan" value={formData.firstName}
                      onChange={(e) => { update('firstName', toTitleCase(e.target.value)); clearError('firstName'); }} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Middle Name</Label>
                    <Input id="middleName" className="mt-1 h-9" placeholder="Santos" value={formData.middleName}
                      onChange={(e) => update('middleName', toTitleCase(e.target.value))} />
                  </div>
                </div>

                <div className={`grid grid-cols-1 gap-3 ${isMajorettes ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                  <div>
                    <Label className="text-xs text-gray-600">Birthdate *</Label>
                    <Input id="birthdate" type="date" className="mt-1 h-9" max={getMaxBirthdate()} value={formData.birthdate}
                      style={{ colorScheme: 'light' }}
                      onChange={(e) => { handleBirthdate(e.target.value); clearError('birthdate'); }} />
                    {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Age</Label>
                    <Input id="age" className="mt-1 h-9 bg-gray-50 text-gray-500"
                      value={formData.age ? `${formData.age} years old` : ''} readOnly disabled placeholder="—" />
                  </div>
                  {!isMajorettes && (
                    <div>
                      <Label className="text-xs text-gray-600">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(v) => { update('gender', v); clearError('gender'); }}>
                        <SelectTrigger id="gender" className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* ── 2. Address ── */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 pl-3 border-l-4 border-[#7A1E1E]">
                  <Home className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                  <h3 className="unc-burgundy-text text-sm uppercase tracking-wide">Address</h3>
                </div>

                <AddressBlock prefix="perm" label="Permanent Address"
                  region={formData.permRegion} province={formData.permProvince}
                  city={formData.permCity} barangay={formData.permBarangay} street={formData.permStreet}
                  errors={errors} onChange={handleAddressChange} />

                <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => handleSameAsPermanent(!sameAsPermanent)}>
                  <Checkbox id="sameAsPermanent" checked={sameAsPermanent}
                    onCheckedChange={(c) => handleSameAsPermanent(!!c)}
                    className="shrink-0" />
                  <span className="text-sm text-gray-600 leading-none">Residing address is the same as permanent address</span>
                </div>

                {!sameAsPermanent && (
                  <AddressBlock prefix="resid" label="Residing Address"
                    region={formData.residRegion} province={formData.residProvince}
                    city={formData.residCity} barangay={formData.residBarangay} street={formData.residStreet}
                    errors={errors} onChange={handleAddressChange} />
                )}
              </div>

              <Separator />

              {/* ── 3. Contact Information ── */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 pl-3 border-l-4 border-[#7A1E1E]">
                  <Phone className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                  <h3 className="unc-burgundy-text text-sm uppercase tracking-wide">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Mobile Number *</Label>
                    <PhoneInput id="mobileNo" value={formData.mobileNo}
                      onChange={(v) => { update('mobileNo', v); clearError('mobileNo'); }}
                      countryCode={mobileCC} onCountryCodeChange={setMobileCC}
                      error={errors.mobileNo} required />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Email Address *</Label>
                    <Input id="email" type="email" className="mt-1 h-9" placeholder="juan@unc.edu.ph"
                      value={formData.email}
                      onChange={(e) => { update('email', e.target.value); clearError('email'); }} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── 4. Academic Information ── */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 pl-3 border-l-4 border-[#7A1E1E]">
                  <GraduationCap className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                  <h3 className="unc-burgundy-text text-sm uppercase tracking-wide">Academic Information</h3>
                </div>

                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Only fill this section if you are already enrolled or have your academic details available.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Student ID</Label>
                    <Input id="studentId" className="mt-1 h-9" placeholder="24-12345"
                      value={formData.studentId} maxLength={8}
                      onChange={(e) => { update('studentId', formatStudentId(e.target.value)); clearError('studentId'); }} />
                    {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Department / School</Label>
                    <Select value={formData.department} onValueChange={(v) => { update('department', v); update('yearLevel', ''); update('course', ''); }}>
                      <SelectTrigger id="department" className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {getDepartments().map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Year Level</Label>
                    <Select value={formData.yearLevel} disabled={!formData.department} onValueChange={(v) => update('yearLevel', v)}>
                      <SelectTrigger id="yearLevel" className="mt-1 h-9">
                        <SelectValue placeholder={formData.department ? 'Select' : 'Select department first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {getYearLevels().map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Course / Strand</Label>
                    <Select value={formData.course} disabled={!formData.department} onValueChange={(v) => update('course', v)}>
                      <SelectTrigger id="course" className="mt-1 h-9">
                        <SelectValue placeholder={formData.department ? 'Select' : 'Select department first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(COURSES[formData.department] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── 5. Emergency Contact ── */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2 pl-3 border-l-4 border-[#7A1E1E]">
                  <Phone className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                  <h3 className="unc-burgundy-text text-sm uppercase tracking-wide">Emergency Contact</h3>
                </div>

                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                  Please provide a parent or legal guardian as your emergency contact.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Guardian Name *</Label>
                    <Input id="guardianName" className="mt-1 h-9" placeholder="Maria Dela Cruz"
                      value={formData.guardianName}
                      onChange={(e) => { update('guardianName', toTitleCase(e.target.value)); clearError('guardianName'); }} />
                    {errors.guardianName && <p className="text-red-500 text-xs mt-1">{errors.guardianName}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Relationship *</Label>
                    <Select value={formData.guardianRelationship} onValueChange={(v) => { update('guardianRelationship', v); clearError('guardianRelationship'); }}>
                      <SelectTrigger id="guardianRelationship" className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.guardianRelationship && <p className="text-red-500 text-xs mt-1">{errors.guardianRelationship}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-gray-600">Contact Number *</Label>
                    <PhoneInput id="guardianContactNo" value={formData.guardianContactNo}
                      onChange={(v) => { update('guardianContactNo', v); clearError('guardianContactNo'); }}
                      countryCode={guardianCC} onCountryCodeChange={setGuardianCC}
                      error={errors.guardianContactNo} required />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── 6. Data Privacy Consent ── */}
              <div className="px-6 py-5 space-y-4 bg-gray-50 rounded-b-xl">
                <div className="flex items-center gap-2 pl-3 border-l-4 border-[#7A1E1E]">
                  <Shield className="w-4 h-4 text-[#7A1E1E] shrink-0" />
                  <h3 className="unc-burgundy-text text-sm uppercase tracking-wide">Privacy & Consent</h3>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  In accordance with the <strong className="text-gray-800">Data Privacy Act of 2012 (RA 10173)</strong>, UNC will use your information solely to process this scholarship application. Your data will not be shared with third parties without consent.
                </p>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    id="dataPrivacyConsent"
                    checked={formData.dataPrivacyConsent}
                    onCheckedChange={(c) => { update('dataPrivacyConsent', !!c as any); clearError('dataPrivacyConsent'); }}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    I consent to the collection and processing of my personal data, and confirm that all information I provided is accurate and complete.
                  </span>
                </label>
                {errors.dataPrivacyConsent && <p className="text-red-500 text-xs">{errors.dataPrivacyConsent}</p>}

                <div className="flex justify-end pt-1">
                  <Button type="submit" disabled={!formData.dataPrivacyConsent}
                    className="bg-[#7A1E1E] hover:bg-[#6A1919] text-white px-10 h-10 rounded-lg disabled:opacity-50">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
