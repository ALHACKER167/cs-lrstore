import { useListWidgetSites } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";

export default function WidgetPreview() {
  const { data: sites, isLoading } = useListWidgetSites();
  const activeSite = sites?.find((s) => s.isActive) || sites?.[0];

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Widget Preview</h1>
          <p className="text-muted-foreground mt-2">Test the chat widget as your visitors will see it.</p>
        </div>

        {isLoading ? (
          <div className="border border-border rounded-xl bg-card shadow-sm p-8">
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : !activeSite ? (
          <div className="border border-dashed border-border rounded-xl p-16 text-center text-muted-foreground">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-base">No widget sites configured</p>
            <p className="text-sm mt-1">Add a widget site to preview the chat widget here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="border border-border rounded-xl bg-card shadow-sm p-4">
                <p className="text-sm font-medium text-foreground mb-1">Previewing site:</p>
                <p className="text-sm text-muted-foreground">{activeSite.name} ({activeSite.domain})</p>
              </div>
              <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background" style={{ height: 600 }}>
                <iframe
                  src={`/api/widget?token=${encodeURIComponent(activeSite.widgetToken)}`}
                  className="w-full h-full border-0"
                  title="Widget Preview"
                  data-testid="iframe-widget-preview"
                  allow="microphone"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-border rounded-xl bg-card shadow-sm p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">This is what your visitors see</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The widget on the left is the exact chat experience embedded on your site. Visitors enter their name
                  and start chatting with the AI assistant.
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Real-time AI responses via streaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Conversations logged automatically</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Uses your configured AI system prompt</span>
                  </div>
                </div>
              </div>
              <div className="border border-border rounded-xl bg-card shadow-sm p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">Active token</h3>
                <code className="text-xs font-mono text-muted-foreground break-all">{activeSite.widgetToken}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
