import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 py-20 dark:bg-black">
      <Spinner size="md" />
      <p className="text-sm text-zinc-400 dark:text-zinc-500">Carregando...</p>
    </div>
  );
}
