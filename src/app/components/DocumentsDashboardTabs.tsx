import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import {
  LogOut,
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  User,
  BarChart3,
  Users,
  GraduationCap,
  FileSignature,
  ClipboardCheck,
  ChevronRight
} from './ui/icons';
import { User as UserType } from '../App';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import { getTalentGroupColor, getTalentGroupName } from './ui/unc-colors';

interface DocumentsDashboardProps {
  user: UserType;
  onLogout: () => void;
  onNavigateBack: () => void;
  contentOnly?: boolean;
  restrictToGroup?: string;
}

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  category: 'scholarship-contract' | 'event-request' | 'event-approval' | 'performance-report' | 'scholar-records';
  talentGroup: string;
  relatedTo: string;
  uploadedBy: string;
  uploadedDate: Date;
  description: string;
  tags: string[];
  status?: 'pending' | 'approved' | 'completed';
  fileUrl?: string;
}

export function DocumentsDashboard({ user, onLogout, onNavigateBack, contentOnly, restrictToGroup }: DocumentsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string>('scholarship-contract');

  const [documents] = useState<Document[]>([
    {
      id: 'doc1',
      fileName: 'Scholarship Contract - Anna Marie Cruz.pdf',
      fileType: 'application/pdf',
      fileSize: '345 KB',
      category: 'scholarship-contract',
      talentGroup: 'glee-club',
      relatedTo: 'Anna Marie Cruz',
      uploadedBy: 'Director - Glee Club',
      uploadedDate: new Date('2024-09-15'),
      description: 'Official scholarship contract for academic year 2024-2025',
      tags: ['contract', 'scholarship', '2024-2025'],
      status: 'completed',
    },
    {
      id: 'doc2',
      fileName: 'Event Request - Foundation Day Performance.pdf',
      fileType: 'application/pdf',
      fileSize: '189 KB',
      category: 'event-request',
      talentGroup: 'marching-band',
      relatedTo: 'University Foundation Day',
      uploadedBy: 'Director - Marching Band',
      uploadedDate: new Date('2024-10-01'),
      description: 'Request letter for marching band participation in Foundation Day celebration',
      tags: ['foundation-day', 'request', 'performance'],
      status: 'approved',
    },
    {
      id: 'doc3',
      fileName: 'Event Approval - Sports Festival Opening.pdf',
      fileType: 'application/pdf',
      fileSize: '156 KB',
      category: 'event-approval',
      talentGroup: 'majorettes',
      relatedTo: 'Regional Sports Festival Opening',
      uploadedBy: 'Admin User',
      uploadedDate: new Date('2024-10-20'),
      description: 'Approved letter for majorettes performance at sports festival opening ceremony',
      tags: ['sports-festival', 'approved', 'official'],
      status: 'approved',
    },
    {
      id: 'doc4',
      fileName: 'Performance Report - Christmas Concert.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: '512 KB',
      category: 'performance-report',
      talentGroup: 'glee-club',
      relatedTo: 'Christmas Concert 2024',
      uploadedBy: 'Director - Glee Club',
      uploadedDate: new Date('2024-11-10'),
      description: 'Post-event performance report including attendance, repertoire, and audience feedback',
      tags: ['christmas', 'concert', 'report', 'performance'],
      status: 'completed',
    },
    {
      id: 'doc5',
      fileName: 'Scholarship Contract - Miguel Santos.pdf',
      fileType: 'application/pdf',
      fileSize: '338 KB',
      category: 'scholarship-contract',
      talentGroup: 'marching-band',
      relatedTo: 'Miguel Santos',
      uploadedBy: 'Director - Marching Band',
      uploadedDate: new Date('2024-09-20'),
      description: 'Official scholarship contract for academic year 2024-2025',
      tags: ['contract', 'scholarship', '2024-2025'],
      status: 'completed',
    },
    {
      id: 'doc6',
      fileName: 'Event Request - Community Outreach Dance Workshop.pdf',
      fileType: 'application/pdf',
      fileSize: '201 KB',
      category: 'event-request',
      talentGroup: 'dance-club',
      relatedTo: 'Community Outreach Program',
      uploadedBy: 'Admin User',
      uploadedDate: new Date('2024-11-05'),
      description: 'Request for approval to conduct free dance workshop for community youth',
      tags: ['community', 'workshop', 'outreach', 'request'],
      status: 'pending',
    },
    {
      id: 'doc7',
      fileName: 'Performance Report - Inter-University Competition.pdf',
      fileType: 'application/pdf',
      fileSize: '678 KB',
      category: 'performance-report',
      talentGroup: 'dance-club',
      relatedTo: 'Inter-University Dance Competition',
      uploadedBy: 'Director - Dance Club',
      uploadedDate: new Date('2024-11-28'),
      description: 'Comprehensive report including placement, scores, and judge feedback',
      tags: ['competition', 'report', 'inter-university'],
      status: 'completed',
    },
    {
      id: 'doc8',
      fileName: 'Scholar ID - Anna Marie Cruz.pdf',
      fileType: 'application/pdf',
      fileSize: '125 KB',
      category: 'scholar-records',
      talentGroup: 'glee-club',
      relatedTo: 'Anna Marie Cruz',
      uploadedBy: 'Anna Marie Cruz (Scholar)',
      uploadedDate: new Date('2024-09-18'),
      description: 'Official scholar identification card copy',
      tags: ['id', 'scholar', 'identification'],
      status: 'completed',
    },
    {
      id: 'doc9',
      fileName: 'Matriculation Form - Miguel Santos.pdf',
      fileType: 'application/pdf',
      fileSize: '234 KB',
      category: 'scholar-records',
      talentGroup: 'marching-band',
      relatedTo: 'Miguel Santos',
      uploadedBy: 'Miguel Santos (Scholar)',
      uploadedDate: new Date('2024-09-22'),
      description: 'Completed matriculation enrollment form for Fall 2024',
      tags: ['matriculation', 'enrollment', 'fall-2024'],
      status: 'completed',
    },
    {
      id: 'doc10',
      fileName: 'Grade Report - Fall 2024 - Anna Marie Cruz.pdf',
      fileType: 'application/pdf',
      fileSize: '189 KB',
      category: 'scholar-records',
      talentGroup: 'glee-club',
      relatedTo: 'Anna Marie Cruz',
      uploadedBy: 'Anna Marie Cruz (Scholar)',
      uploadedDate: new Date('2024-12-05'),
      description: 'Academic grade report for Fall semester 2024 - GPA 3.85',
      tags: ['grades', 'academic', 'fall-2024', 'transcript'],
      status: 'completed',
    },
    {
      id: 'doc11',
      fileName: 'Scholar ID - Jessica Reyes.pdf',
      fileType: 'application/pdf',
      fileSize: '118 KB',
      category: 'scholar-records',
      talentGroup: 'majorettes',
      relatedTo: 'Jessica Reyes',
      uploadedBy: 'Jessica Reyes (Scholar)',
      uploadedDate: new Date('2024-09-19'),
      description: 'Official scholar identification card copy',
      tags: ['id', 'scholar', 'identification'],
      status: 'completed',
    },
    {
      id: 'doc12',
      fileName: 'Grade Report - Fall 2024 - Miguel Santos.pdf',
      fileType: 'application/pdf',
      fileSize: '195 KB',
      category: 'scholar-records',
      talentGroup: 'marching-band',
      relatedTo: 'Miguel Santos',
      uploadedBy: 'Miguel Santos (Scholar)',
      uploadedDate: new Date('2024-12-04'),
      description: 'Academic grade report for Fall semester 2024 - GPA 3.92',
      tags: ['grades', 'academic', 'fall-2024', 'transcript'],
      status: 'completed',
    },
    // ========== ADDITIONAL SCHOLARSHIP CONTRACT DOCUMENTS (20+) ==========
    { id: 'doc13', fileName: 'Scholarship Contract - Gabriel Santos.pdf', fileType: 'application/pdf', fileSize: '342 KB', category: 'scholarship-contract', talentGroup: 'marching-band', relatedTo: 'Gabriel Santos', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-09-16'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc14', fileName: 'Scholarship Contract - Sophia Reyes.pdf', fileType: 'application/pdf', fileSize: '339 KB', category: 'scholarship-contract', talentGroup: 'glee-club', relatedTo: 'Sophia Reyes', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-09-17'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc15', fileName: 'Scholarship Contract - Diana Lopez.pdf', fileType: 'application/pdf', fileSize: '346 KB', category: 'scholarship-contract', talentGroup: 'majorettes', relatedTo: 'Diana Lopez', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-09-18'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc16', fileName: 'Scholarship Contract - Carlos Santos.pdf', fileType: 'application/pdf', fileSize: '341 KB', category: 'scholarship-contract', talentGroup: 'dance-club', relatedTo: 'Carlos Santos', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-09-19'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc17', fileName: 'Scholarship Contract - Rafael Cruz.pdf', fileType: 'application/pdf', fileSize: '344 KB', category: 'scholarship-contract', talentGroup: 'marching-band', relatedTo: 'Rafael Cruz', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-09-20'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc18', fileName: 'Scholarship Contract - Isabella Gonzales.pdf', fileType: 'application/pdf', fileSize: '348 KB', category: 'scholarship-contract', talentGroup: 'glee-club', relatedTo: 'Isabella Gonzales', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-09-21'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc19', fileName: 'Scholarship Contract - Hannah Fernandez.pdf', fileType: 'application/pdf', fileSize: '340 KB', category: 'scholarship-contract', talentGroup: 'majorettes', relatedTo: 'Hannah Fernandez', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-09-22'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc20', fileName: 'Scholarship Contract - Mikhail Fernandez.pdf', fileType: 'application/pdf', fileSize: '343 KB', category: 'scholarship-contract', talentGroup: 'dance-club', relatedTo: 'Mikhail Fernandez', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-09-23'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc21', fileName: 'Scholarship Contract - Daniel Rivera.pdf', fileType: 'application/pdf', fileSize: '347 KB', category: 'scholarship-contract', talentGroup: 'marching-band', relatedTo: 'Daniel Rivera', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-09-24'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc22', fileName: 'Scholarship Contract - Victoria Tan.pdf', fileType: 'application/pdf', fileSize: '345 KB', category: 'scholarship-contract', talentGroup: 'glee-club', relatedTo: 'Victoria Tan', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-09-25'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc23', fileName: 'Scholarship Contract - Stephanie Martinez.pdf', fileType: 'application/pdf', fileSize: '342 KB', category: 'scholarship-contract', talentGroup: 'majorettes', relatedTo: 'Stephanie Martinez', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-09-26'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc24', fileName: 'Scholarship Contract - Sophia Martinez.pdf', fileType: 'application/pdf', fileSize: '346 KB', category: 'scholarship-contract', talentGroup: 'dance-club', relatedTo: 'Sophia Martinez', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-09-27'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc25', fileName: 'Scholarship Contract - Christian Mercado.pdf', fileType: 'application/pdf', fileSize: '349 KB', category: 'scholarship-contract', talentGroup: 'marching-band', relatedTo: 'Christian Mercado', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-09-28'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc26', fileName: 'Scholarship Contract - Maria Santos.pdf', fileType: 'application/pdf', fileSize: '341 KB', category: 'scholarship-contract', talentGroup: 'glee-club', relatedTo: 'Maria Santos', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-09-29'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc27', fileName: 'Scholarship Contract - Alexa Ramos.pdf', fileType: 'application/pdf', fileSize: '344 KB', category: 'scholarship-contract', talentGroup: 'majorettes', relatedTo: 'Alexa Ramos', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-09-30'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc28', fileName: 'Scholarship Contract - Isabella Aquino.pdf', fileType: 'application/pdf', fileSize: '340 KB', category: 'scholarship-contract', talentGroup: 'dance-club', relatedTo: 'Isabella Aquino', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-10-01'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc29', fileName: 'Scholarship Contract - Joshua Garcia.pdf', fileType: 'application/pdf', fileSize: '343 KB', category: 'scholarship-contract', talentGroup: 'marching-band', relatedTo: 'Joshua Garcia', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-10-02'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc30', fileName: 'Scholarship Contract - Olivia Garcia.pdf', fileType: 'application/pdf', fileSize: '347 KB', category: 'scholarship-contract', talentGroup: 'glee-club', relatedTo: 'Olivia Garcia', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-10-03'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc31', fileName: 'Scholarship Contract - Kyla Aquino.pdf', fileType: 'application/pdf', fileSize: '345 KB', category: 'scholarship-contract', talentGroup: 'majorettes', relatedTo: 'Kyla Aquino', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-10-04'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc32', fileName: 'Scholarship Contract - Jasmine Cruz.pdf', fileType: 'application/pdf', fileSize: '348 KB', category: 'scholarship-contract', talentGroup: 'dance-club', relatedTo: 'Jasmine Cruz', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-10-05'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    { id: 'doc33', fileName: 'Scholarship Contract - Matthew Lopez.pdf', fileType: 'application/pdf', fileSize: '342 KB', category: 'scholarship-contract', talentGroup: 'marching-band', relatedTo: 'Matthew Lopez', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-10-06'), description: 'Official scholarship contract for academic year 2024-2025', tags: ['contract', 'scholarship', '2024-2025'], status: 'completed' },
    // ========== ADDITIONAL EVENT REQUEST DOCUMENTS (20+) ==========
    { id: 'doc34', fileName: 'Event Request - Christmas Concert.pdf', fileType: 'application/pdf', fileSize: '198 KB', category: 'event-request', talentGroup: 'glee-club', relatedTo: 'Christmas Concert 2024', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-10-15'), description: 'Request for annual Christmas concert performance', tags: ['christmas', 'concert', 'request'], status: 'approved' },
    { id: 'doc35', fileName: 'Event Request - Intramurals Opening.pdf', fileType: 'application/pdf', fileSize: '176 KB', category: 'event-request', talentGroup: 'marching-band', relatedTo: 'UNC Intramurals', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-09-28'), description: 'Request for intramurals opening ceremony performance', tags: ['intramurals', 'opening', 'request'], status: 'approved' },
    { id: 'doc36', fileName: 'Event Request - City Tourism Week.pdf', fileType: 'application/pdf', fileSize: '185 KB', category: 'event-request', talentGroup: 'dance-club', relatedTo: 'Naga Tourism Week', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-11-20'), description: 'Request for tourism week showcase performance', tags: ['tourism', 'showcase', 'request'], status: 'pending' },
    { id: 'doc37', fileName: 'Event Request - Graduation Ceremony.pdf', fileType: 'application/pdf', fileSize: '192 KB', category: 'event-request', talentGroup: 'marching-band', relatedTo: 'UNC Graduation 2025', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-11-15'), description: 'Request for graduation processional music', tags: ['graduation', 'ceremony', 'request'], status: 'approved' },
    { id: 'doc38', fileName: 'Event Request - Alumni Gala Night.pdf', fileType: 'application/pdf', fileSize: '188 KB', category: 'event-request', talentGroup: 'glee-club', relatedTo: 'Alumni Gala 2024', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-10-30'), description: 'Request for alumni fundraising gala performance', tags: ['alumni', 'gala', 'request'], status: 'approved' },
    { id: 'doc39', fileName: 'Event Request - Sports Festival Halftime.pdf', fileType: 'application/pdf', fileSize: '179 KB', category: 'event-request', talentGroup: 'majorettes', relatedTo: 'Regional Sports Festival', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-11-01'), description: 'Request for halftime show performance', tags: ['sports', 'halftime', 'request'], status: 'approved' },
    { id: 'doc40', fileName: 'Event Request - Cultural Festival.pdf', fileType: 'application/pdf', fileSize: '195 KB', category: 'event-request', talentGroup: 'dance-club', relatedTo: 'Bicol Cultural Festival', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-11-18'), description: 'Request for regional cultural showcase participation', tags: ['cultural', 'festival', 'request'], status: 'approved' },
    { id: 'doc41', fileName: 'Event Request - Medical Convention.pdf', fileType: 'application/pdf', fileSize: '172 KB', category: 'event-request', talentGroup: 'glee-club', relatedTo: 'Medical Society Convention', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-11-25'), description: 'Request for medical convention opening number', tags: ['medical', 'convention', 'request'], status: 'pending' },
    { id: 'doc42', fileName: 'Event Request - Youth Leadership Summit.pdf', fileType: 'application/pdf', fileSize: '183 KB', category: 'event-request', talentGroup: 'glee-club', relatedTo: 'Youth Summit 2025', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-12-01'), description: 'Request for youth leadership summit performance', tags: ['youth', 'leadership', 'request'], status: 'approved' },
    { id: 'doc43', fileName: 'Event Request - Independence Day Parade.pdf', fileType: 'application/pdf', fileSize: '191 KB', category: 'event-request', talentGroup: 'marching-band', relatedTo: 'Independence Day 2025', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-12-05'), description: 'Request for Independence Day parade participation', tags: ['independence', 'parade', 'request'], status: 'pending' },
    { id: 'doc44', fileName: 'Event Request - Corporate Partnership Event.pdf', fileType: 'application/pdf', fileSize: '177 KB', category: 'event-request', talentGroup: 'glee-club', relatedTo: 'Corporate Signing Ceremony', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-11-28'), description: 'Request for corporate partnership ceremony performance', tags: ['corporate', 'partnership', 'request'], status: 'approved' },
    { id: 'doc45', fileName: 'Event Request - Barangay Fiesta Parade.pdf', fileType: 'application/pdf', fileSize: '186 KB', category: 'event-request', talentGroup: 'marching-band', relatedTo: 'Barangay Fiesta', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-12-08'), description: 'Request for barangay fiesta street parade', tags: ['barangay', 'fiesta', 'request'], status: 'pending' },
    { id: 'doc46', fileName: 'Event Request - New Year Countdown.pdf', fileType: 'application/pdf', fileSize: '194 KB', category: 'event-request', talentGroup: 'dance-club', relatedTo: 'New Year 2025 Countdown', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-11-30'), description: 'Request for city New Year countdown performance', tags: ['new-year', 'countdown', 'request'], status: 'approved' },
    { id: 'doc47', fileName: 'Event Request - University Week Finale.pdf', fileType: 'application/pdf', fileSize: '189 KB', category: 'event-request', talentGroup: 'marching-band', relatedTo: 'University Week 2025', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-12-10'), description: 'Request for university week culmination performance', tags: ['university-week', 'finale', 'request'], status: 'pending' },
    { id: 'doc48', fileName: 'Event Request - Research Symposium.pdf', fileType: 'application/pdf', fileSize: '174 KB', category: 'event-request', talentGroup: 'glee-club', relatedTo: 'UNC Research Symposium', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-12-02'), description: 'Request for research symposium opening performance', tags: ['research', 'symposium', 'request'], status: 'approved' },
    { id: 'doc49', fileName: 'Event Request - Charity Gala.pdf', fileType: 'application/pdf', fileSize: '181 KB', category: 'event-request', talentGroup: 'glee-club', relatedTo: 'Rotary Charity Gala', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-11-22'), description: 'Request for charity fundraising gala performance', tags: ['charity', 'gala', 'request'], status: 'pending' },
    { id: 'doc50', fileName: 'Event Request - IT Summit Cultural Show.pdf', fileType: 'application/pdf', fileSize: '178 KB', category: 'event-request', talentGroup: 'dance-club', relatedTo: 'Bicol IT Summit', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-12-07'), description: 'Request for IT summit cultural presentation', tags: ['it-summit', 'technology', 'request'], status: 'pending' },
    { id: 'doc51', fileName: 'Event Request - Provincial Foundation Day.pdf', fileType: 'application/pdf', fileSize: '196 KB', category: 'event-request', talentGroup: 'marching-band', relatedTo: 'Camarines Sur Foundation', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-11-12'), description: 'Request for provincial foundation day grand performance', tags: ['provincial', 'foundation', 'request'], status: 'approved' },
    { id: 'doc52', fileName: 'Event Request - SM Anniversary Show.pdf', fileType: 'application/pdf', fileSize: '187 KB', category: 'event-request', talentGroup: 'majorettes', relatedTo: 'SM City Anniversary', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-11-19'), description: 'Request for SM anniversary celebration performance', tags: ['sm-mall', 'anniversary', 'request'], status: 'pending' },
    { id: 'doc53', fileName: 'Event Request - River Festival.pdf', fileType: 'application/pdf', fileSize: '182 KB', category: 'event-request', talentGroup: 'dance-club', relatedTo: 'Naga River Festival', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-12-04'), description: 'Request for environmental festival performance', tags: ['river', 'environment', 'request'], status: 'pending' },
    // ========== ADDITIONAL EVENT APPROVAL DOCUMENTS (20+) ==========
    { id: 'doc54', fileName: 'Event Approval - Foundation Day.pdf', fileType: 'application/pdf', fileSize: '163 KB', category: 'event-approval', talentGroup: 'marching-band', relatedTo: 'University Foundation Day', uploadedBy: 'Admin User', uploadedDate: new Date('2024-10-05'), description: 'Approved participation in foundation day celebration', tags: ['foundation-day', 'approved'], status: 'approved' },
    { id: 'doc55', fileName: 'Event Approval - Christmas Concert.pdf', fileType: 'application/pdf', fileSize: '158 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Christmas Concert 2024', uploadedBy: 'Admin User', uploadedDate: new Date('2024-10-18'), description: 'Approved annual Christmas concert performance', tags: ['christmas', 'approved'], status: 'approved' },
    { id: 'doc56', fileName: 'Event Approval - Sports Festival.pdf', fileType: 'application/pdf', fileSize: '161 KB', category: 'event-approval', talentGroup: 'majorettes', relatedTo: 'Regional Sports Festival', uploadedBy: 'Admin User', uploadedDate: new Date('2024-11-03'), description: 'Approved halftime show participation', tags: ['sports', 'approved'], status: 'approved' },
    { id: 'doc57', fileName: 'Event Approval - Cultural Festival.pdf', fileType: 'application/pdf', fileSize: '165 KB', category: 'event-approval', talentGroup: 'dance-club', relatedTo: 'Bicol Cultural Festival', uploadedBy: 'Admin User', uploadedDate: new Date('2024-11-20'), description: 'Approved regional cultural showcase participation', tags: ['cultural', 'approved'], status: 'approved' },
    { id: 'doc58', fileName: 'Event Approval - Graduation Ceremony.pdf', fileType: 'application/pdf', fileSize: '167 KB', category: 'event-approval', talentGroup: 'marching-band', relatedTo: 'UNC Graduation 2025', uploadedBy: 'Admin User', uploadedDate: new Date('2024-11-17'), description: 'Approved graduation processional performance', tags: ['graduation', 'approved'], status: 'approved' },
    { id: 'doc59', fileName: 'Event Approval - Alumni Gala.pdf', fileType: 'application/pdf', fileSize: '159 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Alumni Gala 2024', uploadedBy: 'Admin User', uploadedDate: new Date('2024-11-01'), description: 'Approved alumni fundraising gala performance', tags: ['alumni', 'approved'], status: 'approved' },
    { id: 'doc60', fileName: 'Event Approval - New Year Countdown.pdf', fileType: 'application/pdf', fileSize: '162 KB', category: 'event-approval', talentGroup: 'dance-club', relatedTo: 'New Year 2025 Countdown', uploadedBy: 'Admin User', uploadedDate: new Date('2024-12-01'), description: 'Approved city New Year countdown performance', tags: ['new-year', 'approved'], status: 'approved' },
    { id: 'doc61', fileName: 'Event Approval - Youth Summit.pdf', fileType: 'application/pdf', fileSize: '164 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Youth Summit 2025', uploadedBy: 'Admin User', uploadedDate: new Date('2024-12-03'), description: 'Approved youth leadership summit performance', tags: ['youth', 'approved'], status: 'approved' },
    { id: 'doc62', fileName: 'Event Approval - Corporate Partnership.pdf', fileType: 'application/pdf', fileSize: '160 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Corporate Signing Ceremony', uploadedBy: 'Admin User', uploadedDate: new Date('2024-11-29'), description: 'Approved corporate partnership ceremony performance', tags: ['corporate', 'approved'], status: 'approved' },
    { id: 'doc63', fileName: 'Event Approval - Research Symposium.pdf', fileType: 'application/pdf', fileSize: '157 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'UNC Research Symposium', uploadedBy: 'Admin User', uploadedDate: new Date('2024-12-04'), description: 'Approved research symposium opening performance', tags: ['research', 'approved'], status: 'approved' },
    { id: 'doc64', fileName: 'Event Approval - Provincial Foundation.pdf', fileType: 'application/pdf', fileSize: '166 KB', category: 'event-approval', talentGroup: 'marching-band', relatedTo: 'Camarines Sur Foundation', uploadedBy: 'Admin User', uploadedDate: new Date('2024-11-14'), description: 'Approved provincial foundation day performance', tags: ['provincial', 'approved'], status: 'approved' },
    { id: 'doc65', fileName: 'Event Approval - Intramurals Opening.pdf', fileType: 'application/pdf', fileSize: '155 KB', category: 'event-approval', talentGroup: 'marching-band', relatedTo: 'UNC Intramurals', uploadedBy: 'Admin User', uploadedDate: new Date('2024-09-30'), description: 'Approved intramurals opening ceremony', tags: ['intramurals', 'approved'], status: 'approved' },
    { id: 'doc66', fileName: 'Event Approval - Tourism Week.pdf', fileType: 'application/pdf', fileSize: '168 KB', category: 'event-approval', talentGroup: 'dance-club', relatedTo: 'Naga Tourism Week', uploadedBy: 'Admin User', uploadedDate: new Date('2024-11-22'), description: 'Approved tourism week showcase participation', tags: ['tourism', 'approved'], status: 'approved' },
    { id: 'doc67', fileName: 'Event Approval - Science Fair Opening.pdf', fileType: 'application/pdf', fileSize: '162 KB', category: 'event-approval', talentGroup: 'marching-band', relatedTo: 'Bicol Science Fair', uploadedBy: 'Admin User', uploadedDate: new Date('2024-09-10'), description: 'Approved science fair opening ceremony', tags: ['science', 'approved'], status: 'approved' },
    { id: 'doc68', fileName: 'Event Approval - Teacher Recognition.pdf', fileType: 'application/pdf', fileSize: '159 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Teacher Recognition Day', uploadedBy: 'Admin User', uploadedDate: new Date('2024-09-28'), description: 'Approved teacher appreciation performance', tags: ['teachers', 'approved'], status: 'approved' },
    { id: 'doc69', fileName: 'Event Approval - Peñafrancia Festival.pdf', fileType: 'application/pdf', fileSize: '171 KB', category: 'event-approval', talentGroup: 'marching-band', relatedTo: 'Peñafrancia Festival', uploadedBy: 'Admin User', uploadedDate: new Date('2024-08-25'), description: 'Approved festival parade participation', tags: ['penafrancia', 'approved'], status: 'approved' },
    { id: 'doc70', fileName: 'Event Approval - Alumni Gathering.pdf', fileType: 'application/pdf', fileSize: '157 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Alumni Gathering', uploadedBy: 'Admin User', uploadedDate: new Date('2024-08-22'), description: 'Approved alumni reunion entertainment', tags: ['alumni', 'approved'], status: 'approved' },
    { id: 'doc71', fileName: 'Event Approval - Donors Night.pdf', fileType: 'application/pdf', fileSize: '163 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Scholarship Donors Night', uploadedBy: 'Admin User', uploadedDate: new Date('2024-12-10'), description: 'Approved scholarship donors appreciation performance', tags: ['donors', 'approved'], status: 'approved' },
    { id: 'doc72', fileName: 'Event Approval - University Week.pdf', fileType: 'application/pdf', fileSize: '165 KB', category: 'event-approval', talentGroup: 'marching-band', relatedTo: 'University Week 2025', uploadedBy: 'Admin User', uploadedDate: new Date('2024-12-12'), description: 'Approved university week culmination performance', tags: ['university-week', 'approved'], status: 'approved' },
    { id: 'doc73', fileName: 'Event Approval - Charity Concert.pdf', fileType: 'application/pdf', fileSize: '160 KB', category: 'event-approval', talentGroup: 'glee-club', relatedTo: 'Christmas Charity Concert', uploadedBy: 'Admin User', uploadedDate: new Date('2024-12-08'), description: 'Approved charity fundraising concert', tags: ['charity', 'approved'], status: 'approved' },
    // ========== ADDITIONAL PERFORMANCE REPORT DOCUMENTS (20+) ==========
    { id: 'doc74', fileName: 'Performance Report - Foundation Day 2024.pdf', fileType: 'application/pdf', fileSize: '589 KB', category: 'performance-report', talentGroup: 'marching-band', relatedTo: 'University Foundation Day', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-11-18'), description: 'Comprehensive report on foundation day performance', tags: ['foundation', 'report'], status: 'completed' },
    { id: 'doc75', fileName: 'Performance Report - Intramurals 2024.pdf', fileType: 'application/pdf', fileSize: '512 KB', category: 'performance-report', talentGroup: 'marching-band', relatedTo: 'UNC Intramurals', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-10-28'), description: 'Intramurals opening ceremony performance analysis', tags: ['intramurals', 'report'], status: 'completed' },
    { id: 'doc76', fileName: 'Performance Report - Teacher Recognition Day.pdf', fileType: 'application/pdf', fileSize: '478 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Teacher Recognition Day', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-10-08'), description: 'Teacher appreciation program performance feedback', tags: ['teachers', 'report'], status: 'completed' },
    { id: 'doc77', fileName: 'Performance Report - Science Fair Opening.pdf', fileType: 'application/pdf', fileSize: '534 KB', category: 'performance-report', talentGroup: 'marching-band', relatedTo: 'Bicol Science Fair', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-09-22'), description: 'Regional science fair opening ceremony report', tags: ['science', 'report'], status: 'completed' },
    { id: 'doc78', fileName: 'Performance Report - Peñafrancia Parade.pdf', fileType: 'application/pdf', fileSize: '621 KB', category: 'performance-report', talentGroup: 'marching-band', relatedTo: 'Peñafrancia Festival', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-09-12'), description: 'Festival parade performance evaluation and feedback', tags: ['penafrancia', 'report'], status: 'completed' },
    { id: 'doc79', fileName: 'Performance Report - Alumni Gathering Concert.pdf', fileType: 'application/pdf', fileSize: '498 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Alumni Gathering', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-09-03'), description: 'Alumni reunion entertainment performance report', tags: ['alumni', 'report'], status: 'completed' },
    { id: 'doc80', fileName: 'Performance Report - Sports Festival Halftime.pdf', fileType: 'application/pdf', fileSize: '567 KB', category: 'performance-report', talentGroup: 'majorettes', relatedTo: 'Regional Sports Festival', uploadedBy: 'Director - Majorettes', uploadedDate: new Date('2024-11-26'), description: 'Halftime show performance evaluation', tags: ['sports', 'report'], status: 'completed' },
    { id: 'doc81', fileName: 'Performance Report - Cultural Festival Showcase.pdf', fileType: 'application/pdf', fileSize: '612 KB', category: 'performance-report', talentGroup: 'dance-club', relatedTo: 'Bicol Cultural Festival', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-11-25'), description: 'Regional cultural showcase competition report', tags: ['cultural', 'report'], status: 'completed' },
    { id: 'doc82', fileName: 'Performance Report - Alumni Gala Night.pdf', fileType: 'application/pdf', fileSize: '523 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Alumni Gala 2024', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-11-15'), description: 'Fundraising gala performance evaluation', tags: ['alumni', 'report'], status: 'completed' },
    { id: 'doc83', fileName: 'Performance Report - Tourism Week Showcase.pdf', fileType: 'application/pdf', fileSize: '489 KB', category: 'performance-report', talentGroup: 'dance-club', relatedTo: 'Naga Tourism Week', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2024-11-24'), description: 'Tourism week cultural showcase report', tags: ['tourism', 'report'], status: 'completed' },
    { id: 'doc84', fileName: 'Performance Report - Youth Summit Opening.pdf', fileType: 'application/pdf', fileSize: '456 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Youth Summit 2025', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-12-06'), description: 'Youth leadership summit opening number report', tags: ['youth', 'report'], status: 'completed' },
    { id: 'doc85', fileName: 'Performance Report - Corporate Partnership Event.pdf', fileType: 'application/pdf', fileSize: '467 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Corporate Signing Ceremony', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-12-02'), description: 'Corporate partnership ceremony performance report', tags: ['corporate', 'report'], status: 'completed' },
    { id: 'doc86', fileName: 'Performance Report - Research Symposium.pdf', fileType: 'application/pdf', fileSize: '501 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'UNC Research Symposium', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-12-09'), description: 'Research symposium opening performance analysis', tags: ['research', 'report'], status: 'completed' },
    { id: 'doc87', fileName: 'Performance Report - Provincial Foundation Day.pdf', fileType: 'application/pdf', fileSize: '634 KB', category: 'performance-report', talentGroup: 'marching-band', relatedTo: 'Camarines Sur Foundation', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-11-18'), description: 'Provincial foundation day grand performance report', tags: ['provincial', 'report'], status: 'completed' },
    { id: 'doc88', fileName: 'Performance Report - Donors Appreciation Night.pdf', fileType: 'application/pdf', fileSize: '478 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Scholarship Donors Night', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-12-11'), description: 'Scholarship donors appreciation performance report', tags: ['donors', 'report'], status: 'completed' },
    { id: 'doc89', fileName: 'Performance Report - New Year Countdown.pdf', fileType: 'application/pdf', fileSize: '545 KB', category: 'performance-report', talentGroup: 'dance-club', relatedTo: 'New Year 2025 Countdown', uploadedBy: 'Director - Dance Club', uploadedDate: new Date('2025-01-02'), description: 'City New Year countdown performance evaluation', tags: ['new-year', 'report'], status: 'completed' },
    { id: 'doc90', fileName: 'Performance Report - Charity Concert.pdf', fileType: 'application/pdf', fileSize: '512 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Christmas Charity Concert', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-12-20'), description: 'Christmas charity fundraising concert report', tags: ['charity', 'report'], status: 'completed' },
    { id: 'doc91', fileName: 'Performance Report - University Week Finale.pdf', fileType: 'application/pdf', fileSize: '598 KB', category: 'performance-report', talentGroup: 'marching-band', relatedTo: 'University Week 2025', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2024-12-15'), description: 'University week culmination performance report', tags: ['university-week', 'report'], status: 'completed' },
    { id: 'doc92', fileName: 'Performance Report - Medical Convention.pdf', fileType: 'application/pdf', fileSize: '467 KB', category: 'performance-report', talentGroup: 'glee-club', relatedTo: 'Medical Society Convention', uploadedBy: 'Director - Glee Club', uploadedDate: new Date('2024-11-30'), description: 'Medical convention opening ceremony report', tags: ['medical', 'report'], status: 'completed' },
    { id: 'doc93', fileName: 'Performance Report - Graduation Ceremony.pdf', fileType: 'application/pdf', fileSize: '534 KB', category: 'performance-report', talentGroup: 'marching-band', relatedTo: 'UNC Graduation 2025', uploadedBy: 'Director - Marching Band', uploadedDate: new Date('2025-03-30'), description: 'Graduation commencement exercises performance report', tags: ['graduation', 'report'], status: 'completed' },
    // ========== ADDITIONAL SCHOLAR RECORDS DOCUMENTS (20+) ==========
    { id: 'doc94', fileName: 'Scholar ID - Gabriel Santos.pdf', fileType: 'application/pdf', fileSize: '122 KB', category: 'scholar-records', talentGroup: 'marching-band', relatedTo: 'Gabriel Santos', uploadedBy: 'Gabriel Santos (Scholar)', uploadedDate: new Date('2024-09-20'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
    { id: 'doc95', fileName: 'Scholar ID - Sophia Reyes.pdf', fileType: 'application/pdf', fileSize: '119 KB', category: 'scholar-records', talentGroup: 'glee-club', relatedTo: 'Sophia Reyes', uploadedBy: 'Sophia Reyes (Scholar)', uploadedDate: new Date('2024-09-21'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
    { id: 'doc96', fileName: 'Grade Report - Fall 2024 - Gabriel Santos.pdf', fileType: 'application/pdf', fileSize: '192 KB', category: 'scholar-records', talentGroup: 'marching-band', relatedTo: 'Gabriel Santos', uploadedBy: 'Gabriel Santos (Scholar)', uploadedDate: new Date('2024-12-06'), description: 'Academic grade report for Fall 2024 - GPA 3.78', tags: ['grades', 'academic'], status: 'completed' },
    { id: 'doc97', fileName: 'Grade Report - Fall 2024 - Sophia Reyes.pdf', fileType: 'application/pdf', fileSize: '188 KB', category: 'scholar-records', talentGroup: 'glee-club', relatedTo: 'Sophia Reyes', uploadedBy: 'Sophia Reyes (Scholar)', uploadedDate: new Date('2024-12-05'), description: 'Academic grade report for Fall 2024 - GPA 3.91', tags: ['grades', 'academic'], status: 'completed' },
    { id: 'doc98', fileName: 'Matriculation Form - Rafael Cruz.pdf', fileType: 'application/pdf', fileSize: '241 KB', category: 'scholar-records', talentGroup: 'marching-band', relatedTo: 'Rafael Cruz', uploadedBy: 'Rafael Cruz (Scholar)', uploadedDate: new Date('2024-09-23'), description: 'Enrollment matriculation form Fall 2024', tags: ['matriculation', 'enrollment'], status: 'completed' },
    { id: 'doc99', fileName: 'Matriculation Form - Isabella Gonzales.pdf', fileType: 'application/pdf', fileSize: '238 KB', category: 'scholar-records', talentGroup: 'glee-club', relatedTo: 'Isabella Gonzales', uploadedBy: 'Isabella Gonzales (Scholar)', uploadedDate: new Date('2024-09-24'), description: 'Enrollment matriculation form Fall 2024', tags: ['matriculation', 'enrollment'], status: 'completed' },
    { id: 'doc100', fileName: 'Scholar ID - Diana Lopez.pdf', fileType: 'application/pdf', fileSize: '121 KB', category: 'scholar-records', talentGroup: 'majorettes', relatedTo: 'Diana Lopez', uploadedBy: 'Diana Lopez (Scholar)', uploadedDate: new Date('2024-09-22'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
    { id: 'doc101', fileName: 'Scholar ID - Carlos Santos.pdf', fileType: 'application/pdf', fileSize: '120 KB', category: 'scholar-records', talentGroup: 'dance-club', relatedTo: 'Carlos Santos', uploadedBy: 'Carlos Santos (Scholar)', uploadedDate: new Date('2024-09-23'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
    { id: 'doc102', fileName: 'Grade Report - Fall 2024 - Diana Lopez.pdf', fileType: 'application/pdf', fileSize: '186 KB', category: 'scholar-records', talentGroup: 'majorettes', relatedTo: 'Diana Lopez', uploadedBy: 'Diana Lopez (Scholar)', uploadedDate: new Date('2024-12-04'), description: 'Academic grade report for Fall 2024 - GPA 3.82', tags: ['grades', 'academic'], status: 'completed' },
    { id: 'doc103', fileName: 'Grade Report - Fall 2024 - Carlos Santos.pdf', fileType: 'application/pdf', fileSize: '191 KB', category: 'scholar-records', talentGroup: 'dance-club', relatedTo: 'Carlos Santos', uploadedBy: 'Carlos Santos (Scholar)', uploadedDate: new Date('2024-12-03'), description: 'Academic grade report for Fall 2024 - GPA 3.89', tags: ['grades', 'academic'], status: 'completed' },
    { id: 'doc104', fileName: 'Matriculation Form - Hannah Fernandez.pdf', fileType: 'application/pdf', fileSize: '236 KB', category: 'scholar-records', talentGroup: 'majorettes', relatedTo: 'Hannah Fernandez', uploadedBy: 'Hannah Fernandez (Scholar)', uploadedDate: new Date('2024-09-25'), description: 'Enrollment matriculation form Fall 2024', tags: ['matriculation', 'enrollment'], status: 'completed' },
    { id: 'doc105', fileName: 'Matriculation Form - Mikhail Fernandez.pdf', fileType: 'application/pdf', fileSize: '242 KB', category: 'scholar-records', talentGroup: 'dance-club', relatedTo: 'Mikhail Fernandez', uploadedBy: 'Mikhail Fernandez (Scholar)', uploadedDate: new Date('2024-09-26'), description: 'Enrollment matriculation form Fall 2024', tags: ['matriculation', 'enrollment'], status: 'completed' },
    { id: 'doc106', fileName: 'Scholar ID - Daniel Rivera.pdf', fileType: 'application/pdf', fileSize: '123 KB', category: 'scholar-records', talentGroup: 'marching-band', relatedTo: 'Daniel Rivera', uploadedBy: 'Daniel Rivera (Scholar)', uploadedDate: new Date('2024-09-27'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
    { id: 'doc107', fileName: 'Scholar ID - Victoria Tan.pdf', fileType: 'application/pdf', fileSize: '117 KB', category: 'scholar-records', talentGroup: 'glee-club', relatedTo: 'Victoria Tan', uploadedBy: 'Victoria Tan (Scholar)', uploadedDate: new Date('2024-09-28'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
    { id: 'doc108', fileName: 'Grade Report - Fall 2024 - Daniel Rivera.pdf', fileType: 'application/pdf', fileSize: '193 KB', category: 'scholar-records', talentGroup: 'marching-band', relatedTo: 'Daniel Rivera', uploadedBy: 'Daniel Rivera (Scholar)', uploadedDate: new Date('2024-12-02'), description: 'Academic grade report for Fall 2024 - GPA 3.75', tags: ['grades', 'academic'], status: 'completed' },
    { id: 'doc109', fileName: 'Grade Report - Fall 2024 - Victoria Tan.pdf', fileType: 'application/pdf', fileSize: '190 KB', category: 'scholar-records', talentGroup: 'glee-club', relatedTo: 'Victoria Tan', uploadedBy: 'Victoria Tan (Scholar)', uploadedDate: new Date('2024-12-01'), description: 'Academic grade report for Fall 2024 - GPA 3.94', tags: ['grades', 'academic'], status: 'completed' },
    { id: 'doc110', fileName: 'Matriculation Form - Stephanie Martinez.pdf', fileType: 'application/pdf', fileSize: '239 KB', category: 'scholar-records', talentGroup: 'majorettes', relatedTo: 'Stephanie Martinez', uploadedBy: 'Stephanie Martinez (Scholar)', uploadedDate: new Date('2024-09-29'), description: 'Enrollment matriculation form Fall 2024', tags: ['matriculation', 'enrollment'], status: 'completed' },
    { id: 'doc111', fileName: 'Matriculation Form - Sophia Martinez.pdf', fileType: 'application/pdf', fileSize: '237 KB', category: 'scholar-records', talentGroup: 'dance-club', relatedTo: 'Sophia Martinez', uploadedBy: 'Sophia Martinez (Scholar)', uploadedDate: new Date('2024-09-30'), description: 'Enrollment matriculation form Fall 2024', tags: ['matriculation', 'enrollment'], status: 'completed' },
    { id: 'doc112', fileName: 'Scholar ID - Christian Mercado.pdf', fileType: 'application/pdf', fileSize: '124 KB', category: 'scholar-records', talentGroup: 'marching-band', relatedTo: 'Christian Mercado', uploadedBy: 'Christian Mercado (Scholar)', uploadedDate: new Date('2024-10-01'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
    { id: 'doc113', fileName: 'Scholar ID - Maria Santos.pdf', fileType: 'application/pdf', fileSize: '118 KB', category: 'scholar-records', talentGroup: 'glee-club', relatedTo: 'Maria Santos', uploadedBy: 'Maria Santos (Scholar)', uploadedDate: new Date('2024-10-02'), description: 'Official scholar identification card copy', tags: ['id', 'scholar'], status: 'completed' },
  ]);

  const categories = [
    { value: 'scholarship-contract', label: 'Scholarship Contracts', icon: FileSignature },
    { value: 'event-request', label: 'Event Requests', icon: ClipboardCheck },
    { value: 'event-approval', label: 'Event Approvals', icon: ClipboardCheck },
    { value: 'performance-report', label: 'Performance Reports', icon: BarChart3 },
  ];

  const talentGroups = [
    { value: 'marching-band', label: 'Marching Band' },
    { value: 'majorettes', label: 'Majorettes' },
    { value: 'glee-club', label: 'Glee Club' },
    { value: 'dance-club', label: 'Dance Club' },
  ];

  const getFilteredDocuments = (category?: string) => {
    let filtered = documents;

    if (restrictToGroup) {
      filtered = filtered.filter(doc => doc.talentGroup === restrictToGroup);
    }

    if (category && category !== 'all') {
      // Handle "event-documents" which combines event-request and event-approval
      if (category === 'event-documents') {
        filtered = filtered.filter(doc => doc.category === 'event-request' || doc.category === 'event-approval');
      } else {
        filtered = filtered.filter(doc => doc.category === category);
      }
    }

    filtered = filtered.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.relatedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesGroup = groupFilter === 'all' || doc.talentGroup === groupFilter;
      
      return matchesSearch && matchesGroup;
    });

    return filtered;
  };

  const handleDownloadDocument = (doc: Document) => {
    toast.success(`Downloading ${doc.fileName}...`);
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'scholar-records') return <GraduationCap className="h-4 w-4" />;
    const cat = categories.find(c => c.value === category);
    return cat ? <cat.icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'scholarship-contract':
        return 'bg-purple-100 text-purple-800';
      case 'event-request':
        return 'bg-blue-100 text-blue-800';
      case 'event-approval':
        return 'bg-green-100 text-green-800';
      case 'performance-report':
        return 'bg-orange-100 text-orange-800';
      case 'scholar-records':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCategoryLabel = (category: string) => {
    if (category === 'scholar-records') return 'Scholar Records';
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const restrictedDocs = restrictToGroup ? documents.filter(d => d.talentGroup === restrictToGroup) : documents;
  const scholarshipContracts = restrictedDocs.filter(d => d.category === 'scholarship-contract').length;
  const eventDocuments = restrictedDocs.filter(d => d.category === 'event-request' || d.category === 'event-approval').length;
  const performanceReports = restrictedDocs.filter(d => d.category === 'performance-report').length;
  const scholarRecords = restrictedDocs.filter(d => d.category === 'scholar-records').length;

  const openDocPreview = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPreviewDialog(true);
  };

  const renderDocumentTable = (docs: Document[]) => {
    if (docs.length === 0) {
      return (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-[#6c757d] mx-auto mb-4" />
          <p className="text-[#6c757d]">No documents found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      );
    }

    return (
      <>
        {/* Mobile: tappable card list */}
        <div className="md:hidden space-y-2 overflow-y-auto max-h-[640px]">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="p-3 border border-[#e0e0e0] rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={() => openDocPreview(doc)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-[#6c757d] shrink-0" />
                  <span className="text-sm text-[#1a1a1a] truncate">{doc.fileName}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6c757d] shrink-0" />
              </div>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap pl-6">
                {!restrictToGroup && (
                  <Badge className="text-white text-[10px]" style={{ backgroundColor: getTalentGroupColor(doc.talentGroup) }}>
                    {getTalentGroupName(doc.talentGroup)}
                  </Badge>
                )}
                <span className="text-xs text-[#6c757d]">
                  {doc.uploadedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: clickable table rows */}
        <div className="hidden md:block max-h-[420px] overflow-auto w-full">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                {!restrictToGroup && <TableHead>Talent Group</TableHead>}
                <TableHead>Related To</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((doc) => (
                <TableRow key={doc.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openDocPreview(doc)}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-[#6c757d]" />
                      <span className="text-sm">{doc.fileName}</span>
                    </div>
                  </TableCell>
                  {!restrictToGroup && (
                    <TableCell>
                      <Badge className="text-white" style={{ backgroundColor: getTalentGroupColor(doc.talentGroup) }}>
                        {getTalentGroupName(doc.talentGroup)}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-sm">{doc.relatedTo}</TableCell>
                  <TableCell className="text-sm">{doc.uploadedBy}</TableCell>
                  <TableCell className="text-sm">
                    {doc.uploadedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  };

  if (contentOnly) {
    return (
      <div className="space-y-4">
        {/* Quick Stats */}
        <div className={`grid grid-cols-2 gap-2 sm:gap-4 ${restrictToGroup ? 'lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          <Card 
            className="bg-white border-[#E5E7EB] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
            onClick={() => setActiveTab('scholarship-contract')}
          >
            <CardContent className="p-2 sm:p-3">
              <p className="text-[#6B7280] text-[12px] leading-[16px]">Scholarship Contracts</p>
              <p className="text-[#1A1A1A] text-[18px] leading-[24px] font-bold">{scholarshipContracts}</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
            onClick={() => setActiveTab('event-documents')}
          >
            <CardContent className="p-2 sm:p-3">
              <p className="text-[#6C757D] text-[12px] leading-[16px]">Event Documents</p>
              <p className="text-[#1A1A1A] text-[18px] leading-[24px] font-bold">{eventDocuments}</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
            onClick={() => setActiveTab('performance-report')}
          >
            <CardContent className="p-2 sm:p-3">
              <p className="text-[#6C757D] text-[12px] leading-[16px]">Performance Reports</p>
              <p className="text-[#1A1A1A] text-[18px] leading-[24px] font-bold">{performanceReports}</p>
            </CardContent>
          </Card>

          {restrictToGroup && (
            <Card 
              className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:border-[#7A1E1E] transition-all"
              onClick={() => setActiveTab('scholar-records')}
            >
              <CardContent className="p-2 sm:p-3">
                <p className="text-[#6C757D] text-[12px] leading-[16px]">Scholar Records</p>
                <p className="text-[#1A1A1A] text-[18px] leading-[24px] font-bold">{scholarRecords}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documents Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1 mb-6">
          <Button
            variant={activeTab === 'scholarship-contract' ? 'default' : 'outline'}
            onClick={() => setActiveTab('scholarship-contract')}
            className={`shrink-0 whitespace-nowrap ${activeTab === 'scholarship-contract' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
          >
            <FileSignature className="w-4 h-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Scholarship Contracts</span>
          </Button>
          <Button
            variant={activeTab === 'event-documents' ? 'default' : 'outline'}
            onClick={() => setActiveTab('event-documents')}
            className={`shrink-0 whitespace-nowrap ${activeTab === 'event-documents' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
          >
            <ClipboardCheck className="w-4 h-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Event Documents</span>
          </Button>
          <Button
            variant={activeTab === 'performance-report' ? 'default' : 'outline'}
            onClick={() => setActiveTab('performance-report')}
            className={`shrink-0 whitespace-nowrap ${activeTab === 'performance-report' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
          >
            <BarChart3 className="w-4 h-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Performance Reports</span>
          </Button>
          {restrictToGroup && (
            <Button
              variant={activeTab === 'scholar-records' ? 'default' : 'outline'}
              onClick={() => setActiveTab('scholar-records')}
              className={`shrink-0 whitespace-nowrap ${activeTab === 'scholar-records' ? 'bg-[#7A1E1E] text-white hover:bg-[#6A1919]' : 'border-[#E0E0E0] text-[#6C757D] hover:bg-[#F8F9FA]'}`}
            >
              <GraduationCap className="w-4 h-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Scholar Records</span>
            </Button>
          )}
        </div>

        <Card className="bg-white border-[#E0E0E0] border-[0.8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] rounded-[12px]">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              {/* Scholarship Contracts Tab */}
              <TabsContent value="scholarship-contract" className="space-y-4 min-h-[600px]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none z-10" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#D1D5DC] bg-white h-[40px]"
                    />
                  </div>
                  {!restrictToGroup && (
                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                      <SelectTrigger className="w-[180px] border-2 border-[#880808] bg-white h-[40px]">
                        <SelectValue placeholder="All Groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {talentGroups.map(group => (
                          <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {renderDocumentTable(getFilteredDocuments('scholarship-contract'))}
              </TabsContent>

              {/* Event Documents Tab */}
              <TabsContent value="event-documents" className="space-y-4 min-h-[600px]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none z-10" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#D1D5DC] bg-white h-[40px]"
                    />
                  </div>
                  {!restrictToGroup && (
                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                      <SelectTrigger className="w-[180px] border-2 border-[#7A1E1E] bg-white h-[40px]">
                        <SelectValue placeholder="All Groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {talentGroups.map(group => (
                          <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {renderDocumentTable(getFilteredDocuments('event-documents'))}
              </TabsContent>

              {/* Performance Reports Tab */}
              <TabsContent value="performance-report" className="space-y-4 min-h-[600px]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none z-10" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-[#D1D5DC] bg-white h-[40px]"
                    />
                  </div>
                  {!restrictToGroup && (
                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                      <SelectTrigger className="w-[180px] border-2 border-[#880808] bg-white h-[40px]">
                        <SelectValue placeholder="All Groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {talentGroups.map(group => (
                          <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {renderDocumentTable(getFilteredDocuments('performance-report'))}
              </TabsContent>

              {/* Scholar Records Tab - Only for Directors */}
              {restrictToGroup && (
                <TabsContent value="scholar-records" className="space-y-4 min-h-[600px]">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none z-10" />
                      <Input
                        placeholder="Search scholar records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#D1D5DC] bg-white h-[40px]"
                      />
                    </div>
                  </div>
                  {renderDocumentTable(getFilteredDocuments('scholar-records'))}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Document Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-[95vw] sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#7A1E1E]">Document Details</DialogTitle>
              <DialogDescription>
                View document information and metadata
              </DialogDescription>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#7A1E1E]/10 flex items-center justify-center">
                      {getCategoryIcon(selectedDocument.category)}
                    </div>
                    <div>
                      <h3 className="text-[#7A1E1E]">{selectedDocument.fileName}</h3>
                      <p className="text-sm text-[#6c757d] mt-1">{selectedDocument.fileSize}</p>
                    </div>
                  </div>
                  <Badge className={getCategoryBadgeColor(selectedDocument.category)}>
                    {formatCategoryLabel(selectedDocument.category)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-[#E0E0E0]">
                  <div>
                    <p className="text-sm text-[#6c757d] mb-2">Talent Group</p>
                    <Badge 
                      className="text-white"
                      style={{ backgroundColor: getTalentGroupColor(selectedDocument.talentGroup) }}
                    >
                      {getTalentGroupName(selectedDocument.talentGroup)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c757d] mb-2">Related To</p>
                    <p className="text-sm text-[#7A1E1E]">{selectedDocument.relatedTo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6c757d] mb-2">Uploaded By</p>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-[#6c757d]" />
                      <p className="text-sm text-[#7A1E1E]">{selectedDocument.uploadedBy}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6c757d] mb-2">Upload Date</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-[#6c757d]" />
                      <p className="text-sm text-[#7A1E1E]">
                        {selectedDocument.uploadedDate.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {selectedDocument.description && (
                    <div>
                      <p className="text-sm text-[#6c757d] mb-2">Description</p>
                      <p className="text-sm">{selectedDocument.description}</p>
                    </div>
                  )}
                </div>

                {selectedDocument.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-[#6c757d] mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-[#E0E0E0]">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadDocument(selectedDocument)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full standalone view (not used in current setup, but keeping for completeness)
  return <div>Standalone view not implemented</div>;
}