import { Button } from "@/components/ui/button";

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[10px] border border-border bg-card px-6 py-16 text-center">
      <p className="text-sm font-semibold">Couldn’t load this data</p>
      {message && (
        <p className="max-w-sm text-[13px] text-muted-foreground">{message}</p>
      )}
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
