import { useQuery } from "@tanstack/react-query";
import { mockApi } from "./mockApi";
import type { TimeRange } from "./types";

export const useResources = () => useQuery({ queryKey: ["resources"], queryFn: mockApi.resources });
export const useRequests  = () => useQuery({ queryKey: ["requests"],  queryFn: mockApi.requests  });
export const useMatches   = () => useQuery({ queryKey: ["matches"],   queryFn: mockApi.matches   });
export const useLedger    = () => useQuery({ queryKey: ["ledger"],    queryFn: mockApi.ledger    });
export const useInsights  = () => useQuery({ queryKey: ["insights"],  queryFn: mockApi.insights  });
export const useForecasts = () => useQuery({ queryKey: ["forecasts"], queryFn: mockApi.forecasts });
export const useActivity  = () => useQuery({ queryKey: ["activity"],  queryFn: mockApi.activity  });
export const useMetrics   = () => useQuery({ queryKey: ["metrics"],   queryFn: mockApi.metrics   });
export const useTrend = (range: TimeRange) =>
  useQuery({ queryKey: ["trend", range], queryFn: () => mockApi.trend(range) });
