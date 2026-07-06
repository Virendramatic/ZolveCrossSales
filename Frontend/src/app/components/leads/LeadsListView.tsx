import React, { useEffect, useState } from 'react';
import { useLeads } from './LeadsContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Pagination } from '../ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

interface LeadsListProps {
  onSelectLead: (leadId: string) => void;
  onCreateLead: () => void;
}

const callStatusColors: Record<string, string> = {
  NOT_CALLED: 'bg-gray-100 text-gray-800',
  RESPONDING: 'bg-green-100 text-green-800',
  NOT_RESPONDING: 'bg-yellow-100 text-yellow-800',
  CONVERTED: 'bg-blue-100 text-blue-800',
};

const callStatusLabels: Record<string, string> = {
  NOT_CALLED: 'Not Called',
  RESPONDING: 'Responding',
  NOT_RESPONDING: 'Not Responding',
  CONVERTED: 'Converted',
};

export const LeadsListView: React.FC<LeadsListProps> = ({ onSelectLead, onCreateLead }) => {
  const { leads, loading, error, hasMore, fetchLeads, clearError } = useLeads();
  const [callStatusFilter, setCallStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads({
      callStatus: callStatusFilter || undefined,
      country: countryFilter || undefined,
    });
  }, [callStatusFilter, countryFilter, fetchLeads]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads</CardTitle>
            <Button onClick={onCreateLead} className="bg-blue-600 hover:bg-blue-700">
              + New Lead
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Call Status Filter */}
            <Select value={callStatusFilter} onValueChange={setCallStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Call Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="NOT_CALLED">Not Called</SelectItem>
                <SelectItem value="RESPONDING">Responding</SelectItem>
                <SelectItem value="NOT_RESPONDING">Not Responding</SelectItem>
                <SelectItem value="CONVERTED">Converted</SelectItem>
              </SelectContent>
            </Select>

            {/* Country Filter */}
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Philippines">Philippines</SelectItem>
                <SelectItem value="Mexico">Mexico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {loading && filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No leads found. {leads.length === 0 ? 'Create your first lead!' : 'Try adjusting your filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Call Status</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map(lead => (
                    <TableRow
                      key={lead.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectLead(lead.id)}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p>{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.leadCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4" />
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.country && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {lead.country}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={callStatusColors[lead.globalCallStatus]}>
                          {callStatusLabels[lead.globalCallStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.intake || '—'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            onSelectLead(lead.id);
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
};
