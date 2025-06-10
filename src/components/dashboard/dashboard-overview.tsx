import { SecurityScore } from './security-score';
import { EmailSetupCard } from './EmailSetupCard';
import { ThreatAlertsCard } from './ThreatAlertsCard';
import { RecentThreatsTable } from './RecentThreatsTable';
import { NotificationBell } from './NotificationBell';

// Mock data - replace with real API call
const mockScoreData = {
  account_id: "user-123",
  total_events: 14,
  avg_risk_score: 72.71,
  false_positives: 1,
  criticals: 9,
  highs: 3,
  relevant_threats: 11,
  security_score: 0,
  last_event_at: "2025-06-09T08:52:49.233703+00:00"
};

export const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div data-tour="security-score">
        <SecurityScore scoreData={mockScoreData} />
      </div>

      <div data-tour="email-forwarding">
        <EmailSetupCard />
      </div>

      <div data-tour="threat-alerts" className="flex justify-end">
        <NotificationBell />
      </div>

      <div data-tour="recent-threats">
        <RecentThreatsTable />
      </div>
    </div>
  );
};
