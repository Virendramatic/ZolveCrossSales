import React, { useState } from 'react';
import { LeadsProvider } from './LeadsContext';
import { LeadsListView } from './LeadsListView';
import { LeadDetailView } from './LeadDetailView';
import { LeadCreationForm } from './LeadCreationForm';

export const LeadsModule: React.FC = () => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <LeadsProvider>
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto">
          <LeadsListView
            onSelectLead={setSelectedLeadId}
            onCreateLead={() => setShowCreateForm(true)}
          />
        </div>

        {selectedLeadId && (
          <LeadDetailView
            leadId={selectedLeadId}
            onClose={() => setSelectedLeadId(null)}
          />
        )}

        <LeadCreationForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
        />
      </div>
    </LeadsProvider>
  );
};
