import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  History,
  Users,
  Vote,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<"People">;

interface MemberDetailProps {
  member: Member;
  onBack: () => void;
}

export const MemberDetail = ({ member, onBack }: MemberDetailProps) => {
  const [activeTab, setActiveTab] = useState("history");

  const getMemberStatusSteps = () => {
    const steps = [
      { label: "Registered", status: "completed" },
      { label: "Verified", status: "completed" },
      { label: "Committee", status: member.committee_id ? "completed" : "pending" },
      { label: "Active", status: "current" },
      { label: "Leadership", status: member.role?.toLowerCase().includes("leader") || member.role?.toLowerCase().includes("chair") ? "completed" : "pending" }
    ];
    return steps;
  };

  const getLatestAction = () => {
    if (member.committee_id) return "COMMITTEE ASSIGNED";
    if (member.chamber) return "CHAMBER VERIFIED";
    return "MEMBER REGISTERED";
  };

  const statusSteps = getMemberStatusSteps();

  return (
    <div className="member-detail-page">
      {/* Back Navigation */}
      <div className="back-navigation mb-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="back-btn flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Button>
      </div>

      {/* Member Header Section */}
      <div className="member-header-section mb-8">
        <div className="member-name-row flex items-center justify-between mb-4">
          <h1 className="member-name">
            {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || `Member #${member.people_id}`}
          </h1>
          <span className="status-badge active">Active</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="member-content-grid mb-8">
        {/* Left Column */}
        <div className="member-info-left space-y-6">
          {/* Member Identity Section */}
          <div className="member-identity card">
            <h2 className="text-xl font-semibold mb-4">Member Information</h2>
            
            <div className="info-row">
              <span className="info-label">Party & Chamber</span>
              <span className="info-value">
                {member.party && member.chamber ? `${member.party} - ${member.chamber}` : member.party || member.chamber || "Not specified"}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">District</span>
              <span className="info-value">
                {member.district ? `District ${member.district}` : "Not assigned"}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">
                {member.role || "Not specified"}
              </span>
            </div>

            {member.bio_short && (
              <div className="mt-4 pt-4 border-t">
                <span className="info-label">Bio</span>
                <p className="text-sm text-gray-700 mt-2">{member.bio_short}</p>
              </div>
            )}
          </div>

          {/* Status Progress Section */}
          <div className="member-status-section card">
            <div className="section-header mb-6">
              <h2 className="text-xl font-semibold">Current Member Status</h2>
            </div>
            
            <div className="status-progress-container mb-6">
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.label} className="flex flex-col items-center flex-1">
                    <div className={`status-step w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step.status}`}>
                      {step.status === 'completed' ? '' : index + 1}
                    </div>
                    <span className="text-xs text-center mt-2 max-w-16">{step.label}</span>
                    {index < statusSteps.length - 1 && (
                      <div className="status-connector absolute w-full h-0.5 bg-gray-200 top-5 left-1/2 transform -translate-y-1/2 z-0"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Action */}
            <div className="latest-action-card card bg-gray-50">
              <div className="action-label text-sm font-medium text-gray-600 mb-1">Latest Action</div>
              <div className="action-text">{getLatestAction()}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Information */}
        <div className="member-info-right">
          <div className="contact-info-card card">
            <div className="section-header mb-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
            </div>
            
            {member.email && (
              <div className="contact-item">
                <Mail className="contact-icon h-4 w-4" />
                <div className="contact-details">
                  <a href={`mailto:${member.email}`}>{member.email}</a>
                </div>
              </div>
            )}
            
            {member.phone_capitol && (
              <div className="contact-item">
                <Phone className="contact-icon h-4 w-4" />
                <div className="contact-details">
                  <a href={`tel:${member.phone_capitol}`}>Capitol: {member.phone_capitol}</a>
                </div>
              </div>
            )}
            
            {member.phone_district && (
              <div className="contact-item">
                <Phone className="contact-icon h-4 w-4" />
                <div className="contact-details">
                  <a href={`tel:${member.phone_district}`}>District: {member.phone_district}</a>
                </div>
              </div>
            )}
            
            {member.address && (
              <div className="contact-item">
                <MapPin className="contact-icon h-4 w-4" />
                <div className="contact-details">
                  <span>{member.address}</span>
                </div>
              </div>
            )}
            
            {member.ballotpedia && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => window.open(member.ballotpedia, '_blank')}
                  className="btn-secondary w-full flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Profile
                </Button>
              </div>
            )}

            {member.photo_url && (
              <div className="mt-4 pt-4 border-t">
                <img 
                  src={member.photo_url} 
                  alt={`${member.name || 'Member'} photo`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 'history', label: 'History', icon: History },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'committees', label: 'Committees', icon: Users },
            { id: 'voting', label: 'Voting Record', icon: Vote }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'history' && (
          <div className="card">
            <div className="section-title text-xl font-semibold mb-4">Member History</div>
            <div className="space-y-4">
              <div className="history-entry">
                <div className="flex gap-4">
                  <div className="w-20 text-sm text-gray-500 flex-shrink-0">Recent</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{getLatestAction()}</div>
                    <div className="text-sm text-gray-600 mt-1">Current status in legislative system</div>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-center py-8">
                Detailed member history tracking coming soon.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="card">
            <div className="section-title text-xl font-semibold mb-4">Member Documents</div>
            <p className="text-gray-500 text-center py-8">
              Document management coming soon.
            </p>
          </div>
        )}

        {activeTab === 'committees' && (
          <div className="card">
            <div className="section-title text-xl font-semibold mb-4">Committee Assignments</div>
            {member.committee_id ? (
              <div className="space-y-2">
                <p className="font-medium">Committee ID: {member.committee_id}</p>
                <p className="text-gray-600 text-sm">
                  Full committee details coming soon.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No committee assignments found.
              </p>
            )}
          </div>
        )}

        {activeTab === 'voting' && (
          <div className="card">
            <div className="section-title text-xl font-semibold mb-4">Voting Records</div>
            <p className="text-gray-500 text-center py-8">
              Vote tracking functionality coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};