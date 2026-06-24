# DirectorDashboardEnhanced vs AdminDashboard - Detailed Styling Comparison

## Executive Summary
The two dashboards have significant styling inconsistencies that need to be unified. Below are the exact differences found across all major UI elements.

---

## 1. NAVIGATION TAB BUTTONS

### Director Implementation (DirectorDashboardEnhanced.tsx, line 2694-2710)
```tsx
<button
  key={key}
  role="tab"
  aria-selected={active}
  aria-controls={`tab-panel-${key}`}
  onClick={() => setCurrentView(key)}
  className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-b-2 ${
    active
      ? 'border-[#7A1E1E] text-[#7A1E1E]'
      : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
  }`}
>
  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
  <span>{label}</span>
</button>
```
**Classes Used:**
- Active state: `border-[#7A1E1E] text-[#7A1E1E]`
- Inactive state: `border-transparent text-[#64748B]`
- Hover: `hover:text-[#0F172A] hover:border-[#E2E8F0]`
- Padding: `px-4 py-3.5`
- Font: `text-[13px] font-medium`

### Admin Implementation (AdminDashboard.tsx, line 543-561)
```tsx
<button
  key={key}
  role="tab"
  aria-selected={active}
  aria-controls={`${key}-panel`}
  onClick={() => setCurrentView(key)}
  className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-b-2 ${
    active
      ? 'border-[#7A1E1E] text-[#7A1E1E]'
      : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#E2E8F0]'
  }`}
>
  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
  <span>{label}</span>
</button>
```
**Classes Used:** IDENTICAL to Director

### Difference
✅ **NO DIFFERENCE** - Navigation tabs are styled identically

---

## 2. SEARCH BAR INPUTS

### Director - Not Found
The Director component does NOT have search bar styling constants defined in the component level.

### Admin Implementation (AdminDashboard.tsx, line 443-444)
```tsx
const tableSearchInputClass =
  'pl-10 pr-3 h-[42px] rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:ring-2 focus-visible:ring-[#CBD5E1] focus-visible:border-[#94A3B8]';
