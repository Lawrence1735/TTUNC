import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Trash2,
  Plus,
  CheckCircle
} from './ui/icons';
import { User as UserType } from '../App';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import { getTalentGroupColor, getTalentGroupName } from './ui/unc-colors';
import documentService from '../services/documentService';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';

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

  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('scholarship-contract');
  const [uploadTalentGroup, setUploadTalentGroup] = useState('');
  const [uploadRelatedTo, setUploadRelatedTo] = useState('');
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isAdminOrDirector = user.role === 'admin' || user.role === 'director';

  const loadDocuments = () =>
    documentService.getDocuments().then(apiDocs => {
      setDocuments(apiDocs.map(d => ({
        id: String(d.id),
        fileName: d.file_name ?? d.title,
        fileType: d.file_type ?? 'application/octet-stream',
        fileSize: d.file_size ?? '',
        category: d.category,
        talentGroup: d.talent_group ?? '',
        relatedTo: d.related_to ?? '',
        uploadedBy: d.uploaded_by ?? '',
        uploadedDate: new Date(d.created_at),
        description: d.description ?? '',
        tags: d.tags ?? [],
        status: d.status,
        fileUrl: d.file_path ?? undefined,
      })));
    }).catch(() => {});

  useEffect(() => { void loadDocuments(); }, []);

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
    if (!doc.fileUrl) {
      toast.error('No file is attached to this document record.');
      return;
    }

    const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    const normalizedPath = String(doc.fileUrl).replace(/^\/+/, '');
    const storagePath = normalizedPath.startsWith('storage/') ? normalizedPath : `storage/${normalizedPath}`;
    const downloadUrl = normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')
      ? normalizedPath
      : `${backendBase}/${storagePath}`;

    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${doc.fileName}...`);
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

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadTitle.trim()) return;
    setIsUploading(true);
    try {
      await documentService.uploadDocument(uploadFile, {
        title: uploadTitle.trim(),
        category: uploadCategory as Document['category'],
        talent_group: uploadTalentGroup || null,
        related_to: uploadRelatedTo.trim() || null,
      });
      await loadDocuments();
      toast.success('Document uploaded successfully');
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadCategory('scholarship-contract');
      setUploadTalentGroup('');
      setUploadRelatedTo('');
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setIsDeletingDocument(true);
    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setShowPreviewDialog(false);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setIsDeletingDocument(false);
    }
  };

  const handleUpdateDocumentStatus = async (id: string, status: Document['status']) => {
    if (!status) return;
    setIsUpdatingStatus(true);
    try {
      await documentService.updateDocument(id, { status });
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      setSelectedDocument(prev => prev && prev.id === id ? { ...prev, status } : prev);
      toast.success(`Document marked as ${status}`);
    } catch {
      toast.error('Failed to update document status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderDocumentTable = (docs: Document[]) => {
    if (docs.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-[#6c757d] mx-auto mb-4" />
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
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-[#6c757d] shrink-0" />
                  <span className="text-sm text-[#1a1a1a] truncate">{doc.fileName}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isAdminOrDirector && (
                    <button
                      type="button"
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); void handleDeleteDocument(doc.id); }}
                      aria-label={`Delete ${doc.fileName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#6c757d]" />
                </div>
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
                {isAdminOrDirector && <TableHead className="w-16 text-right">Actions</TableHead>}
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
                  {isAdminOrDirector && (
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="p-1 rounded text-red-500 hover:bg-red-50"
                        onClick={() => void handleDeleteDocument(doc.id)}
                        aria-label={`Delete ${doc.fileName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  )}
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
        <div className={`grid grid-cols-2 gap-4 ${restrictToGroup ? 'lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          <DashboardQuickStatCard
            label="Scholarship Contracts"
            value={scholarshipContracts}
            onClick={() => setActiveTab('scholarship-contract')}
          />

          <DashboardQuickStatCard
            label="Event Documents"
            value={eventDocuments}
            onClick={() => setActiveTab('event-documents')}
          />

          <DashboardQuickStatCard
            label="Performance Reports"
            value={performanceReports}
            onClick={() => setActiveTab('performance-report')}
          />

          {restrictToGroup && (
            <DashboardQuickStatCard
              label="Scholar Records"
              value={scholarRecords}
              onClick={() => setActiveTab('scholar-records')}
            />
          )}
        </div>

        {isAdminOrDirector && (
          <div className="flex justify-end">
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-[#7A1E1E] text-white hover:bg-[#6A1919]"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Upload Document
            </Button>
          </div>
        )}

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
                      className="pl-11 border-[#D1D5DC] bg-white h-[40px]"
                      style={{ paddingLeft: '2.75rem' }}
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
                      className="pl-11 border-[#D1D5DC] bg-white h-[40px]"
                      style={{ paddingLeft: '2.75rem' }}
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
                      className="pl-11 border-[#D1D5DC] bg-white h-[40px]"
                      style={{ paddingLeft: '2.75rem' }}
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
                        className="pl-11 border-[#D1D5DC] bg-white h-[40px]"
                        style={{ paddingLeft: '2.75rem' }}
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

                <div className="space-y-3 pt-4 border-t border-[#E0E0E0]">
                  {isAdminOrDirector && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[#6C757D] mr-1">Status:</span>
                      {selectedDocument.status !== 'approved' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => void handleUpdateDocumentStatus(selectedDocument.id, 'approved')} disabled={isUpdatingStatus}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}
                      {selectedDocument.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="h-8" onClick={() => void handleUpdateDocumentStatus(selectedDocument.id, 'completed')} disabled={isUpdatingStatus}>
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    {isAdminOrDirector ? (
                      <Button variant="destructive" size="sm" onClick={() => void handleDeleteDocument(selectedDocument.id)} disabled={isDeletingDocument}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    ) : <span />}
                    <Button variant="outline" onClick={() => handleDownloadDocument(selectedDocument)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Upload Document Dialog */}
        <Dialog
          open={showUploadDialog}
          onOpenChange={(open) => {
            setShowUploadDialog(open);
            if (!open) {
              setUploadFile(null);
              setUploadTitle('');
              setUploadCategory('scholarship-contract');
              setUploadTalentGroup('');
              setUploadRelatedTo('');
            }
          }}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#7A1E1E]">Upload Document</DialogTitle>
              <DialogDescription>Upload a new document to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-[#1A1A1A] block mb-1">
                  File <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-[#1A1A1A] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#7A1E1E]/10 file:text-[#7A1E1E] hover:file:bg-[#7A1E1E]/20"
                />
                {uploadFile && (
                  <p className="text-xs text-[#6C757D] mt-1">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[#1A1A1A] block mb-1">
                  Title <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Document title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full border border-[#D1D5DC] rounded-md px-3 py-2 bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1A1A1A] block mb-1">
                  Category <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full border border-[#D1D5DC] rounded-md px-3 py-2 bg-white text-sm"
                >
                  <option value="scholarship-contract">Scholarship Contract</option>
                  <option value="event-request">Event Request</option>
                  <option value="event-approval">Event Approval</option>
                  <option value="performance-report">Performance Report</option>
                  <option value="scholar-records">Scholar Records</option>
                </select>
              </div>
              {!restrictToGroup && (
                <div>
                  <label className="text-sm font-medium text-[#1A1A1A] block mb-1">Talent Group</label>
                  <select
                    value={uploadTalentGroup}
                    onChange={(e) => setUploadTalentGroup(e.target.value)}
                    className="w-full border border-[#D1D5DC] rounded-md px-3 py-2 bg-white text-sm"
                  >
                    <option value="">— All Groups —</option>
                    <option value="marching-band">Marching Band</option>
                    <option value="majorettes">Majorettes</option>
                    <option value="glee-club">Glee Club</option>
                    <option value="dance-club">Dance Club</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-[#1A1A1A] block mb-1">Related To</label>
                <input
                  type="text"
                  placeholder="e.g., Foundation Day 2026"
                  value={uploadRelatedTo}
                  onChange={(e) => setUploadRelatedTo(e.target.value)}
                  className="w-full border border-[#D1D5DC] rounded-md px-3 py-2 bg-white text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  className="bg-[#7A1E1E] text-white hover:bg-[#6A1919]"
                  onClick={() => void handleUploadDocument()}
                  disabled={isUploading || !uploadFile || !uploadTitle.trim()}
                >
                  {isUploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full standalone view (not used in current setup, but keeping for completeness)
  return <div>Standalone view not implemented</div>;
}