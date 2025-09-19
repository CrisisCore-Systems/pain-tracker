import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PainEntry } from "../types";
import { WCBReportGenerator } from "../components/pain-tracker/WCBReport";

describe("WCBReportGenerator", () => {
  const period = {
    start: "2024-01-01T00:00:00.000Z",
    end: "2024-01-31T23:59:59.999Z"
  };

  let idCounter = 1;

  const createEntry = (overrides: Partial<PainEntry>): PainEntry => ({
    id: overrides.id ?? idCounter++,
    timestamp: overrides.timestamp ?? "2024-01-05T00:00:00.000Z",
    baselineData: {
      pain: overrides.baselineData?.pain ?? 5,
      locations: overrides.baselineData?.locations ?? ["Back"],
      symptoms: overrides.baselineData?.symptoms ?? ["Stiffness"]
    },
    functionalImpact: {
      limitedActivities: overrides.functionalImpact?.limitedActivities ?? ["Lifting"],
      assistanceNeeded: overrides.functionalImpact?.assistanceNeeded ?? [],
      mobilityAids: overrides.functionalImpact?.mobilityAids ?? []
    },
    medications: {
      current: overrides.medications?.current ?? [],
      changes: overrides.medications?.changes ?? "",
      effectiveness: overrides.medications?.effectiveness ?? ""
    },
    treatments: {
      recent:
        overrides.treatments?.recent ??
        [
          {
            type: "Physiotherapy",
            provider: "Therapist",
            date: overrides.timestamp ?? "2024-01-05T00:00:00.000Z",
            effectiveness: overrides.treatments?.effectiveness ?? "Improving"
          }
        ],
      effectiveness: overrides.treatments?.effectiveness ?? "Improving",
      planned: overrides.treatments?.planned ?? []
    },
    qualityOfLife: {
      sleepQuality: overrides.qualityOfLife?.sleepQuality ?? 5,
      moodImpact: overrides.qualityOfLife?.moodImpact ?? 5,
      socialImpact: overrides.qualityOfLife?.socialImpact ?? []
    },
    workImpact: {
      missedWork: overrides.workImpact?.missedWork ?? 0,
      modifiedDuties: overrides.workImpact?.modifiedDuties ?? [],
      workLimitations: overrides.workImpact?.workLimitations ?? []
    },
    comparison: {
      worseningSince: overrides.comparison?.worseningSince ?? "2024-01-01",
      newLimitations: overrides.comparison?.newLimitations ?? []
    },
    notes: overrides.notes ?? ""
  });

  it("builds a comprehensive report from available entries", () => {
    const entries: PainEntry[] = [
      createEntry({
        id: 1,
        timestamp: "2024-01-01T08:00:00.000Z",
        baselineData: { pain: 6, locations: ["Back"], symptoms: ["Stiffness"] },
        functionalImpact: { limitedActivities: ["Lifting"], assistanceNeeded: [], mobilityAids: [] },
        workImpact: {
          missedWork: 2,
          modifiedDuties: ["Remote work"],
          workLimitations: ["Standing"]
        },
        treatments: {
          recent: [
            {
              type: "Physiotherapy",
              provider: "Therapist A",
              date: "2024-01-01",
              effectiveness: "Improving"
            }
          ],
          effectiveness: "Improving",
          planned: []
        },
        comparison: { worseningSince: "2023-12-20", newLimitations: ["Standing"] }
      }),
      createEntry({
        id: 2,
        timestamp: "2024-01-05T08:00:00.000Z",
        baselineData: { pain: 4, locations: ["Back", "Neck"], symptoms: ["Headache"] },
        functionalImpact: { limitedActivities: ["Driving"], assistanceNeeded: [], mobilityAids: [] },
        workImpact: {
          missedWork: 1,
          modifiedDuties: ["Reduced hours"],
          workLimitations: ["Lifting"]
        },
        treatments: {
          recent: [
            {
              type: "Massage therapy",
              provider: "Therapist B",
              date: "2024-01-04",
              effectiveness: "Stable"
            }
          ],
          effectiveness: "Stable",
          planned: []
        },
        comparison: { worseningSince: "2023-12-20", newLimitations: ["Driving"] }
      })
    ];

    render(<WCBReportGenerator entries={entries} period={period} />);

    expect(screen.getByText("Average Pain Level: 5.0")).toBeInTheDocument();
    expect(screen.getByText("Missed Days: 3")).toBeInTheDocument();
    expect(screen.getByText("Remote work")).toBeInTheDocument();
    expect(screen.getByText("Standing: 1 occurrences")).toBeInTheDocument();
    expect(screen.getByText("Massage therapy: 1 entries")).toBeInTheDocument();
    expect(
      screen.getByText("Document missed work days for employer or insurer discussions.")
    ).toBeInTheDocument();
  });

  it("shows structured defaults when no entries are available", () => {
    render(<WCBReportGenerator entries={[]} period={period} />);

    expect(
      screen.getByText(
        "No entries available for the selected period. Maintain regular logging to build a comprehensive record."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Average Pain Level: 0.0")).toBeInTheDocument();
    expect(screen.getByText("No active treatments recorded.")).toBeInTheDocument();
  });
});
