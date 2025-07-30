import { TrendChart } from "../charts/TrendChart";
import type { TrendData } from "../../types";

interface TrendsTabProps {
  trendData: TrendData[];
}

export function TrendsTab({ trendData }: TrendsTabProps) {
  return <TrendChart data={trendData} />;
}