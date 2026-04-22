type ToastProps = {
  message: string;
  type?: "success" | "error";
};

export default function Toast({ message, type = "success" }: ToastProps) {
  const baseClasses =
    "pointer-events-auto min-w-[280px] max-w-sm rounded-2xl px-4 py-3 shadow-lg border text-sm font-medium";

  const typeClasses =
    type === "success"
      ? "bg-white border-brand-green/20 text-brand-blue-darker"
      : "bg-white border-red-200 text-red-600";

  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}