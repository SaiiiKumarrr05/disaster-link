import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const TREND_CONFIG = {
  rising: { Icon: TrendingUp, color: "text-emergency" },
  falling: { Icon: TrendingDown, color: "text-safe" },
  stable: { Icon: Minus, color: "text-text-secondary" },
};

const INDICATOR_LABELS = {
  flood_level_m: "Flood Level",
  rainfall_mm: "Rainfall",
  wind_speed_kmh: "Wind Speed",
  temperature_c: "Temperature",
  seismic_magnitude: "Seismic",
};

export default function RiskIndicatorStrip({ indicators = [] }) {
  const { t } = useLanguage();
  if (indicators.length === 0) return null;

  return (
    <section aria-labelledby="risk-indicators-heading">
      <h2 id="risk-indicators-heading" className="text-base font-bold text-text-primary mb-2">
        {t.dashboard.riskIndicators}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {indicators.map((ind) => {
          const trendConf = TREND_CONFIG[ind.trend] || TREND_CONFIG.stable;
          const TrendIcon = trendConf.Icon;
          return (
            <div
              key={ind.id}
              className="flex-shrink-0 bg-surface border border-border rounded-lg px-4 py-3 min-w-[140px]"
            >
              <p className="text-xs font-medium text-text-secondary">
                {INDICATOR_LABELS[ind.indicator_type] || ind.indicator_type}
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-text-primary">{ind.value}</span>
                <span className="text-sm text-text-secondary">{ind.unit}</span>
              </div>
              {ind.trend && (
                <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${trendConf.color}`}>
                  <TrendIcon size={14} aria-hidden="true" />
                  <span>{t.dashboard[ind.trend] || ind.trend}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
