import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TrendAlerts from "../dashboard/components/TrendAlerts";
import CviGauge from "../dashboard/components/CviGauge";
import HealthChart from "../dashboard/components/HealthChart";
import CommitSelector from "../dashboard/components/CommitSelector";
import ComparisonTable from "../dashboard/components/ComparisonTable";

// Mock data for tests
const mockCommits = [
  {
    commit: "abc123",
    timestamp: "2025-09-05 12:00:00",
    diversity: 0.5,
    coherence: 0.6,
    resilience: 0.4,
    beauty: 0.3,
    cvi: 0.45,
  },
  {
    commit: "def456",
    timestamp: "2025-09-06 12:00:00",
    diversity: 0.6,
    coherence: 0.7,
    resilience: 0.5,
    beauty: 0.4,
    cvi: 0.55,
  },
];

describe("Dashboard Components", () => {
  test("renders TrendAlerts with alerts", () => {
    const setAlerts = jest.fn();
    render(<TrendAlerts data={mockCommits} alerts={["⚠️ test alert"]} setAlerts={setAlerts} />);
    expect(screen.getByText(/test alert/)).toBeInTheDocument();
  });

  test("renders CVI Gauge with value", () => {
    render(<CviGauge selectedCommit={mockCommits[1]} />);
    expect(screen.getByText("0.55")).toBeInTheDocument();
  });

  test("renders HealthChart with data", () => {
    render(<HealthChart data={mockCommits} />);
    expect(screen.getByText(/diversity/i)).toBeInTheDocument();
  });

  test("renders CommitSelector and changes commit", () => {
    const setSelectedCommit = jest.fn();
    const setCompareCommit = jest.fn();
    render(
      <CommitSelector
        data={mockCommits}
        selectedCommit={mockCommits[0]}
        setSelectedCommit={setSelectedCommit}
        compareCommit={null}
        setCompareCommit={setCompareCommit}
      />
    );
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "def456" } });
    expect(setSelectedCommit).toHaveBeenCalled();
  });

  test("renders ComparisonTable and shows deltas", () => {
    render(<ComparisonTable selectedCommit={mockCommits[1]} compareCommit={mockCommits[0]} />);
    expect(screen.getByText(/diversity/i)).toBeInTheDocument();
    expect(screen.getByText(/↑ 0.10/)).toBeInTheDocument();
  });
});
