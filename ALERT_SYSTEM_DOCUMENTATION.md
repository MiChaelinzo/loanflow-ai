# Automated Email Alerts & Notification System

## Overview

The NovaFlow AI Alert System provides comprehensive, automated monitoring of your loan portfolio with instant notifications for critical events such as covenant breaches, high-risk loans, approaching maturities, compliance gaps, and ESG downgrades. This proactive risk management tool ensures you never miss important portfolio events.

## Key Features

### 1. Real-Time Alert Monitoring
- Continuous portfolio monitoring when Alert Center is opened
- Automatic detection of 8 different alert types
- Intelligent deduplication to prevent alert spam
- Severity-based prioritization (Critical, High, Medium, Low)

### 2. Alert Center Dashboard
- **Active Alerts Tab**: View all unresolved alerts requiring attention
- **Acknowledged Tab**: Track alerts you've reviewed and resolved
- **All Alerts Tab**: Complete alert history
- Alert count badges for quick status overview
- Severity-based color coding and icons

### 3. Alert Management Actions
- **Acknowledge**: Mark alert as seen but not yet resolved
- **Resolve**: Mark alert as fully addressed
- **Dismiss**: Remove alert from active view
- **Delete**: Permanently remove alert from history
- **Email Preview**: View formatted email that would be sent
- **Bulk Clear**: Clear multiple alerts at once

### 4. Configurable Email Notifications
- Custom email address configuration
- Per-alert-type email toggle
- Test email functionality
- Professional HTML email templates
- Severity-based formatting and branding

### 5. Advanced Settings
- **Quiet Hours**: Pause email alerts during specific hours (22:00 - 08:00 by default)
- **Daily/Weekly Digest**: Consolidated summary emails at scheduled times
- **Master Enable/Disable**: Global alert system control
- **Per-Alert Configuration**: Individual enable/disable for each alert type

## Alert Types

### Critical Severity

#### 1. Covenant Breach
**Trigger**: When a loan covenant threshold is breached  
**Detection Logic**: `covenant.status === 'breached'`  
**Email Enabled**: Yes (default)  
**Details Included**:
- Covenant type and description
- Threshold value vs. current value
- Percentage over threshold
- Loan amount and currency

**Recommended Actions**:
- Immediately contact borrower to discuss breach
- Review loan agreement for cure periods and remedies
- Assess impact on overall risk profile
- Consider increasing monitoring frequency

#### 2. Critical Risk Loan
**Trigger**: When a loan reaches critical risk level (score > 8.0)  
**Detection Logic**: `loan.riskLevel === 'critical'`  
**Email Enabled**: Yes (default)  
**Details Included**:
- Risk score (1-10 scale)
- Risk factors breakdown (credit, market, operational, ESG)
- Loan amount and currency

**Recommended Actions**:
- Immediate senior management escalation required
- Convene credit committee meeting
- Assess all available remedies and protections
- Consider hedging strategies or position reduction

#### 3. High Default Probability
**Trigger**: When default probability exceeds 10% within 30 days  
**Detection Logic**: `loan.predictiveAnalytics.defaultProbability30d > 0.10`  
**Email Enabled**: Yes (default)  
**Details Included**:
- 30-day and 90-day default probabilities
- Loan amount and currency

**Recommended Actions**:
- Engage restructuring advisors
- Assess security position and recovery scenarios
- Review cross-default provisions
- Prepare contingency plans

### High Severity

#### 4. Covenant At Risk
**Trigger**: When a covenant is approaching breach threshold  
**Detection Logic**: `covenant.status === 'at-risk'`  
**Email Enabled**: Yes (default)  
**Details Included**:
- Covenant type and description
- Current value vs. threshold
- Percentage from threshold

**Recommended Actions**:
- Schedule call with borrower to review financial position
- Request updated financial statements
- Evaluate potential covenant amendment
- Monitor weekly until status improves

#### 5. High Risk Loan
**Trigger**: When a loan is classified as high risk (score 7.0-8.0)  
**Detection Logic**: `loan.riskLevel === 'high'`  
**Email Enabled**: Yes (default)  
**Details Included**:
- Risk score and risk level
- Risk factors breakdown

**Recommended Actions**:
- Review comprehensive risk assessment
- Increase reporting frequency from borrower
- Consider requesting additional collateral
- Evaluate position sizing in portfolio

