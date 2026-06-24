import React, { useState, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import {
  Send, User, Phone, GraduationCap, Shield, 
  MapPin, Lock, ArrowLeft
} from './ui/icons';
import { SuccessConfirmation } from './SuccessConfirmation';
import { MicroFooter } from './MicroFooter';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import marchingBandImage from 'figma:asset/b242c5c349e0b89983c68f7897a6a917cfadb783.png';
import majorettesImage from 'figma:asset/720c2c7918c80e99d38a856e37434c03a71dfb51.png';
import gleeClubImage from 'figma:asset/64360cbb01ae76c176fb14f1e5d341950738dfa7.png';
import danceClubImage from 'figma:asset/a2be20b0c6962239c4e654249dbc602dbc00c37e.png';
import {
  PH_REGIONS, PH_PROVINCES_BY_REGION, PH_CITIES_BY_PROVINCE, PH_BARANGAYS_BY_CITY,
} from './PhilippineAddressData';

interface PublicApplicationFormProps {
  onSubmit: (applicationData: ApplicationFormData) => Promise<any> | any;
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
  socialMedia: string;

  // Consent
  dataPrivacyConsent: boolean;
  confirmedAccuracy: boolean;
  address: string;
  photo?: File | null;
}

const TALENT_GROUPS = [
  { value: 'marching-band', label: 'Marching Band', image: marchingBandImage },
  { value: 'glee-club', label: 'Glee Club', image: gleeClubImage },
  { value: 'majorettes', label: 'Majorettes', image: majorettesImage },
  { value: 'dance-club', label: 'Dance Club', image: danceClubImage },
];

const RELATIONSHIP_OPTIONS = ['Parent', 'Guardian', 'Sibling', 'Relative'];
const DEPARTMENTS = [
  { value: 'cea', label: 'College of Engineering and Architecture (CEA)' },
  { value: 'sba', label: 'School of Business and Accountancy (SBA)' },
  { value: 'scis', label: 'School of Computer and Information Sciences (SCIS)' },
  { value: 'sted', label: 'School of Teacher Education (STEd)' },
  { value: 'ssns', label: 'School of Social and Natural Sciences (SSNS)' },
  { value: 'ccje', label: 'College of Criminal Justice Education (CCJE)' },
  { value: 'shs', label: 'Senior High School (SHS)' },
];
const COURSES: Record<string, string[]> = {
  cea: [
    'Bachelor of Science in Architecture (BSA)',
    'Bachelor of Science in Civil Engineering (BSCE)',
    'Bachelor of Science in Computer Engineering (BSCpE)',
    'Bachelor of Science in Electrical Engineering (BSEE)',
    'Bachelor of Science in Electronics Engineering (BSECE)',
    'Bachelor of Science in Mechanical Engineering (BSME)',
  ],
  sba: [
    'Bachelor of Science in Accountancy (BSA)',
    'Bachelor of Science in Management Accounting (BSMA)',
    'Bachelor of Science in Business Administration - Human Resource Management (BSBA-HRM)',
    'Bachelor of Science in Business Administration - Marketing Management (BSBA-MM)',
    'Bachelor of Science in Business Administration - Financial Management (BSBA-FM)',
    'Bachelor of Science in Business Administration - Operations Management (BSBA-OM)',
    'Bachelor of Science in Hospitality Management (BSHM)',
    'Bachelor of Science in Tourism Management (BSTM)',
  ],
  scis: [
    'Bachelor of Science in Computer Science (BSCS)',
    'Bachelor of Science in Information Technology (BSIT)',
    'Bachelor of Library and Information Science (BLIS)',
    'Associate in Computer Technology (ACT)',
  ],
  sted: [
    'Bachelor of Elementary Education (BEEd)',
    'Bachelor of Early Childhood Education (BECEd)',
    'Bachelor of Special Needs Education - Visual Impairment (BSNEd-VI)',
    'Bachelor of Special Needs Education - Hearing Impairment (BSNEd-HI)',
    'Bachelor of Special Needs Education - Cognitive Impairment (BSNEd-CI)',
    'Bachelor of Secondary Education - English (BSEd-English)',
    'Bachelor of Secondary Education - Filipino (BSEd-Filipino)',
    'Bachelor of Secondary Education - Mathematics (BSEd-Mathematics)',
    'Bachelor of Secondary Education - Science (BSEd-Science)',
    'Bachelor of Secondary Education - Social Studies (BSEd-Social Studies)',
    'Bachelor of Physical Education (BPEd)',
  ],
  ssns: [
    'Bachelor of Arts in Political Science (BAPS)',
    'Bachelor of Arts in Psychology (BAPsy)',
    'Bachelor of Science in Biology (BSBio)',
  ],
  snahs: [
    'Bachelor of Science in Nursing (BSN)',
    'Caregiving NC II',
  ],
  ccje: [
    'Bachelor of Science in Criminology (BSCrim)',
  ],
  shs: [
    'Academic Track - STEM Engineering',
    'Academic Track - STEM Sciences',
    'Academic Track - ABM (Accountancy, Business, and Management)',
    'Academic Track - HUMSS (Humanities and Social Sciences)',
    'Academic Track - GAS (General Academic Strand)',
    'TVL Track - ICT Strand (Information and Communications Technology)',
    'TVL Track - HE Strand (Home Economics)',
  ],
};
const COUNTRY_CODES = [
  { value: '+93', label: 'Afghanistan (+93)' },
  { value: '+355', label: 'Albania (+355)' },
  { value: '+213', label: 'Algeria (+213)' },
  { value: '+376', label: 'Andorra (+376)' },
  { value: '+244', label: 'Angola (+244)' },
  { value: '+54', label: 'Argentina (+54)' },
  { value: '+374', label: 'Armenia (+374)' },
  { value: '+61', label: 'Australia (+61)' },
  { value: '+43', label: 'Austria (+43)' },
  { value: '+994', label: 'Azerbaijan (+994)' },
  { value: '+1-242', label: 'Bahamas (+1-242)' },
  { value: '+973', label: 'Bahrain (+973)' },
  { value: '+880', label: 'Bangladesh (+880)' },
  { value: '+375', label: 'Belarus (+375)' },
  { value: '+32', label: 'Belgium (+32)' },
  { value: '+501', label: 'Belize (+501)' },
  { value: '+229', label: 'Benin (+229)' },
  { value: '+975', label: 'Bhutan (+975)' },
  { value: '+591', label: 'Bolivia (+591)' },
  { value: '+387', label: 'Bosnia and Herzegovina (+387)' },
  { value: '+267', label: 'Botswana (+267)' },
  { value: '+55', label: 'Brazil (+55)' },
  { value: '+673', label: 'Brunei (+673)' },
  { value: '+359', label: 'Bulgaria (+359)' },
  { value: '+226', label: 'Burkina Faso (+226)' },
  { value: '+257', label: 'Burundi (+257)' },
  { value: '+238', label: 'Cape Verde (+238)' },
  { value: '+855', label: 'Cambodia (+855)' },
  { value: '+237', label: 'Cameroon (+237)' },
  { value: '+1', label: 'Canada (+1)' },
  { value: '+236', label: 'Central African Republic (+236)' },
  { value: '+235', label: 'Chad (+235)' },
  { value: '+56', label: 'Chile (+56)' },
  { value: '+86', label: 'China (+86)' },
  { value: '+57', label: 'Colombia (+57)' },
  { value: '+269', label: 'Comoros (+269)' },
  { value: '+242', label: 'Congo (+242)' },
  { value: '+506', label: 'Costa Rica (+506)' },
  { value: '+385', label: 'Croatia (+385)' },
  { value: '+53', label: 'Cuba (+53)' },
  { value: '+357', label: 'Cyprus (+357)' },
  { value: '+420', label: 'Czech Republic (+420)' },
  { value: '+243', label: 'DR Congo (+243)' },
  { value: '+45', label: 'Denmark (+45)' },
  { value: '+253', label: 'Djibouti (+253)' },
  { value: '+1-767', label: 'Dominica (+1-767)' },
  { value: '+1-809', label: 'Dominican Republic (+1-809)' },
  { value: '+593', label: 'Ecuador (+593)' },
  { value: '+20', label: 'Egypt (+20)' },
  { value: '+503', label: 'El Salvador (+503)' },
  { value: '+240', label: 'Equatorial Guinea (+240)' },
  { value: '+291', label: 'Eritrea (+291)' },
  { value: '+372', label: 'Estonia (+372)' },
  { value: '+268', label: 'Eswatini (+268)' },
  { value: '+251', label: 'Ethiopia (+251)' },
  { value: '+679', label: 'Fiji (+679)' },
  { value: '+358', label: 'Finland (+358)' },
  { value: '+33', label: 'France (+33)' },
  { value: '+241', label: 'Gabon (+241)' },
  { value: '+220', label: 'Gambia (+220)' },
  { value: '+995', label: 'Georgia (+995)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+233', label: 'Ghana (+233)' },
  { value: '+30', label: 'Greece (+30)' },
  { value: '+1-473', label: 'Grenada (+1-473)' },
  { value: '+502', label: 'Guatemala (+502)' },
  { value: '+224', label: 'Guinea (+224)' },
  { value: '+245', label: 'Guinea-Bissau (+245)' },
  { value: '+592', label: 'Guyana (+592)' },
  { value: '+509', label: 'Haiti (+509)' },
  { value: '+504', label: 'Honduras (+504)' },
  { value: '+36', label: 'Hungary (+36)' },
  { value: '+354', label: 'Iceland (+354)' },
  { value: '+91', label: 'India (+91)' },
  { value: '+62', label: 'Indonesia (+62)' },
  { value: '+98', label: 'Iran (+98)' },
  { value: '+964', label: 'Iraq (+964)' },
  { value: '+353', label: 'Ireland (+353)' },
  { value: '+972', label: 'Israel (+972)' },
  { value: '+39', label: 'Italy (+39)' },
  { value: '+1-876', label: 'Jamaica (+1-876)' },
  { value: '+81', label: 'Japan (+81)' },
  { value: '+962', label: 'Jordan (+962)' },
  { value: '+7', label: 'Kazakhstan (+7)' },
  { value: '+254', label: 'Kenya (+254)' },
  { value: '+686', label: 'Kiribati (+686)' },
  { value: '+383', label: 'Kosovo (+383)' },
  { value: '+965', label: 'Kuwait (+965)' },
  { value: '+996', label: 'Kyrgyzstan (+996)' },
  { value: '+856', label: 'Laos (+856)' },
  { value: '+371', label: 'Latvia (+371)' },
  { value: '+961', label: 'Lebanon (+961)' },
  { value: '+266', label: 'Lesotho (+266)' },
  { value: '+231', label: 'Liberia (+231)' },
  { value: '+218', label: 'Libya (+218)' },
  { value: '+423', label: 'Liechtenstein (+423)' },
  { value: '+370', label: 'Lithuania (+370)' },
  { value: '+352', label: 'Luxembourg (+352)' },
  { value: '+261', label: 'Madagascar (+261)' },
  { value: '+265', label: 'Malawi (+265)' },
  { value: '+60', label: 'Malaysia (+60)' },
  { value: '+960', label: 'Maldives (+960)' },
  { value: '+223', label: 'Mali (+223)' },
  { value: '+356', label: 'Malta (+356)' },
  { value: '+692', label: 'Marshall Islands (+692)' },
  { value: '+222', label: 'Mauritania (+222)' },
  { value: '+230', label: 'Mauritius (+230)' },
  { value: '+52', label: 'Mexico (+52)' },
  { value: '+691', label: 'Micronesia (+691)' },
  { value: '+373', label: 'Moldova (+373)' },
  { value: '+377', label: 'Monaco (+377)' },
  { value: '+976', label: 'Mongolia (+976)' },
  { value: '+382', label: 'Montenegro (+382)' },
  { value: '+212', label: 'Morocco (+212)' },
  { value: '+258', label: 'Mozambique (+258)' },
  { value: '+95', label: 'Myanmar (+95)' },
  { value: '+264', label: 'Namibia (+264)' },
  { value: '+674', label: 'Nauru (+674)' },
  { value: '+977', label: 'Nepal (+977)' },
  { value: '+31', label: 'Netherlands (+31)' },
  { value: '+64', label: 'New Zealand (+64)' },
  { value: '+505', label: 'Nicaragua (+505)' },
  { value: '+227', label: 'Niger (+227)' },
  { value: '+234', label: 'Nigeria (+234)' },
  { value: '+850', label: 'North Korea (+850)' },
  { value: '+389', label: 'North Macedonia (+389)' },
  { value: '+47', label: 'Norway (+47)' },
  { value: '+968', label: 'Oman (+968)' },
  { value: '+92', label: 'Pakistan (+92)' },
  { value: '+680', label: 'Palau (+680)' },
  { value: '+970', label: 'Palestine (+970)' },
  { value: '+507', label: 'Panama (+507)' },
  { value: '+675', label: 'Papua New Guinea (+675)' },
  { value: '+595', label: 'Paraguay (+595)' },
  { value: '+51', label: 'Peru (+51)' },
  { value: '+63', label: 'PH(+63)' },
  { value: '+48', label: 'Poland (+48)' },
  { value: '+351', label: 'Portugal (+351)' },
  { value: '+974', label: 'Qatar (+974)' },
  { value: '+40', label: 'Romania (+40)' },
  { value: '+7', label: 'Russia (+7)' },
  { value: '+250', label: 'Rwanda (+250)' },
  { value: '+1-869', label: 'Saint Kitts and Nevis (+1-869)' },
  { value: '+1-758', label: 'Saint Lucia (+1-758)' },
  { value: '+1-784', label: 'Saint Vincent and the Grenadines (+1-784)' },
  { value: '+685', label: 'Samoa (+685)' },
  { value: '+378', label: 'San Marino (+378)' },
  { value: '+239', label: 'Sao Tome and Principe (+239)' },
  { value: '+966', label: 'Saudi Arabia (+966)' },
  { value: '+221', label: 'Senegal (+221)' },
  { value: '+381', label: 'Serbia (+381)' },
  { value: '+248', label: 'Seychelles (+248)' },
  { value: '+232', label: 'Sierra Leone (+232)' },
  { value: '+65', label: 'Singapore (+65)' },
  { value: '+421', label: 'Slovakia (+421)' },
  { value: '+386', label: 'Slovenia (+386)' },
  { value: '+677', label: 'Solomon Islands (+677)' },
  { value: '+252', label: 'Somalia (+252)' },
  { value: '+27', label: 'South Africa (+27)' },
  { value: '+82', label: 'South Korea (+82)' },
  { value: '+211', label: 'South Sudan (+211)' },
  { value: '+34', label: 'Spain (+34)' },
  { value: '+94', label: 'Sri Lanka (+94)' },
  { value: '+249', label: 'Sudan (+249)' },
  { value: '+597', label: 'Suriname (+597)' },
  { value: '+46', label: 'Sweden (+46)' },
  { value: '+41', label: 'Switzerland (+41)' },
  { value: '+963', label: 'Syria (+963)' },
  { value: '+886', label: 'Taiwan (+886)' },
  { value: '+992', label: 'Tajikistan (+992)' },
  { value: '+255', label: 'Tanzania (+255)' },
  { value: '+66', label: 'Thailand (+66)' },
  { value: '+670', label: 'Timor-Leste (+670)' },
  { value: '+228', label: 'Togo (+228)' },
  { value: '+676', label: 'Tonga (+676)' },
  { value: '+1-868', label: 'Trinidad and Tobago (+1-868)' },
  { value: '+216', label: 'Tunisia (+216)' },
  { value: '+90', label: 'Turkey (+90)' },
  { value: '+993', label: 'Turkmenistan (+993)' },
  { value: '+688', label: 'Tuvalu (+688)' },
  { value: '+256', label: 'Uganda (+256)' },
  { value: '+380', label: 'Ukraine (+380)' },
  { value: '+971', label: 'United Arab Emirates (+971)' },
  { value: '+44', label: 'United Kingdom (+44)' },
  { value: '+1', label: 'United States (+1)' },
  { value: '+598', label: 'Uruguay (+598)' },
  { value: '+998', label: 'Uzbekistan (+998)' },
  { value: '+678', label: 'Vanuatu (+678)' },
  { value: '+379', label: 'Vatican City (+379)' },
  { value: '+58', label: 'Venezuela (+58)' },
  { value: '+84', label: 'Vietnam (+84)' },
  { value: '+967', label: 'Yemen (+967)' },
  { value: '+260', label: 'Zambia (+260)' },
  { value: '+263', label: 'Zimbabwe (+263)' },
];

const calculateAge = (birthdate: string): string => {
  if (!birthdate) return '';
  const today = new Date();
  const bd = new Date(birthdate + 'T00:00:00');
  if (isNaN(bd.getTime())) return '';
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age.toString();
};

const getMaxBirthdate = (): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 15);
  return d.toISOString().slice(0, 10);
};

