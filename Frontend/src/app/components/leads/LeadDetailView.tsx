import React, { useEffect, useState } from 'react';
import { useLeads } from './LeadsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '../ui/alert-dialog';
import { X, Calendar, MessageSquare, Copy, Trash2 } from 'lucide-react';

interface LeadDetailViewProps {
  leadId: string;
  onClose: () => void;
}

const callStatusLabels: Record<string, string> = {
  NOT_CALLED: 'Not Called',
  RESPONDING: 'Responding',
  NOT_RESPONDING: 'Not Responding',
  CONVERTED: 'Converted',
};

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({ leadId, onClose }) => {
  const { selectedLead, loading, error, fetchLead, updateLead, updateCallStatus, setRescheduleDate, deleteLead } = useLeads();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [comment, setComment] = useState('');
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleDate, setRescheduleDateValue] = useState('');

  useEffect(() => {
    if (leadId) {
      fetchLead(leadId);
    }
  }, [leadId, fetchLead]);

  useEffect(() => {
    if (selectedLead) {
      setEditData({
        name: selectedLead.name,
        phone: selectedLead.phone,
        email: selectedLead.email || '',
        country: selectedLead.country || '',
        intake: selectedLead.intake || '',
        notes: selectedLead.notes || '',
      });
    }
  }, [selectedLead]);

  const handleSaveChanges = async () => {
    try {
      await updateLead(leadId, editData);
      setIsEditing(false);
    } catch (err) {
      // Error handled by context
    }
  };

  const handleUpdateCallStatus = async (status: string) => {
    try {
      await updateCallStatus(leadId, status);
    } catch (err) {
      // Error handled by context
    }
  };

  const handleSetRescheduleDate = async () => {
    if (rescheduleDate) {
      try {
        await setRescheduleDate(leadId, new Date(rescheduleDate));
        setShowRescheduleDialog(false);
        setRescheduleDateValue('');
      } catch (err) {
        // Error handled by context
      }
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLead(leadId);
      onClose();
    } catch (err) {
      // Error handled by context
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPhone = () => {
    if (selectedLead?.phone) {
      navigator.clipboard.writeText(selectedLead.phone);
    }
  };

  if (loading && !selectedLead) {
    return (
      <div className="fixed right-0 top-0 h-full w-full md:w-1/2 bg-white border-l shadow-lg p-6">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!selectedLead) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-1/2 bg-white border-l shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedLead.name}</h2>
          <p className="text-sm text-gray-500">{selectedLead.leadCode}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Call Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Call Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={selectedLead.globalCallStatus} onValueChange={handleUpdateCallStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_CALLED">Not Called</SelectItem>
                  <SelectItem value="RESPONDING">Responding</SelectItem>
                  <SelectItem value="NOT_RESPONDING">Not Responding</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedLead.rescheduleDate && (
              <div>
                <Label className="text-sm text-gray-600">Next Follow-up</Label>
                <p className="text-sm font-medium">{new Date(selectedLead.rescheduleDate).toLocaleDateString()}</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => setShowRescheduleDialog(true)}
            >
              <Calendar className="w-4 h-4" />
              Set Reschedule Date
            </Button>
          </CardContent>
        </Card>

        {/* Lead Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Information</CardTitle>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="ml-auto"
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={editData.country}
                    onChange={e => setEditData({ ...editData, country: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Intake</Label>
                  <Input
                    value={editData.intake}
                    onChange={e => setEditData({ ...editData, intake: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={editData.notes}
                    onChange={e => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Internal notes"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveChanges} className="flex-1 bg-blue-600">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-xs text-gray-600">Phone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium">{selectedLead.phone}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPhone}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {selectedLead.email && (
                  <div>
                    <Label className="text-xs text-gray-600">Email</Label>
                    <p className="font-medium mt-1">{selectedLead.email}</p>
                  </div>
                )}
                {selectedLead.country && (
                  <div>
                    <Label className="text-xs text-gray-600">Country</Label>
                    <p className="font-medium mt-1">{selectedLead.country}</p>
                  </div>
                )}
                {selectedLead.intake && (
                  <div>
                    <Label className="text-xs text-gray-600">Intake</Label>
                    <p className="font-medium mt-1">{selectedLead.intake}</p>
                  </div>
                )}
                {selectedLead.notes && (
                  <div>
                    <Label className="text-xs text-gray-600">Notes</Label>
                    <p className="font-medium mt-1">{selectedLead.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        {selectedLead.productInstances && selectedLead.productInstances.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedLead.productInstances.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm capitalize">{product.productType}</p>
                      <p className="text-xs text-gray-500">{product.productCode}</p>
                    </div>
                    <Badge>{product.status || 'Active'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedLead.comments && selectedLead.comments.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {selectedLead.comments.map((c: any) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded text-sm">
                    <div className="font-medium text-xs text-gray-600">{c.authorName}</div>
                    <p className="mt-1 text-gray-800">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="font-medium">{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Updated</span>
              <span className="font-medium">{new Date(selectedLead.updatedAt).toLocaleDateString()}</span>
            </div>
            {selectedLead.leadSource && (
              <div className="flex justify-between">
                <span className="text-gray-600">Source</span>
                <span className="font-medium">{selectedLead.leadSource}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full flex items-center gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Lead
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Dialog */}
      <AlertDialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Set Reschedule Date</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mt-4">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={rescheduleDate}
                onChange={e => setRescheduleDateValue(e.target.value)}
              />
            </div>
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSetRescheduleDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Set Date
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Lead</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this lead? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
