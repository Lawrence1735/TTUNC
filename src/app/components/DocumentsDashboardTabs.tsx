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
  ChevronRight
} from './ui/icons';
import { User as UserType } from '../App';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import { getTalentGroupColor, getTalentGroupName } from './ui/unc-colors';
import documentService from '../services/documentService';

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

  useEffect(() => {
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
  }, []);

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