#### 6. Maturity Approaching (≤7 days)
**Trigger**: When loan maturity is within 7 days  
**Detection Logic**: `daysUntilMaturity <= 7`  
**Email Enabled**: No (default, but configurable)  
**Severity**: High when ≤7 days, Medium when 8-30 days

### Medium Severity

#### 7. LMA Compliance Gap
**Trigger**: When high-severity LMA compliance gaps are detected  
**Detection Logic**: `loan.lmaCompliance.level === 'partial' && gaps.some(g => g.severity === 'high')`  
**Email Enabled**: No (default, but configurable)  
**Details Included**:
- Compliance level
- List of high-severity gaps

**Recommended Actions**:
- Schedule legal review of documentation gaps
- Prepare amendment proposals
- Assess materiality of compliance issues
- Document remediation timeline

#### 8. Maturity Approaching (8-30 days)
**Trigger**: When loan maturity is 8-30 days away  
**Detection Logic**: `daysUntilMaturity > 7 && daysUntilMaturity <= 30`  
**Email Enabled**: No (default, but configurable)

### Low Severity

#### 9. ESG Score Downgrade
**Trigger**: When ESG score falls to D or F rating  
**Detection Logic**: `loan.esgScore.overall === 'D' || loan.esgScore.overall === 'F'`  
**Email Enabled**: No (default, but configurable)  
**Details Included**:
- ESG rating
- Environmental, social, governance scores

**Recommended Actions**:
- Review ESG improvement plan with borrower
- Assess alignment with internal ESG policies
- Consider impact on pricing and terms
- Document sustainability action items

## Email Templates

### Individual Alert Email

**Structure**:
1. **Header** (gradient blue background)
   - Severity badge
   - Alert title
   - Loan name

2. **Content**
   - Alert message
   - Details table (formatted key-value pairs)
   - Alert timestamp
   - Call-to-action button

3. **Recommended Actions**
   - Bulleted list of specific action items
   - Alert-type specific guidance

4. **Footer**
   - Disclaimer text
   - Link to preference management

### Digest Email

**Structure**:
1. **Header**
   - Period covered (e.g., "Last 24 Hours", "This Week")

2. **Summary Cards**
   - Critical count
   - High count
   - Medium count
   - Low count

3. **Alert List**
   - Sorted by severity (critical → low)
   - Each alert shows: severity badge, title, message, timestamp

4. **Call-to-Action**
   - "View All Alerts in Dashboard" button

5. **Footer**
   - Digest preference management info

## Configuration Guide

### Initial Setup

1. Click **"Alerts"** button in the header
2. Click the bell icon to open **Alert Settings**
3. Enter your email address
4. Click **"Test"** to verify email delivery
5. Enable/disable alert types as needed
6. Configure quiet hours if desired
7. Set up digest if preferred
8. Click **"Save Settings"**

### Quiet Hours

Quiet hours prevent email delivery during specified times (in-app alerts remain active):

- **Default**: 22:00 - 08:00 (10 PM - 8 AM)
- **Use Case**: Prevent overnight email interruptions
- **Note**: Critical alerts will still appear in Alert Center

### Alert Digest

Consolidated email summaries sent at scheduled intervals:

- **Frequency Options**: Daily or Weekly
- **Default Time**: 09:00 (9 AM)
- **Content**: All alerts from the period, organized by severity
- **Benefit**: Single email instead of multiple individual alerts

## Technical Implementation

### Alert Detection (`alertService.ts`)

```typescript
// Main detection function
export function checkLoansForAlerts(
  loans: Loan[], 
  existingAlerts: Alert[]
): Alert[]

// Per-loan checking
function checkLoanForAlerts(loan: Loan, now: Date): Alert[]

// Specialized checkers
function checkCovenantAlerts(loan: Loan, now: Date): Alert[]
function checkRiskAlerts(loan: Loan, now: Date): Alert[]
function checkDefaultProbabilityAlerts(loan: Loan, now: Date): Alert[]
function checkMaturityAlerts(loan: Loan, now: Date): Alert[]
function checkComplianceAlerts(loan: Loan, now: Date): Alert[]
function checkESGAlerts(loan: Loan, now: Date): Alert[]
```

### Email Generation

```typescript
// Individual alert email
export function generateEmailContent(alert: Alert): {
  subject: string
  body: string
}

// Digest email
export function generateDigestEmail(
  alerts: Alert[], 
  period: string
): {
  subject: string
  body: string
}
```

