import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-950 py-20">
      <Spinner size="md" tone="onDark" />
      <p className="text-sm text-zinc-500">Carregando...</p>
    </div>
  );
}
