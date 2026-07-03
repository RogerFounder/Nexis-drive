import { Spinner } from "@/components/ui/spinner";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner size="md" />
      <p className="text-sm text-zinc-400 dark:text-zinc-500">Carregando...</p>
    </div>
  );
}
