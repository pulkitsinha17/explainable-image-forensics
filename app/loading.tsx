import { JumpingDots } from "@/components/jumping-dots";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-white/70 dark:bg-[#0B0B0B]/75 backdrop-blur-[2px] transition-colors duration-200">
      <div className="px-5 py-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-[0_10px_35px_-5px_rgba(21,101,168,0.18)] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.6)] border border-gray-100 dark:border-slate-800 flex items-center justify-center min-w-[80px]">
        <JumpingDots size="md" />
      </div>
    </div>
  );
}
