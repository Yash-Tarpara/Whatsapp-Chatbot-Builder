export function getNodeLabel(type) {
  const map = {
    start: "User Message",
    // TriggerNewChat: "New Chat",
    message: "Send Text",
    // ActionSendMedia: "Send Media",
    // ActionQuickReply: "Quick Reply",
    // ActionDelay: "Delay",
    // ActionSetVariable: "Set Variable",
    // ActionApiCall: "API Call",
    condition: "Keyword Match",
    // ConditionVariable: "Variable Check",
    // ControlGoto: "Go To Node",
    end: "End Flow",
    // ConditionInputAsk: "Ask Input",
    // ConditionAiGpt: "GPT Reply",
    // ConditionDebugLog: "Get Log",
  };
  return map[type] || type;
}
export function getNodeCategory(type) {
  const map = {
    TriggerUserMessage: "start",
    // TriggerNewChat: "New Chat",
    ActionSendText: "message",
    // ActionSendMedia: "Send Media",
    // ActionQuickReply: "Quick Reply",
    // ActionDelay: "Delay",
    // ActionSetVariable: "Set Variable",
    // ActionApiCall: "API Call",
    ConditionKeyword: "condition",
    // ConditionVariable: "Variable Check",
    // ControlGoto: "Go To Node",
    ControlEndFlow: "end",
    // ConditionInputAsk: "Ask Input",
    // ConditionAiGpt: "GPT Reply",
    // ConditionDebugLog: "Get Log",
  };
  return map[type] || type;
}
// export function getNodeCategory(type) {
//   if (type.startsWith("Trigger")) return "trigger";
//   if (type.startsWith("Action")) return "action";
//   if (type.startsWith("Condition")) return "condition";
//   if (type.startsWith("Control")) return "control";
//   if (type.startsWith("Input")) return "input";
//   if (type.startsWith("Ai")) return "ai";
//   if (type.startsWith("Debug")) return "debug";
//   return "unknown";
// }

export function getInitialFields(type) {
  switch (type) {
    case "start":
      return { QuickReply: "" };
    case "message":
      return { message: "" };
    case "ActionDelay":
      return { seconds: 2 };
    case "condition":
      return { keywords: "" };
    case "ActionSetVariable":
      return { variable: "", value: "" };
    case "ActionApiCall":
      return { url: "", method: "GET" };
    default:
      return { QuickReply: "" };
  }
}

export function NodeFieldRenderer({ formData, onChange }) {
  const keys = Object.keys(formData);

  if (keys.length === 0)
    return <p className="mb-2">No editable fields for this node.</p>;

  return (
    <>
      {keys.map((key, idx) => {
        const label = key.replace(/([a-z])([A-Z])/g, "$1 $2");

        const value = formData[key];
        const isBoolean = typeof value === "boolean";

        return (
          <div key={idx} className="mb-4">
            <label className="text-sm font-medium capitalize block mb-1">
              {label}
            </label>

            {isBoolean ? (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(key, e.target.checked)}
                className="w-5 h-5"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}
          </div>
        );
      })}
    </>
  );
}
