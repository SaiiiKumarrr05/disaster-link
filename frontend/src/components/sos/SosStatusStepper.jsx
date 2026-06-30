import { Check } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const STEPS = ["submitted", "acknowledged", "en_route", "resolved"];
const STEP_LABEL_KEY = {
  submitted: "statusSubmitted",
  acknowledged: "statusAcknowledged",
  en_route: "statusEnRoute",
  resolved: "statusResolved",
};

export default function SosStatusStepper({ currentStatus }) {
  const { t } = useLanguage();
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <ol className="flex items-center w-full" aria-label="SOS status progress">
      {STEPS.map((step, idx) => {
        const isComplete = idx <= currentIndex;
        const isLast = idx === STEPS.length - 1;
        return (
          <li key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 font-bold text-sm ${
                  isComplete ? "bg-safe border-safe text-white" : "bg-surface border-border text-text-secondary"
                }`}
                aria-current={idx === currentIndex ? "step" : undefined}
              >
                {isComplete ? <Check size={18} /> : idx + 1}
              </div>
              <span
                className={`text-xs font-medium text-center max-w-[70px] ${
                  isComplete ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {t.sos[STEP_LABEL_KEY[step]]}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 ${idx < currentIndex ? "bg-safe" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