const capitalizeWords = (value: string): string =>
  value.replace(/\b([a-z])/g, (match) => match.toUpperCase());

const getShortCountryLabel = (label: string): string => {
  const dialCode = label.match(/\(\+[^)]+\)/)?.[0] ?? '';
  const countryName = label.split('(')[0].trim().replace(/[^A-Za-z\s]/g, ' ');
  const words = countryName.split(/\s+/).filter(Boolean);

  if (words.length === 0) return dialCode;
  if (words.length === 1) return `${words[0].slice(0, 2).toUpperCase()} ${dialCode}`.trim();

  return `${(words[0][0] + words[1][0]).toUpperCase()} ${dialCode}`.trim();
};

function PhoneInput({ 
  value, 
  onChange, 
  error,
  touched,
  countryCode = '+63',
  onCountryCodeChange,
  ...props 
}: { 
  value: string; 
  onChange: (v: string) => void;
  error?: string;
  touched?: boolean;
  countryCode?: string;
  onCountryCodeChange?: (v: string) => void;
  [key: string]: any;
}) {
  const [countrySearch, setCountrySearch] = useState('');
  // Safely find the index of the current country code for proper Select value matching
  const activeIndex = COUNTRY_CODES.findIndex(cc => cc.value === countryCode);
  // Build the compound key only if a valid index is found; otherwise default to undefined
  const selectValue = activeIndex >= 0 ? `${countryCode}_${activeIndex}` : undefined;
  const filteredCountryCodes = COUNTRY_CODES.filter((cc) => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      getShortCountryLabel(cc.label).toLowerCase().includes(q) ||
      cc.value.toLowerCase().includes(q) ||
      cc.label.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full">
      <div
        className={`mt-1 flex h-11 overflow-hidden rounded-md border-2 bg-white focus-within:ring-1 ${
          touched && error ? 'border-red-600 ring-red-500/30' : 'border-gray-200 focus-within:ring-[#7A1E1E]/20'
        }`}
      >
        <Select 
          value={selectValue} 
          onValueChange={(v) => {
            // Extract raw country code by splitting on underscore and taking the first part
            const rawCode = v.split('_')[0];
            onCountryCodeChange?.(rawCode);
            setCountrySearch('');
          }}
        >
          <SelectTrigger 
            className="h-full w-[106px] rounded-none border-0 px-3 text-sm shadow-none focus:ring-0"
            aria-label="Country code"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 border-b border-gray-100">
              <Input
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search code"
                className="h-8 text-xs border border-gray-200"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {/* Create unique key/value pairs using country code and array index */}
            {filteredCountryCodes.map((cc, index) => (
              <SelectItem 
                key={`${cc.value}_${index}`} 
                value={`${cc.value}_${index}`}
              >
                {getShortCountryLabel(cc.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="h-full w-px bg-gray-200" aria-hidden="true" />
        <Input 
          {...props}
          value={value} 
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, '');
            let formatted = digitsOnly;
            
            // Format Philippine numbers as XXXX-XXX-XXX (display format)
            if (countryCode === '+63' && digitsOnly.length > 0) {
              if (digitsOnly.length <= 4) {
                formatted = digitsOnly;
              } else if (digitsOnly.length <= 7) {
                formatted = digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4);
              } else {
                formatted = digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4, 7) + '-' + digitsOnly.slice(7, 10);
              }
            }
            
            onChange(formatted.slice(0, countryCode === '+63' ? 12 : 18));
          }}
          className="h-full min-w-0 flex-1 rounded-none border-0 px-3 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={countryCode === '+63' ? 12 : 18}
        />
      </div>
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
  const [regionSearch, setRegionSearch] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [barangaySearch, setBarangaySearch] = useState('');

  const field = (f: string) => `${prefix}_${f}`;
  const shouldShowError = (f: string) => {
    if (!touched || !errors) return false;
    const fieldName = field(f);
    return !!(touched[fieldName] && errors[fieldName]);
  };

  const barangayOptions = city ? (PH_BARANGAYS_BY_CITY[city] || []) : [];

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
              <div className="p-2 border-b border-gray-100">
                <Input
                  value={regionSearch}
                  onChange={(e) => setRegionSearch(e.target.value)}
                  placeholder="Search region"
                  className="h-8 text-xs border border-gray-200"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {PH_REGIONS.filter((option) => {
                const value = typeof option === 'object' ? String((option as any).value) : String(option);
                const label = typeof option === 'object' ? String((option as any).label) : String(option);
                const q = regionSearch.trim().toLowerCase();
                return !q || value.toLowerCase().includes(q) || label.toLowerCase().includes(q);
              }).map((option) => {
                const value = typeof option === 'object' ? (option as any).value : option;
                const label = typeof option === 'object' ? (option as any).label : option;
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
              <div className="p-2 border-b border-gray-100">
                <Input
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  placeholder="Search province"
                  className="h-8 text-xs border border-gray-200"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {region && (PH_PROVINCES_BY_REGION[region] || []).filter((option) => {
                const value = typeof option === 'object' ? String((option as any).value) : String(option);
                const label = typeof option === 'object' ? String((option as any).label) : String(option);
                const q = provinceSearch.trim().toLowerCase();
                return !q || value.toLowerCase().includes(q) || label.toLowerCase().includes(q);
              }).map((option) => {
                const value = typeof option === 'object' ? (option as any).value : option;
                const label = typeof option === 'object' ? (option as any).label : option;
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
              <div className="p-2 border-b border-gray-100">
                <Input
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search city"
                  className="h-8 text-xs border border-gray-200"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {province && (PH_CITIES_BY_PROVINCE[province] || []).filter((option) => {
                const value = typeof option === 'object' ? String((option as any).value) : String(option);
                const label = typeof option === 'object' ? String((option as any).label) : String(option);
                const q = citySearch.trim().toLowerCase();
                return !q || value.toLowerCase().includes(q) || label.toLowerCase().includes(q);
              }).map((option) => {
                const value = typeof option === 'object' ? (option as any).value : option;
                const label = typeof option === 'object' ? (option as any).label : option;
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
          {barangayOptions.length > 0 ? (
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
                <div className="p-2 border-b border-gray-100">
                  <Input
                    value={barangaySearch}
                    onChange={(e) => setBarangaySearch(e.target.value)}
                    placeholder="Search barangay"
                    className="h-8 text-xs border border-gray-200"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                {barangayOptions
                  .filter((option) => {
                    const value = typeof option === 'object' ? String((option as any).value) : String(option);
                    const label = typeof option === 'object' ? String((option as any).label) : String(option);
                    const q = barangaySearch.trim().toLowerCase();
                    return !q || value.toLowerCase().includes(q) || label.toLowerCase().includes(q);
                  })
                  .map((option) => {
                    const value = typeof option === 'object' ? (option as any).value : option;
                    const label = typeof option === 'object' ? (option as any).label : option;
                    return (
                      <SelectItem key={String(value)} value={String(value)}>
                        {String(label)}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field('Barangay')}
              className={`mt-1 h-10 text-sm ${
                shouldShowError('Barangay') ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
              }`}
              placeholder={city ? 'Type barangay' : 'Select city first'}
              value={barangay}
              onChange={(e) => onChange(field('Barangay'), capitalizeWords(e.target.value))}
              required
              aria-required="true"
              disabled={!city}
            />
          )}
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
          onChange={(e) => onChange(field('Street'), capitalizeWords(e.target.value))}
          required
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
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [yearLevelSearch, setYearLevelSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [guardianRelationshipSearch, setGuardianRelationshipSearch] = useState('');

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
    willingToAttendRehearsalsMajorettes: '', socialMedia: '',
    dataPrivacyConsent: false, confirmedAccuracy: false,
    address: '', photo: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [mobileCC, setMobileCC] = useState('+63');
  const [guardianCC, setGuardianCC] = useState('+63');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formErrorSummary, setFormErrorSummary] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

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
    if (formData.department === 'shs' && formData.talentGroup === 'marching-band') return ['Grade 11', 'Grade 12'];
    return ['1st Year', '2nd Year'];
  };

  const getDepartments = () => {
    if (formData.talentGroup === 'marching-band') return DEPARTMENTS;
    return DEPARTMENTS.filter(d => d.value !== 'shs');
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
    if (!formData.photo) newErrors.photo = '2x2 photo is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.birthdate) {
      newErrors.birthdate = 'Birthdate is required';
    } else {
      const age = parseInt(calculateAge(formData.birthdate), 10);
      if (isNaN(age) || age < 15) newErrors.birthdate = 'You must be at least 15 years old to apply';
    }
    if (!formData.gender && !isMajorettes) newErrors.gender = 'Gender is required';

    // Address
    if (!formData.permRegion) newErrors.perm_Region = 'Region is required';
    if (!formData.permProvince) newErrors.perm_Province = 'Province is required';
    if (!formData.permCity) newErrors.perm_City = 'City is required';
    if (!formData.permBarangay) newErrors.perm_Barangay = 'Barangay is required';
    if (!formData.permStreet) newErrors.perm_Street = 'Street address is required';

    // Contact
    if (!formData.mobileNo) {
      newErrors.mobileNo = 'Mobile number is required';
    } else if (mobileCC === '+63' && !/^9\d{9}$/.test(formData.mobileNo.replace(/[-\s]/g, ''))) {
      newErrors.mobileNo = 'Philippine mobile must start with 9 followed by 9 digits (e.g. 9171-234-567)';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@unc\.edu\.ph$/i.test(formData.email)) {
      newErrors.email = 'Must be a valid UNC email (e.g. juan@unc.edu.ph)';
    }
    if (formData.studentId && !/^\d{2}-\d{5}$/.test(formData.studentId)) {
      newErrors.studentId = 'Student ID must follow YY-XXXXX format (e.g. 23-12345)';
    }
    if (!formData.department) newErrors.department = 'Department / School is required';
    if (!formData.yearLevel) newErrors.yearLevel = 'Year level is required';
    if (!formData.course) newErrors.course = 'Course / Strand is required';
    if (formData.yearLevel && !getYearLevels().includes(formData.yearLevel)) {
      newErrors.yearLevel = 'Only 1st and 2nd Year are eligible. Senior High School (Grade 11/12) is for Marching Band only.';
    }
    if (formData.socialMedia && !/^https?:\/\/(www\.)?[\w\-]+(\.[\w\-]+)+([\/?#][^\s]*)?$/.test(formData.socialMedia)) {
      newErrors.socialMedia = 'Must be a valid URL (e.g. https://facebook.com/yourprofile)';
    }

    // Guardian
    if (!formData.guardianLastName) newErrors.guardianLastName = 'Last name is required';
    if (!formData.guardianFirstName) newErrors.guardianFirstName = 'First name is required';
    if (!formData.guardianRelationship) newErrors.guardianRelationship = 'Relationship is required';
    if (!formData.guardianContactNo) newErrors.guardianContactNo = 'Contact number is required';
    if (formData.guardianContactNo && !validatePhone(formData.guardianContactNo.replace(/[-\s]/g, ''), guardianCC)) {
      newErrors.guardianContactNo = guardianCC === '+63'
        ? 'Guardian contact must start with 9 and have 10 digits (e.g. 9171234567)'
        : 'Please enter a valid contact number';
    }

    // Consent
    if (!formData.dataPrivacyConsent) newErrors.dataPrivacyConsent = 'You must agree to data privacy';
    if (!formData.confirmedAccuracy) newErrors.confirmedAccuracy = 'You must confirm accuracy';

    setErrors(newErrors);
    setFormErrorSummary(Object.keys(newErrors).length > 0 ? 'Please complete all required fields marked with * and review highlighted errors.' : '');
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData).reduce((acc, key) => ({...acc, [key]: true}), {} as Record<string, boolean>);
    const addressTouched: Record<string, boolean> = {
      perm_Region: true,
      perm_Province: true,
      perm_City: true,
      perm_Barangay: true,
      perm_Street: true,
      resid_Region: true,
      resid_Province: true,
      resid_City: true,
      resid_Barangay: true,
      resid_Street: true,
    };
    setTouched({ ...allFields, ...addressTouched });

    if (!validateForm()) {
      toast.warning('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onSubmit(formData) as any;
      const backendId = response?.id || response?.data?.id;
      setApplicationId(backendId ? String(backendId) : 'Submitted');
      setSubmissionSuccess(true);
    } catch (error: any) {
      console.error('Submission failed:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to submit application. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTalentGroupLabel = () => {
    const group = TALENT_GROUPS.find(g => g.value === talentGroup);
    return group?.label || talentGroup;
  };

  return (
    <div className="h-dvh overflow-y-auto overscroll-y-contain bg-gray-50 flex flex-col">
      {/* Global Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-[#E2E8F0] z-50" role="navigation" aria-label="Application page navigation">
        <div className="max-w-[1440px] mx-auto h-full px-4 md:px-[70px] flex items-center justify-between">
          <div className="text-xl md:text-2xl">
            <span className="font-bold text-[#1E293B]">Talent</span>
            <span className="text-[#1E293B]">Track</span>
            <span className="font-bold text-[#7A1E1E]">UNC</span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[#7A1E1E] border border-[#7A1E1E] rounded px-3 py-1.5 hover:text-[#1E293B] hover:border-[#1E293B] transition-colors"
          >
            Back to Talent Groups
          </button>
        </div>
      </nav>

      {/* Form Container */}
      <main className="container mx-auto px-4 pt-28 pb-8 max-w-3xl flex-1">
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 [&_[data-slot=input]]:h-11 [&_[data-slot=select-trigger]]:h-11"
          noValidate
        >
          {formErrorSummary && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
              aria-live="assertive"
            >
              {formErrorSummary}
            </div>
          )}
          {/* SECTION 1: Personal Information */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="personal-heading">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              <h2 id="personal-heading" className="text-lg font-semibold text-[#7A1E1E]">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-4">
                <Label className="text-xs text-gray-600">
                  2x2 Photo <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 flex flex-col items-start gap-2">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="w-36 h-36 rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-[#7A1E1E] hover:bg-[#FEF2F2] transition-colors overflow-hidden flex-shrink-0"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <>
                        <User className="w-10 h-10 text-gray-300 mb-1" />
                        <span className="text-[10px] text-gray-400 text-center leading-tight px-1">Click to upload</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 w-36">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="text-xs font-medium text-white bg-[#7A1E1E] hover:bg-[#5C1616] rounded px-3 py-1.5 transition-colors w-full"
                    >
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => { setPhotoPreview(null); setFormData(p => ({ ...p, photo: null })); if (photoInputRef.current) photoInputRef.current.value = ''; }}
                        className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors text-center"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-[11px] text-gray-400 leading-snug text-left">JPG, PNG or WEBP<br />Max 5MB · Formal attire</p>
                  </div>
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                    setFormData(p => ({ ...p, photo: file }));
                  }}
                />
                {touched.photo && errors.photo && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.photo}</p>
                )}
              </div>

              <div className="sm:col-span-8 space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label className="text-[11px] text-gray-600">
                      First Name <span className="text-red-500">*</span>
                      <span className="sr-only">(required)</span>
                    </Label>
                    <Input
                      id="firstName"
                      className={`mt-1 h-10 text-sm ${
                        touched.firstName && errors.firstName ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                      }`}
                      placeholder="Juan"
                      maxLength={80}
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: capitalizeWords(e.target.value)})}
                      onBlur={() => handleBlur('firstName')}
                      required
                      aria-required="true"
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="text-red-500 text-xs mt-1" role="alert">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-[11px] text-gray-600">Middle Name</Label>
                    <Input
                      id="middleName"
                      className="mt-1 h-10 text-sm border-2 border-gray-200"
                      placeholder="Santos"
                      maxLength={80}
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: capitalizeWords(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-gray-600">
                      Last Name <span className="text-red-500">*</span>
                      <span className="sr-only">(required)</span>
                    </Label>
                    <Input
                      id="lastName"
                      className={`mt-1 h-10 text-sm ${
                        touched.lastName && errors.lastName ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                      }`}
                      placeholder="Dela Cruz"
                      maxLength={80}
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: capitalizeWords(e.target.value)})}
                      onBlur={() => handleBlur('lastName')}
                      required
                      aria-required="true"
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="text-red-500 text-xs mt-1" role="alert">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Birthdate <span className="text-red-500">*</span>
                      <span className="sr-only">(required)</span>
                    </Label>
                    <Input
                      id="birthdate"
                      type="date"
                      max={getMaxBirthdate()}
                      className={`mt-1 h-10 text-sm ${
                        touched.birthdate && errors.birthdate ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                      }`}
                      value={formData.birthdate}
                      onChange={(e) => {
                        const bd = e.target.value;
                        const age = calculateAge(bd);
                        setFormData(prev => ({...prev, birthdate: bd, age}));
                      }}
                      onBlur={() => handleBlur('birthdate')}
                      required
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
              </div>
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
                  onCheckedChange={(c) => handleSameAsPermanent(!!c)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div>
                <Label className="text-xs text-gray-600" htmlFor="mobileNo">
                  Mobile Number <span className="text-red-500">*</span>
                  <span className="sr-only">(required)</span>
                </Label>
                <PhoneInput 
                  id="mobileNo"
                  placeholder="(9XX) XXX-XXXX"
                  value={formData.mobileNo}
                  onChange={(v) => setFormData({...formData, mobileNo: v})}
                  countryCode={mobileCC}
                  onCountryCodeChange={(v) => setMobileCC(v)}
                  error={errors.mobileNo}
                  touched={touched.mobileNo}
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600" htmlFor="email">
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
                  required
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
            <p className="text-xs text-[#7A1E1E] bg-[#F9EAEA] border border-[#E9CACA] rounded px-3 py-2 mb-6">
              {formData.talentGroup === 'marching-band'
                ? 'Eligibility note: Marching Band accepts 1st Year and 2nd Year college students, and Senior High School (Grade 11 or Grade 12). SHS is exclusive to Marching Band.'
                : 'Eligibility note: Only 1st Year and 2nd Year college students are allowed for this talent group.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-xs text-gray-600">Student ID</Label>
                <Input 
                  id="studentId"
                  className={`mt-1 h-10 text-sm ${
                    touched.studentId && errors.studentId ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                  }`}
                  placeholder="23-12345"
                  value={formData.studentId}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9-]/g, '');
                    if (val.length <= 2) {
                      val = val;
                    } else if (val.length === 3 && !val.includes('-')) {
                      val = val.slice(0, 2) + '-' + val.slice(2);
                    } else if (val.includes('-') && val.split('-')[1].length > 5) {
                      val = val.slice(0, 8);
                    }
                    setFormData(prev => ({...prev, studentId: val}));
                  }}
                  onBlur={() => handleBlur('studentId')}
                  maxLength={8}
                />
                {touched.studentId && errors.studentId && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.studentId}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Department / School <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v, yearLevel: '', course: ''})}>
                  <SelectTrigger
                    id="department"
                    className={`mt-1 h-10 text-sm ${
                      touched.department && errors.department ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                    }`}
                    onBlur={() => handleBlur('department')}
                    aria-required="true"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b border-gray-100">
                      <Input
                        value={departmentSearch}
                        onChange={(e) => setDepartmentSearch(e.target.value)}
                        placeholder="Search department"
                        className="h-8 text-xs border border-gray-200"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {getDepartments()
                      .filter((d) => {
                        const q = departmentSearch.trim().toLowerCase();
                        return !q || d.value.toLowerCase().includes(q) || d.label.toLowerCase().includes(q);
                      })
                      .map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {touched.department && errors.department && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.department}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Year Level <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.yearLevel} disabled={!formData.department} onValueChange={(v) => setFormData({...formData, yearLevel: v})}>
                  <SelectTrigger
                    id="yearLevel"
                    className={`mt-1 h-10 text-sm ${touched.yearLevel && errors.yearLevel ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'}`}
                    onBlur={() => handleBlur('yearLevel')}
                    aria-required="true"
                  >
                    <SelectValue placeholder={formData.department ? 'Select' : 'Select department first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b border-gray-100">
                      <Input
                        value={yearLevelSearch}
                        onChange={(e) => setYearLevelSearch(e.target.value)}
                        placeholder="Search year level"
                        className="h-8 text-xs border border-gray-200"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {getYearLevels()
                      .filter((l) => {
                        const q = yearLevelSearch.trim().toLowerCase();
                        return !q || l.toLowerCase().includes(q);
                      })
                      .map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                {touched.yearLevel && errors.yearLevel && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.yearLevel}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-gray-600">
                  Course / Strand <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.course} disabled={!formData.department} onValueChange={(v) => setFormData({...formData, course: v})}>
                  <SelectTrigger
                    id="course"
                    className={`mt-1 h-10 text-sm ${
                      touched.course && errors.course ? 'border-2 border-red-600 ring-1 ring-red-500/30' : 'border-2 border-gray-200'
                    }`}
                    onBlur={() => handleBlur('course')}
                    aria-required="true"
                  >
                    <SelectValue placeholder={formData.department ? 'Select' : 'Select department first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b border-gray-100">
                      <Input
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search course/strand"
                        className="h-8 text-xs border border-gray-200"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {(COURSES[formData.department] || [])
                      .filter((c) => {
                        const q = courseSearch.trim().toLowerCase();
                        return !q || c.toLowerCase().includes(q);
                      })
                      .map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {touched.course && errors.course && (
                  <p className="text-red-500 text-xs mt-1" role="alert">{errors.course}</p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 5: Emergency Contact */}
          <section className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-8" aria-labelledby="emergency-heading">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-[#7A1E1E]" aria-hidden="true" />
              <h2 id="emergency-heading" className="text-lg font-semibold text-[#7A1E1E]">Emergency Contact</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                  maxLength={80}
                  value={formData.guardianLastName}
                  onChange={(e) => setFormData({...formData, guardianLastName: capitalizeWords(e.target.value)})}
                  onBlur={() => handleBlur('guardianLastName')}
                  required
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
                  maxLength={80}
                  value={formData.guardianFirstName}
                  onChange={(e) => setFormData({...formData, guardianFirstName: capitalizeWords(e.target.value)})}
                  onBlur={() => handleBlur('guardianFirstName')}
                  required
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
                  maxLength={80}
                  value={formData.guardianMiddleName}
                  onChange={(e) => setFormData({...formData, guardianMiddleName: capitalizeWords(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <div className="p-2 border-b border-gray-100">
                      <Input
                        value={guardianRelationshipSearch}
                        onChange={(e) => setGuardianRelationshipSearch(e.target.value)}
                        placeholder="Search relationship"
                        className="h-8 text-xs border border-gray-200"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {RELATIONSHIP_OPTIONS
                      .filter((r) => {
                        const q = guardianRelationshipSearch.trim().toLowerCase();
                        return !q || r.toLowerCase().includes(q);
                      })
                      .map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
                <PhoneInput
                  id="guardianContactNo"
                  value={formData.guardianContactNo}
                  onChange={(v) => setFormData({...formData, guardianContactNo: v})}
                  countryCode={guardianCC}
                  onCountryCodeChange={(v) => setGuardianCC(v)}
                  error={errors.guardianContactNo}
                  touched={touched.guardianContactNo}
                  required
                  aria-required="true"
                />
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
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin [animation-duration:700ms]" aria-hidden="true" />
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
      </main>

      <MicroFooter />
    </div>
  );
}