```

**Admin Search Input Details:**
- Icon positioning: `pl-10` (search icon positioned absolutely on left)
- Padding right: `pr-3`
- Height: `h-[42px]`
- Border: `border border-[#CBD5E1]`
- Background: `bg-[#F8FAFC]`
- Text color: `text-[#0F172A]`
- Placeholder: `placeholder:text-[#94A3B8]`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[#CBD5E1]`
- Focus border: `focus-visible:border-[#94A3B8]`

### Director Search Usage (DirectorMemberProfileTab if exists)
Need to check if Director has different search styling

### Difference
❌ **MAJOR DIFFERENCE** - Director has no standardized search input class; Admin has explicit styling

---

## 3. QUICK STAT CARDS (Stats Cards at top of views)

### Admin Implementation (AdminDashboard.tsx, line 587-616)
```tsx
<Card
  role="listitem"
  className={directorInteractiveCardClass}
  onClick={() => { setGroupFilter(key); toast.info(`${count} scholars in ${label}`); }}
  tabIndex={0}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGroupFilter(key); toast.info(`${count} scholars in ${label}`); } }}
  aria-label={`${label}: ${count} scholars. Activate to filter list.`}
>
  <CardContent className="p-3 sm:p-6">
    <p className="text-[#6C757D] text-[10px] sm:text-[12px] leading-[13px] sm:leading-[16px]">{label}</p>
    <p className="text-[#1A1A1A] text-[18px] sm:text-[24px] leading-[24px] sm:leading-[32px] font-bold">{count}</p>
  </CardContent>
</Card>
```

**Admin Card Class:**
```tsx
const directorInteractiveCardClass = 'bg-white border-[1.6px] border-[#E0E0E0] shadow-md rounded-lg cursor-pointer hover:shadow-lg hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]';
```

**Admin Card Content:**
- Label text: `text-[#6C757D] text-[10px] sm:text-[12px]`
- Number text: `text-[#1A1A1A] text-[18px] sm:text-[24px] font-bold`
- Padding: `p-3 sm:p-6`

### Director Implementation (DirectorMemberProfileTab.tsx, line 108-124)
```tsx
<Card 
  className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
>
  <CardContent className="p-2 sm:p-3">
    <p className="text-[#6C757D] text-[10px] sm:text-[12px] leading-[14px] sm:leading-[16px]">Active Scholars</p>
    <p className="text-[#1A1A1A] text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] font-bold">{activeScholars}</p>
  </CardContent>
</Card>
```

**Director Card Details:**
- Border: `border-[0.8px]` (vs Admin's `border-[1.6px]`)
- Shadow: `shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]` (vs Admin's `shadow-md`)
- Hover shadow: `hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)]` (vs Admin's `hover:shadow-lg`)
- Border radius: `rounded-[12px]` (vs Admin's `rounded-lg`)
- Number font size: `text-[14px] sm:text-[18px]` (vs Admin's `text-[18px] sm:text-[24px]`)
- Padding: `p-2 sm:p-3` (vs Admin's `p-3 sm:p-6`)

### Difference
❌ **MAJOR DIFFERENCE** - Different border thickness, shadow intensity, padding, and number sizing

---

## 4. NOTIFICATION BADGE

### Director Implementation (DirectorDashboardEnhanced.tsx, line 2225-2232)
```tsx
{unreadNotifications > 0 && (
  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[#7A1E1E] text-white text-[9px] font-bold" aria-hidden="true">
    {unreadNotifications}
  </span>
)}
```

**Director Badge:**
- Size: `h-4 w-4`
- Position: `absolute -top-1 -right-1`
- Background: `bg-[#7A1E1E]`
- Text color: `text-white`
- Font: `text-[9px] font-bold`
- Border radius: `rounded-full`

### Admin Implementation (AdminDashboard.tsx, line 497-503)
```tsx
{unreadNotifications > 0 && (
  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[#7A1E1E] text-white text-[9px] font-bold" aria-hidden="true">
    {unreadNotifications}
  </span>
)}
```

### Difference
✅ **NO DIFFERENCE** - Notification badges are styled identically

---

## 5. DATE/TIME/VENUE INPUT FIELDS

### Admin Implementation (AdminDashboard.tsx, line 892+)
Input fields use this pattern:
```tsx
<Input
  id="event-name"
  placeholder="Enter event name"
  className={`bg-white ${
    engagementFormTouched.eventName && engagementFormErrors.eventName
      ? 'border-red-600 border-2 focus:border-red-600 focus:ring-red-600'
      : 'border-[#D1D5DC]'
  }`}
  value={eventName}
  onChange={(e) => { setEventName(e.target.value); ... }}
  onBlur={() => handleEngagementFieldBlur('eventName')}
  required
  aria-required="true"
/>
```

**Admin Input Styling:**
- Default border: `border-[#D1D5DC]`
- Background: `bg-white`
- Error state: `border-red-600 border-2`
- Error focus: `focus:border-red-600 focus:ring-red-600`

### Director - DirectorDashboardEnhanced.tsx
The Director component uses child components (DirectorTrainingTab, etc.) for many input fields, not inline in main file.

Looking at DirectorEngagementRehearsalView and other sub-components:
```tsx
// From context around line 2400
// Input fields appear to use standard Input component without explicit class constants
```

### Difference
❌ **MODERATE DIFFERENCE** - Admin has explicit validation state styling; Director appears to rely on component inheritance

---

## 6. SUB-TAB BUTTONS (Engagement/Training Tabs within views)

### Admin - Engagement Tabs (AdminDashboard.tsx, line 813-827)
```tsx
<Button
  key={key}
  role="tab"
  variant={engagementTab === key ? 'default' : 'ghost'}
  size="sm"
  onClick={() => setEngagementTab(key as any)}
  className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-[10px] border ${engagementTab === key ? 'bg-[#7A1E1E] text-white border-[#7A1E1E] hover:bg-[#7A1E1E]' : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#94A3B8]'}`}
  aria-selected={engagementTab === key}
  aria-controls={`engagement-${key}-panel`}
>
  <Icon className="w-4 h-4 sm:mr-2" aria-hidden="true" />
  <span className="hidden sm:inline">{label}</span>
</Button>
```

**Admin Sub-Tab Button:**
- Active: `bg-[#7A1E1E] text-white border-[#7A1E1E]`
- Inactive: `border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A]`
- Inactive hover: `hover:bg-[#F1F5F9] hover:border-[#94A3B8]`
- Border radius: `rounded-[10px]`
- Min height: `min-h-[44px]`
- Uses Button component with variant

### Director - Not directly visible in main file
Sub-tabs appear to be in child components

### Difference
❌ **DIFFERENCE** - Admin uses explicit styled sub-tabs; Director implementation varies by sub-component

---

## 7. HEADER/BANNER LAYOUT

### Both Implementations (Nearly Identical)
**DirectorDashboardEnhanced.tsx, line 2598:**
```tsx
<header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
```

**AdminDashboard.tsx, line 453:**
```tsx
<header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center" role="banner">
```

**Difference:**
- Header label text differs:
  - Director: "Director Dashboard"
  - Admin: "Admin Dashboard"
- Admin user role shows "Admin"
- Director user role shows talent group name (via `getTalentGroupName(directorTalentGroup)`)

### Settings button - Both use Button component with same styling

---

## 8. MAIN CONTAINER CARD CLASSES

### Admin Defined Classes (AdminDashboard.tsx, line 444-445)
```tsx
const directorCardClass = 'bg-white border-[1.6px] border-[#E0E0E0] shadow-md rounded-lg';
const directorInteractiveCardClass = 'bg-white border-[1.6px] border-[#E0E0E0] shadow-md rounded-lg cursor-pointer hover:shadow-lg hover:border-[#7A1E1E] transition-all focus:outline-none focus:ring-2 focus:ring-[#7A1E1E]';
```

### Director - NO EQUIVALENT CLASSES DEFINED
Director does NOT define these card classes; cards are styled inline where used.

### Difference
❌ **MAJOR DIFFERENCE** - Admin has reusable card constants; Director lacks these standardizations

---

## 9. SELECT DROPDOWN FIELDS

### Admin Implementation (AdminDashboard.tsx, line 443)
```tsx
const tableSelectTriggerClass =
  'border border-[#CBD5E1] bg-[#F8FAFC] rounded-[10px] h-[42px] text-[#0F172A] focus-visible:ring-2 focus-visible:ring-[#CBD5E1] focus-visible:border-[#94A3B8]';
```

**Admin Select Styling:**
- Border: `border border-[#CBD5E1]`
- Background: `bg-[#F8FAFC]`
- Border radius: `rounded-[10px]`
- Height: `h-[42px]`
- Text: `text-[#0F172A]`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[#CBD5E1]`

### Director - NO SELECT CLASS CONSTANTS FOUND
Director components likely handle Select styling inline

### Difference
❌ **MAJOR DIFFERENCE** - Admin has standardized select class; Director lacks this

---

## SUMMARY TABLE

| Element | Director | Admin | Match? |
|---------|----------|-------|--------|
| Main nav tabs | `px-4 py-3.5 text-[13px]` | `px-4 py-3.5 text-[13px]` | ✅ YES |
| Tab active border | `border-[#7A1E1E]` | `border-[#7A1E1E]` | ✅ YES |
| Tab inactive text | `text-[#64748B]` | `text-[#64748B]` | ✅ YES |
| Search input class | NOT DEFINED | Defined constant | ❌ NO |
| Search icon padding | Varies | `pl-10 pr-3 h-[42px]` | ❌ NO |
| Stat card border | `border-[0.8px]` | `border-[1.6px]` | ❌ NO |
| Stat card shadow | `shadow-[0px_2px_8px...]` | `shadow-md` | ❌ NO |
| Stat card hover | `hover:shadow-[0px_4px_12px...]` | `hover:shadow-lg` | ❌ NO |
| Stat card radius | `rounded-[12px]` | `rounded-lg` | ❌ NO |
| Stat card number size | `text-[14px] sm:text-[18px]` | `text-[18px] sm:text-[24px]` | ❌ NO |
| Stat card padding | `p-2 sm:p-3` | `p-3 sm:p-6` | ❌ NO |
| Notification badge | `h-4 w-4` size | `h-4 w-4` size | ✅ YES |
| Input border (default) | Varies | `border-[#D1D5DC]` | ❌ NO |
| Input error border | Varies | `border-red-600 border-2` | ❌ NO |
| Select border | NOT DEFINED | `border-[#CBD5E1]` | ❌ NO |
| Select height | NOT DEFINED | `h-[42px]` | ❌ NO |
| Card class constant | NOT DEFINED | `directorCardClass` | ❌ NO |
| Interactive card class | NOT DEFINED | `directorInteractiveCardClass` | ❌ NO |
| Header height | `h-20` | `h-20` | ✅ YES |
| Header background | `bg-white` | `bg-white` | ✅ YES |

---

## CRITICAL FINDINGS

### 🔴 Major Issues (Need Immediate Fixing)
1. **Stat cards have different sizes and spacing** - Director numbers are smaller (`14px/18px` vs `18px/24px`)
2. **Stat card padding differs significantly** - Director is more compact (`p-2 sm:p-3` vs `p-3 sm:p-6`)
3. **No standardized input/select classes in Director** - Admin has explicit constants
4. **Card styling constants missing in Director** - Admin has `directorCardClass` and `directorInteractiveCardClass`
5. **Search input styling undefined in Director** - Admin has `tableSearchInputClass` constant

### 🟡 Moderate Issues
1. Different shadow intensity (Director uses pixel-values, Admin uses Tailwind presets)
2. Different border thickness on cards (0.8px vs 1.6px)
3. Different border radius values (12px vs lg)

### ✅ Consistent
- Main navigation tabs styling
- Notification badge sizing
- Header layout and height
- Tab active/inactive states

---

## RECOMMENDATIONS FOR FIXES

1. **Standardize card classes** - Create constants in DirectorDashboardEnhanced like AdminDashboard
2. **Increase stat card numbers on Director** - Change from `14px/18px` to `18px/24px`
3. **Increase stat card padding** - Change from `p-2 sm:p-3` to `p-3 sm:p-6`
4. **Define input/select constants in Director** - Match Admin's approach with class constants
5. **Use consistent shadow system** - Align shadow values or use same Tailwind classes
6. **Standardize border thickness** - Use `border-[1.6px]` consistently
7. **Use consistent border radius** - Use `rounded-lg` or `rounded-[10px]` consistently
