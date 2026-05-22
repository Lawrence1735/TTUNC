import React, { useState, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import {
  Send, User, Phone, GraduationCap, Shield, 
  MapPin, Lock, ArrowLeft
} from './ui/icons';
import { Separator } from './ui/separator';
import { SuccessConfirmation } from './SuccessConfirmation';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import marchingBandImage from 'figma:asset/b242c5c349e0b89983c68f7897a6a917cfadb783.png';
import majorettesImage from 'figma:asset/720c2c7918c80e99d38a856e37434c03a71dfb51.png';
import gleeClubImage from 'figma:asset/64360cbb01ae76c176fb14f1e5d341950738dfa7.png';
import danceClubImage from 'figma:asset/a2be20b0c6962239c4e654249dbc602dbc00c37e.png';
import {
  PH_REGIONS, PH_PROVINCES_BY_REGION, PH_CITIES_BY_PROVINCE, PH_BARANGAYS_BY_CITY,
} from './PhilippineAddressData';

interface PublicApplicationFormProps {
  onSubmit: (applicationData: ApplicationFormData) => void;
  onBack: () => void;
  talentGroup: string;
  onSelectGroup?: (group: string) => void;
}

export interface ApplicationFormData {
  fullName: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthdate: string;
  age: string;
  gender: string;
  permRegion: string;
  permProvince: string;
  permCity: string;
  permBarangay: string;
  permStreet: string;
  residRegion: string;
  residProvince: string;
  residCity: string;
  residBarangay: string;
  residStreet: string;
  mobileNo: string;
  email: string;
  studentId: string;
  yearLevel: string;
  course: string;
  department: string;
  guardianLastName: string;
  guardianFirstName: string;
  guardianMiddleName: string;
  guardianRelationship: string;
  guardianContactNo: string;
  talentGroup: 'marching-band' | 'glee-club' | 'majorettes' | 'dance-club' | '';
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
  dataPrivacyConsent: boolean;
  confirmedAccuracy: boolean;
  address: string;
}

const TALENT_GROUPS = [
  { value: 'marching-band', label: 'Marching Band', image: marchingBandImage },
  { value: 'glee-club', label: 'Glee Club', image: gleeClubImage },
  { value: 'majorettes', label: 'Majorettes', image: majorettesImage },
  { value: 'dance-club', label: 'Dance Club', image: danceClubImage },
];

const RELATIONSHIP_OPTIONS = ['Parent', 'Guardian', 'Sibling', 'Relative', 'Other'];
const VOCAL_RANGES = ['Soprano', 'Alto', 'Tenor', 'Bass', 'Baritone'];
const DEPARTMENTS = [
  { value: 'cas', label: 'College of Arts & Sciences' },
  { value: 'cct', label: 'College of Computer & IT' },
];
const COURSES: Record<string, string[]> = {
  cas: ['BS Psychology', 'BS Nursing', 'BS Education'],
  cct: ['BS Computer Science', 'BS Information Technology'],
};

function PhoneInput({ 
  value, 
  onChange, 
  error,
  touched,
  ...props 
}: { 
  value: string; 
  onChange: (v: string) => void;
  error?: string;
  touched?: boolean;
  [key: string]: any;
}) {
  return (
    <div>
      <Input 
        {...props}
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 h-10 ${
          touched && error ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
        }`}
        maxLength={15}
      />
      {touched && error && (
        <p className="text-red-500 text-xs mt-1" role="alert">{error}</p>
      )}
    </div>
  );
}

function AddressBlock({ 
  prefix, 
  label, 
  region = '', 
  province = '', 
  city = '', 
  barangay = '', 
  street = '', 
  errors = {},
  touched = {},
  onChange, 
}: {
  prefix: string;
  label: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  street?: string;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  onChange: (field: string, value: string) => void;
}) {
  const field = (f: string) => `${prefix}_${f}`;
  const shouldShowError = (f: string) => {
    if (!touched || !errors) return false;
    const fieldName = field(f);
    return !!(touched[fieldName] && errors[fieldName]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pl-3 border-l-4 border-[#7A1E1E]">
        <MapPin className="w-4 h-4 text-[#7A1E1E] shrink-0" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[#7A1E1E] uppercase tracking-wide">{label}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Region */}
        <div>
          <Label className="text-xs text-gray-600">
            Region <span className="text-red-500">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Select value={region} onValueChange={(v) => onChange(field('Region'), v)}>
            <SelectTrigger 
              id={field('Region')}
              className={`mt-1 h-10 text-sm ${
                shouldShowError('Region') ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
              }`}
              aria-required="true"
            >
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {PH_REGIONS.map((option) => {
                const value = typeof option === 'object' ? option.value : option;
                const label = typeof option === 'object' ? option.label : option;
                return (
                  <SelectItem key={String(value)} value={String(value)}>
                    {String(label)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {shouldShowError('Region') && (
            <p className="text-red-500 text-xs mt-1" role="alert">{errors?.[field('Region')]}</p>
          )}
        </div>

        {/* Province */}
        <div>
          <Label className="text-xs text-gray-600">
            Province <span className="text-red-500">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Select value={province} onValueChange={(v) => onChange(field('Province'), v)} disabled={!region}>
            <SelectTrigger 
              id={field('Province')}
              className={`mt-1 h-10 text-sm ${
                shouldShowError('Province') ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
              }`}
              aria-required="true"
            >
              <SelectValue placeholder={region ? 'Select province' : 'Select region first'} />
            </SelectTrigger>
            <SelectContent>
              {region && (PH_PROVINCES_BY_REGION[region] || []).map((option) => {
                const value = typeof option === 'object' ? option.value : option;
                const label = typeof option === 'object' ? option.label : option;
                return (
                  <SelectItem key={String(value)} value={String(value)}>
                    {String(label)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {shouldShowError('Province') && (
            <p className="text-red-500 text-xs mt-1" role="alert">{errors?.[field('Province')]}</p>
          )}
        </div>

        {/* City */}
        <div>
          <Label className="text-xs text-gray-600">
            City <span className="text-red-500">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Select value={city} onValueChange={(v) => onChange(field('City'), v)} disabled={!province}>
            <SelectTrigger 
              id={field('City')}
              className={`mt-1 h-10 text-sm ${
                shouldShowError('City') ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
              }`}
              aria-required="true"
            >
              <SelectValue placeholder={province ? 'Select city' : 'Select province first'} />
            </SelectTrigger>
            <SelectContent>
              {province && (PH_CITIES_BY_PROVINCE[province] || []).map((option) => {
                const value = typeof option === 'object' ? option.value : option;
                const label = typeof option === 'object' ? option.label : option;
                return (
                  <SelectItem key={String(value)} value={String(value)}>
                    {String(label)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {shouldShowError('City') && (
            <p className="text-red-500 text-xs mt-1" role="alert">{errors?.[field('City')]}</p>
          )}
        </div>

        {/* Barangay */}
        <div>
          <Label className="text-xs text-gray-600">
            Barangay <span className="text-red-500">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Select value={barangay} onValueChange={(v) => onChange(field('Barangay'), v)} disabled={!city}>
            <SelectTrigger 
              id={field('Barangay')}
              className={`mt-1 h-10 text-sm ${
                shouldShowError('Barangay') ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
              }`}
              aria-required="true"
            >
              <SelectValue placeholder={city ? 'Select barangay' : 'Select city first'} />
            </SelectTrigger>
            <SelectContent>
              {city && (PH_BARANGAYS_BY_CITY[city] || []).map((option) => {
                const value = typeof option === 'object' ? option.value : option;
                const label = typeof option === 'object' ? option.label : option;
                return (
                  <SelectItem key={String(value)} value={String(value)}>
                    {String(label)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {shouldShowError('Barangay') && (
            <p className="text-red-500 text-xs mt-1" role="alert">{errors?.[field('Barangay')]}</p>
          )}
        </div>
      </div>

      {/* Street */}
      <div>
        <Label className="text-xs text-gray-600">
          Street Address <span className="text-red-500">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Input 
          id={field('Street')}
          className={`mt-1 h-10 text-sm ${
            shouldShowError('Street') ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
          }`}
          placeholder="House no., street name, etc." 
          value={street}
          onChange={(e) => onChange(field('Street'), e.target.value)}
          aria-required="true"
        />
        {shouldShowError('Street') && (
          <p className="text-red-500 text-xs mt-1" role="alert">{errors?.[field('Street')]}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PublicApplicationForm({
  onSubmit,
  onBack,
  talentGroup,
  onSelectGroup,
}: PublicApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '', lastName: '', firstName: '', middleName: '', birthdate: '', age: '', gender: '',
    permRegion: '', permProvince: '', permCity: '', permBarangay: '', permStreet: '',
    residRegion: '', residProvince: '', residCity: '', residBarangay: '', residStreet: '',
    mobileNo: '', email: '',
    studentId: '', yearLevel: '', course: '', department: '',
    guardianLastName: '', guardianFirstName: '', guardianMiddleName: '', guardianRelationship: '', guardianContactNo: '',
    talentGroup: talentGroup as any,
    hasBandExperience: null, vocalRange: '', previousSingingExperience: '',
    musicalBackground: '', primaryDanceGenre: '', yearsOfExperience: '',
    performedOnStage: '', willingToAttendRehearsals: '',
    previousMajoretteTeam: '', previousOrganization: '', canPerformBasicRoutines: '',
    willingToAttendRehearsalsMajorettes: '', dataPrivacyConsent: false, confirmedAccuracy: false,
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const update = <K extends keyof ApplicationFormData>(field: K, value: ApplicationFormData[K]) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const setError = (field: string, msg: string) =>
    setErrors(prev => ({ ...prev, [field]: msg }));
  const clearError = (field: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const handleAddressChange = useCallback((field: string, value: string) => {
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
  }, [sameAsPermanent]);

  const handleSameAsPermanent = useCallback((checked: boolean) => {
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
  }, []);

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

  // If no talent group selected, show group selection
  if (!talentGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <img src={uncLogo} alt="UNC Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">TalentTrackUNC</h1>
            <p className="text-lg text-gray-600">Select Your Talent Group</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TALENT_GROUPS.map(group => (
              <button
                key={group.value}
                onClick={() => onSelectGroup?.(group.value)}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 h-64 flex flex-col items-center justify-center bg-white"
              >
                <img 
                  src={group.image} 
                  alt={group.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <h2 className="relative text-white text-2xl font-bold text-center">{group.label}</h2>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If submission success, show confirmation
  if (submissionSuccess) {
    return (
      <SuccessConfirmation
        applicantName={`${formData.firstName} ${formData.lastName}`}
        talentGroup={talentGroup}
        applicationId={applicationId}
        email={formData.email}
        onClose={onBack}
      />
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Personal info
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!formData.gender && !isMajorettes) newErrors.gender = 'Gender is required';

    // Address
    if (!formData.permRegion) newErrors.perm_Region = 'Region is required';
    if (!formData.permProvince) newErrors.perm_Province = 'Province is required';
    if (!formData.permCity) newErrors.perm_City = 'City is required';
    if (!formData.permBarangay) newErrors.perm_Barangay = 'Barangay is required';
    if (!formData.permStreet) newErrors.perm_Street = 'Street address is required';

    // Contact
    if (!formData.mobileNo) newErrors.mobileNo = 'Mobile number is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';

    // Guardian
    if (!formData.guardianLastName) newErrors.guardianLastName = 'Last name is required';
    if (!formData.guardianFirstName) newErrors.guardianFirstName = 'First name is required';
    if (!formData.guardianRelationship) newErrors.guardianRelationship = 'Relationship is required';
    if (!formData.guardianContactNo) newErrors.guardianContactNo = 'Contact number is required';

    // Consent
    if (!formData.dataPrivacyConsent) newErrors.dataPrivacyConsent = 'You must agree to data privacy';
    if (!formData.confirmedAccuracy) newErrors.confirmedAccuracy = 'You must confirm accuracy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData).reduce((acc, key) => ({...acc, [key]: true}), {});
    setTouched(allFields);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newApplicationId = `UNC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setApplicationId(newApplicationId);
      onSubmit(formData);
      setSubmissionSuccess(true);
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTalentGroupLabel = () => {
    const group = TALENT_GROUPS.find(g => g.value === talentGroup);
    return group?.label || talentGroup;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Form Container */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Form Header with Back Button */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Form <span className="text-[#7A1E1E]">{getTalentGroupLabel()}</span>
            </h1>
            <p className="text-gray-600">Please fill out all required fields marked with <span className="text-red-500">*</span></p>
          </div>
          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            className="ml-4 h-10 px-3"
            title="Go back"
            aria-label="Back to previous page"
          >
            <ArrowLeft className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Personal Information */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="personal-heading">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              <h2 id="personal-heading" className="text-lg font-semibold text-[#7A1E1E]">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-xs text-gray-600">
                  Last Name <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input 
                  id="lastName"
                  className={`mt-1 h-10 text-sm ${
                    touched.lastName && errors.lastName ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  placeholder="Dela Cruz"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  onBlur={() => handleBlur('lastName')}
                  aria-required="true"
                />
                {touched.lastName && errors.lastName && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.lastName}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  First Name <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input 
                  id="firstName"
                  className={`mt-1 h-10 text-sm ${
                    touched.firstName && errors.firstName ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  onBlur={() => handleBlur('firstName')}
                  aria-required="true"
                />
                {touched.firstName && errors.firstName && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">Middle Name</Label>
                <Input 
                  id="middleName"
                  className="mt-1 h-10 text-sm border-2 border-gray-200"
                  placeholder="Santos"
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Birthdate <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input 
                  id="birthdate"
                  type="date"
                  className={`mt-1 h-10 text-sm ${
                    touched.birthdate && errors.birthdate ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  value={formData.birthdate}
                  onChange={(e) => {
                    const bd = e.target.value;
                    const age = new Date().getFullYear() - new Date(bd).getFullYear();
                    setFormData({...formData, birthdate: bd, age: age ? String(age) : ''});
                  }}
                  onBlur={() => handleBlur('birthdate')}
                  aria-required="true"
                  style={{ colorScheme: 'light' }}
                />
                {touched.birthdate && errors.birthdate && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.birthdate}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">Age</Label>
                <Input 
                  id="age"
                  className="mt-1 h-10 text-sm bg-gray-50 text-gray-500 border-2 border-gray-200"
                  value={formData.age ? `${formData.age} years old` : ''}
                  readOnly
                  disabled
                  placeholder="—"
                />
              </div>

              {!isMajorettes && (
                <div>
                  <Label className="text-xs text-gray-600">
                    Gender <span className="text-red-500">*</span>
                    <span className="sr-only">(required)</span>
                  </Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                    <SelectTrigger 
                      id="gender"
                      className={`mt-1 h-10 text-sm ${
                        touched.gender && errors.gender ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                      }`}
                      aria-required="true"
                      onBlur={() => handleBlur('gender')}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {touched.gender && errors.gender && (
                    <p className="text-red-500 text-xs mt-1" role="alert">{errors.gender}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 2: Address */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="address-heading">
            <h2 id="address-heading" className="text-lg font-semibold text-[#7A1E1E] mb-6">Address</h2>
            
            <div className="space-y-6">
              <AddressBlock 
                prefix="perm" 
                label="Permanent Address"
                region={formData.permRegion} 
                province={formData.permProvince}
                city={formData.permCity} 
                barangay={formData.permBarangay} 
                street={formData.permStreet}
                errors={errors} 
                touched={touched}
                onChange={(field, value) => {
                  const fieldName = field.replace('perm_', '').charAt(0).toLowerCase() + field.replace('perm_', '').slice(1);
                  const key = `perm${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof typeof formData;
                  setFormData({...formData, [key]: value});
                  handleBlur(field);
                }}
              />

              <div className="flex items-center gap-3">
                <Checkbox 
                  id="sameAsPermanent"
                  checked={sameAsPermanent}
                  onCheckedChange={(c) => setSameAsPermanent(!!c)}
                  className="w-4 h-4"
                />
                <label htmlFor="sameAsPermanent" className="text-sm text-gray-600 cursor-pointer">
                  Residing address is the same as permanent address
                </label>
              </div>

              {!sameAsPermanent && (
                <AddressBlock 
                  prefix="resid"
                  label="Residing Address"
                  region={formData.residRegion} 
                  province={formData.residProvince}
                  city={formData.residCity} 
                  barangay={formData.residBarangay} 
                  street={formData.residStreet}
                  errors={errors} 
                  touched={touched}
                  onChange={(field, value) => {
                    const fieldName = field.replace('resid_', '').charAt(0).toLowerCase() + field.replace('resid_', '').slice(1);
                    const key = `resid${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof typeof formData;
                    setFormData({...formData, [key]: value});
                    handleBlur(field);
                  }}
                />
              )}
            </div>
          </section>

          {/* SECTION 3: Contact Information */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="contact-heading">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              <h2 id="contact-heading" className="text-lg font-semibold text-[#7A1E1E]">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PhoneInput 
                id="mobileNo"
                placeholder="+63 (9XX) XXX-XXXX"
                label="Mobile Number"
                value={formData.mobileNo}
                onChange={(v) => setFormData({...formData, mobileNo: v})}
                error={errors.mobileNo}
                touched={touched.mobileNo}
                required
              />

              <div>
                <Label className="text-xs text-gray-600">
                  Email Address <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input 
                  id="email"
                  type="email"
                  className={`mt-1 h-10 text-sm ${
                    touched.email && errors.email ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  placeholder="juan@unc.edu.ph"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  onBlur={() => handleBlur('email')}
                  aria-required="true"
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.email}</p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 4: Academic Information */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="academic-heading">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              <h2 id="academic-heading" className="text-lg font-semibold text-[#7A1E1E]">Academic Information</h2>
            </div>

            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
              Only fill this section if you are already enrolled or have your academic details available.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-xs text-gray-600">Student ID</Label>
                <Input 
                  id="studentId"
                  className="mt-1 h-10 text-sm border-2 border-gray-200"
                  placeholder="24-12345"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value.slice(0, 8)})}
                  maxLength={8}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600">Department / School</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}>
                  <SelectTrigger id="department" className="mt-1 h-10 text-sm border-2 border-gray-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600">Year Level</Label>
                <Select value={formData.yearLevel} disabled={!formData.department} onValueChange={(v) => setFormData({...formData, yearLevel: v})}>
                  <SelectTrigger id="yearLevel" className="mt-1 h-10 text-sm border-2 border-gray-200">
                    <SelectValue placeholder={formData.department ? 'Select' : 'Select department first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600">Course / Strand</Label>
                <Select value={formData.course} disabled={!formData.department} onValueChange={(v) => setFormData({...formData, course: v})}>
                  <SelectTrigger id="course" className="mt-1 h-10 text-sm border-2 border-gray-200">
                    <SelectValue placeholder={formData.department ? 'Select' : 'Select department first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(COURSES[formData.department] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* SECTION 5: Emergency Contact */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="emergency-heading">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              <h2 id="emergency-heading" className="text-lg font-semibold text-[#7A1E1E]">Emergency Contact</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-xs text-gray-600">
                  Guardian Last Name <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input 
                  id="guardianLastName"
                  className={`mt-1 h-10 text-sm ${
                    touched.guardianLastName && errors.guardianLastName ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  placeholder="Dela Cruz"
                  value={formData.guardianLastName}
                  onChange={(e) => setFormData({...formData, guardianLastName: e.target.value})}
                  onBlur={() => handleBlur('guardianLastName')}
                  aria-required="true"
                />
                {touched.guardianLastName && errors.guardianLastName && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.guardianLastName}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Guardian First Name <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input 
                  id="guardianFirstName"
                  className={`mt-1 h-10 text-sm ${
                    touched.guardianFirstName && errors.guardianFirstName ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  placeholder="Juan"
                  value={formData.guardianFirstName}
                  onChange={(e) => setFormData({...formData, guardianFirstName: e.target.value})}
                  onBlur={() => handleBlur('guardianFirstName')}
                  aria-required="true"
                />
                {touched.guardianFirstName && errors.guardianFirstName && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.guardianFirstName}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">Guardian Middle Name</Label>
                <Input 
                  id="guardianMiddleName"
                  className="mt-1 h-10 text-sm border-2 border-gray-200"
                  placeholder="Santos"
                  value={formData.guardianMiddleName}
                  onChange={(e) => setFormData({...formData, guardianMiddleName: e.target.value})}
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Relationship <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Select value={formData.guardianRelationship} onValueChange={(v) => setFormData({...formData, guardianRelationship: v})}>
                  <SelectTrigger 
                    id="guardianRelationship"
                    className={`mt-1 h-10 text-sm ${
                      touched.guardianRelationship && errors.guardianRelationship ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                    }`}
                    aria-required="true"
                    onBlur={() => handleBlur('guardianRelationship')}
                  >
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {touched.guardianRelationship && errors.guardianRelationship && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.guardianRelationship}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Contact Number <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <Input 
                  id="guardianContactNo"
                  className={`mt-1 h-10 text-sm ${
                    touched.guardianContactNo && errors.guardianContactNo ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  placeholder="+63 (9XX) XXX-XXXX"
                  value={formData.guardianContactNo}
                  onChange={(e) => setFormData({...formData, guardianContactNo: e.target.value})}
                  onBlur={() => handleBlur('guardianContactNo')}
                  aria-required="true"
                  maxLength={15}
                />
                {touched.guardianContactNo && errors.guardianContactNo && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.guardianContactNo}</p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 6: Privacy & Consent */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="consent-heading">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              <h2 id="consent-heading" className="text-lg font-semibold text-[#7A1E1E]">Privacy & Consent</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="dataPrivacyConsent"
                  checked={formData.dataPrivacyConsent}
                  onCheckedChange={(c) => setFormData({...formData, dataPrivacyConsent: !!c})}
                  className="w-4 h-4 mt-1"
                  aria-required="true"
                />
                <label htmlFor="dataPrivacyConsent" className="text-sm text-gray-700">
                  I agree to the <strong>Data Privacy Policy</strong> and consent to the collection, use, and processing of my personal information for this scholarship application.
                </label>
              </div>
              {touched.dataPrivacyConsent && errors.dataPrivacyConsent && (
                <p className="text-red-500 text-xs ml-7" role="alert">{errors.dataPrivacyConsent}</p>
              )}

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="confirmedAccuracy"
                  checked={formData.confirmedAccuracy}
                  onCheckedChange={(c) => setFormData({...formData, confirmedAccuracy: !!c})}
                  className="w-4 h-4 mt-1"
                  aria-required="true"
                />
                <label htmlFor="confirmedAccuracy" className="text-sm text-gray-700">
                  I confirm that all information provided in this application is <strong>accurate and truthful</strong>.
                </label>
              </div>
              {touched.confirmedAccuracy && errors.confirmedAccuracy && (
                <p className="text-red-500 text-xs ml-7" role="alert">{errors.confirmedAccuracy}</p>
              )}
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="w-full sm:w-auto h-12 px-8 text-base bg-[#7A1E1E] hover:bg-[#6a1818] text-white"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>Submit Application</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
