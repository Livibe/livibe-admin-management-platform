import { Badge } from "@/components/ui/badge"
import type { DealStage } from "@/lib/mock-data"

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "blue" | "purple" | "outline" | "destructive"

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  // New statuses
  approached:     { label: "Approached",     variant: "blue" },
  connected:      { label: "Connected",      variant: "purple" },
  interesting:    { label: "Interesting",    variant: "warning" },
  not_interested: { label: "Not Interested", variant: "secondary" },
  // Legacy (kept for compatibility)
  cold_lead:          { label: "Cold Lead",          variant: "secondary" },
  warm_lead:          { label: "Warm Lead",           variant: "warning" },
  active_opportunity: { label: "Active Opportunity",  variant: "blue" },
  client:             { label: "Client",              variant: "success" },
  past_client:        { label: "Past Client",         variant: "outline" },
}

const stageConfig: Record<DealStage, { label: string; variant: BadgeVariant }> = {
  lead_identified:        { label: "Lead Identified",        variant: "secondary" },
  contacted:              { label: "Contacted",              variant: "outline" },
  meeting_scheduled:      { label: "Meeting Scheduled",      variant: "blue" },
  proposal_sent:          { label: "Proposal Sent",          variant: "purple" },
  negotiation:            { label: "Negotiation",            variant: "warning" },
  confirmed:              { label: "Confirmed",              variant: "success" },
  completed:              { label: "Completed",              variant: "success" },
  lost:                   { label: "Lost",                   variant: "destructive" },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status]
  if (!cfg) return <Badge variant="secondary">{status}</Badge>
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = stageConfig[stage]
  if (!cfg) return <Badge variant="secondary">{stage}</Badge>
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