### Data Persistence

All alert data is stored using the Spark KV API:

- **Key**: `alerts` - Array of all alerts
- **Key**: `alert-preferences` - User configuration
- **Updates**: Functional updates to prevent data loss

```typescript
const [alerts, setAlerts] = useKV<Alert[]>('alerts', [])
const [preferences, setPreferences] = useKV<AlertPreferences>(
  'alert-preferences',
  DEFAULT_ALERT_PREFERENCES
)

// Always use functional updates
setAlerts((current) => [...current, newAlert])
```

## Best Practices

### For Portfolio Managers

1. **Enable Critical & High Alerts**: Focus on covenant breaches and critical risk
2. **Use Digests for Medium/Low**: Reduce email volume for less urgent items
3. **Set Quiet Hours**: Align with your working hours
4. **Acknowledge Promptly**: Mark alerts as acknowledged when reviewing
5. **Resolve When Complete**: Update status after taking action

### For Risk Teams

1. **Enable All Alert Types**: Comprehensive monitoring
2. **Configure Daily Digest**: Morning summary at 9 AM
3. **Review Trends**: Use Alert Center to identify patterns
4. **Export Alert Data**: Include in risk reports

### For Compliance Teams

1. **Enable Compliance & Maturity Alerts**: Focus on regulatory concerns
2. **Set Weekly Digest**: Summary for compliance meetings
3. **Track Resolution**: Document remediation actions

## Production Considerations

### Email Infrastructure

In production deployment, integrate with:

- **SMTP Server**: Corporate email infrastructure
- **Email Service Provider**: SendGrid, AWS SES, etc.
- **Authentication**: SPF, DKIM, DMARC records
- **Deliverability**: Monitor bounce rates, spam reports
- **Templates**: Store in email service provider for easier updates

### Security

- **Email Encryption**: TLS in transit
- **Access Control**: Role-based alert preferences
- **Audit Trail**: Log all alert generations and email sends
- **PII Protection**: Mask sensitive data in emails

### Scalability

- **Queue System**: Use message queue for email sending (RabbitMQ, AWS SQS)
- **Rate Limiting**: Prevent email spam from rapid alerts
- **Batch Processing**: Aggregate similar alerts within time windows
- **Caching**: Cache alert detection logic results

### Compliance

- **Data Retention**: Define alert retention policies
- **Opt-Out**: Provide clear unsubscribe mechanism
- **GDPR/Privacy**: Include privacy policy links
- **Audit Logs**: Maintain records of all notifications

## Troubleshooting

### Alerts Not Appearing

1. Check if alerts are enabled in settings
2. Verify loans exist in portfolio
3. Ensure alert conditions are met (e.g., covenant actually breached)
4. Check browser console for errors

### Emails Not Sending (Demo Mode)

This is a prototype. Email preview shows what would be sent. In production:
1. Configure SMTP credentials
2. Verify email address validity
3. Check spam folder
4. Review email service logs

### Alert Duplicates

The system includes deduplication logic. If seeing duplicates:
1. Check if loan data changed (creates new alert)
2. Verify alert ID generation is unique
3. Clear old alerts from Alert Center

### Performance Issues

If Alert Center is slow:
1. Limit alert history retention
2. Implement pagination for large alert lists
3. Add background job for alert detection
4. Index alert data in production database

## Future Enhancements

### Planned Features

1. **SMS Notifications**: Text alerts for critical events
2. **Slack/Teams Integration**: Post alerts to collaboration channels
3. **Webhook Support**: Push alerts to external systems
4. **Alert Rules Engine**: Custom alert conditions with visual builder
5. **Machine Learning**: Predict covenant breaches before they occur
6. **Mobile App**: Native iOS/Android alert notifications
7. **Alert Analytics**: Trends, most common alerts, response times
8. **Escalation Workflows**: Auto-escalate unacknowledged critical alerts

## Support

For questions or issues:
- View in-app Help Center (FAQ #25-28)
- Watch Video Tutorial #9: "Automated Alerts and Notifications"
- Refer to API documentation in source files

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Component Files**: 
- `/src/lib/alertTypes.ts` - Type definitions
- `/src/lib/alertService.ts` - Alert detection and email generation
- `/src/components/AlertCenter.tsx` - Alert viewing and management UI
- `/src/components/AlertSettings.tsx` - Configuration UI
