import { Activity, Waves, Wind, Flame, Building2, HeartPulse, HelpCircle } from "lucide-react";

const TOPIC_ICONS = {
  earthquake_now: Activity,
  flood_warning: Waves,
  cyclone_approaching: Wind,
  gas_leak: Flame,
  trapped_need_rescue: Building2,
  first_aid_basics: HeartPulse,
};

export default function QuickTopicChip({ topic, onClick }) {
  const Icon = TOPIC_ICONS[topic.topic_key] || HelpCircle;
  return (
    <button
      onClick={() => onClick(topic)}
      className="flex flex-col items-center gap-2 min-h-tap p-3 bg-surface border-2 border-border rounded-lg hover:border-gov-blue text-center"
    >
      <Icon size={22} className="text-gov-blue flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-semibold text-text-primary leading-snug">{topic.title}</span>
    </button>
  );
}
