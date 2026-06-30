export default function ChatBubble({ from, text, steps }) {
  const isUser = from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser ? "bg-gov-blue text-white" : "bg-surface border border-border text-text-primary"
        }`}
      >
        {text && <p className="text-sm leading-relaxed">{text}</p>}
        {steps && steps.length > 0 && (
          <ol className="mt-2 flex flex-col gap-2 list-decimal list-inside">
            {steps.map((step, idx) => (
              <li key={idx} className="text-sm leading-relaxed pl-1">
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
