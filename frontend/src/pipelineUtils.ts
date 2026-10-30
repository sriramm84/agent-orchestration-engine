import type { StreamEvent } from "./api";

export const STAGES = ["decomposer", "retriever", "critic", "synthesizer"] as const;
export type Stage = (typeof STAGES)[number];

export interface StageState {
  status: "pending" | "running" | "skipped" | "done";
}

export function reduceStreamEvents(events: StreamEvent[]): {
  stages: Record<Stage, StageState>;
  routingDecisions: StreamEvent[];
} {
  const stages: Record<Stage, StageState> = {
    decomposer: { status: "pending" },
    retriever: { status: "pending" },
    critic: { status: "pending" },
    synthesizer: { status: "pending" },
  };
  const routingDecisions: StreamEvent[] = [];

  for (const event of events) {
    if (event.event_type === "agent_started") {
      const id = event.agent_id as Stage;
      if (id in stages) stages[id].status = "running";
    } else if (event.event_type === "agent_completed") {
      const id = event.agent_id as Stage;
      if (id in stages) stages[id].status = "done";
    } else if (event.event_type === "routing_decision") {
      routingDecisions.push(event);
      const action = String(event.selected_action || "");
      if (action.startsWith("skip_")) {
        const skipped = action.replace("skip_", "") as Stage;
        if (skipped in stages && stages[skipped].status === "pending") {
          stages[skipped].status = "skipped";
        }
      }
    }
  }

  return { stages, routingDecisions };
}

