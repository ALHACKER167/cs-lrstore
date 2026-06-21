import { useState } from "react";
import {
  useListWidgetSites,
  useCreateWidgetSite,
  useUpdateWidgetSite,
  useDeleteWidgetSite,
  useRegenerateWidgetToken,
  getListWidgetSitesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Globe, Plus, Copy, RefreshCw, Trash2, Check, Code2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function WidgetSites() {
  const { data: sites, isLoading } = useListWidgetSites();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [embedSite, setEmbedSite] = useState<{ id: number; name: string; widgetToken: string } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const createSite = useCreateWidgetSite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWidgetSitesQueryKey() });
        setAddOpen(false);
        setNewName("");
        setNewDomain("");
        toast({ title: "Widget site added" });
      },
    },
  });

  const updateSite = useUpdateWidgetSite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWidgetSitesQueryKey() });
      },
    },
  });

  const deleteSite = useDeleteWidgetSite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWidgetSitesQueryKey() });
        setDeleteId(null);
        toast({ title: "Widget site deleted" });
      },
    },
  });

  const regenerateToken = useRegenerateWidgetToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWidgetSitesQueryKey() });
        toast({ title: "Token regenerated" });
      },
    },
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getEmbedCode = (token: string) =>
    `<script src="${window.location.origin}/api/widget.js" data-token="${token}"></script>`;

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Widget Sites</h1>
            <p className="text-muted-foreground mt-2">Manage embedded chat widgets for your sites.</p>
          </div>
          <Button onClick={() => setAddOpen(true)} data-testid="button-add-site">
            <Plus className="w-4 h-4 mr-2" />
            Add Site
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border rounded-xl p-5 bg-card shadow-sm">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            ))
          ) : sites?.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No widget sites yet</p>
              <p className="text-sm mt-1">Add a site to get your embed code.</p>
            </div>
          ) : (
            sites?.map((site) => (
              <div
                key={site.id}
                data-testid={`card-site-${site.id}`}
                className="border border-border rounded-xl p-5 bg-card shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-foreground">{site.name}</span>
                      <span className="text-xs text-muted-foreground">{site.domain}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-7">
                      Added {format(new Date(site.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={site.isActive}
                        data-testid={`switch-active-${site.id}`}
                        onCheckedChange={(checked) =>
                          updateSite.mutate({ id: site.id, data: { isActive: checked } })
                        }
                      />
                      <span className="text-xs text-muted-foreground">{site.isActive ? "Active" : "Inactive"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      data-testid={`button-open-widget-${site.id}`}
                    >
                      <a
                        href={`/api/widget?token=${encodeURIComponent(site.widgetToken)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Buka Widget
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmbedSite({ id: site.id, name: site.name, widgetToken: site.widgetToken })}
                      data-testid={`button-embed-${site.id}`}
                    >
                      <Code2 className="w-3.5 h-3.5 mr-1.5" />
                      Embed Code
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(site.id)}
                      data-testid={`button-delete-${site.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="ml-7 bg-muted/40 rounded-lg px-3 py-2 flex items-center gap-2">
                  <code className="text-xs text-muted-foreground font-mono flex-1 truncate">
                    {site.widgetToken}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(site.widgetToken, `token-${site.id}`)}
                    data-testid={`button-copy-token-${site.id}`}
                  >
                    {copied === `token-${site.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => regenerateToken.mutate({ id: site.id })}
                    data-testid={`button-regen-${site.id}`}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget Site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                placeholder="e.g. LRSTORE Main Site"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                data-testid="input-site-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site-domain">Domain</Label>
              <Input
                id="site-domain"
                placeholder="e.g. lrstore.id"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                data-testid="input-site-domain"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createSite.mutate({ data: { name: newName, domain: newDomain } })}
              disabled={!newName || !newDomain || createSite.isPending}
              data-testid="button-submit-site"
            >
              {createSite.isPending ? "Adding..." : "Add Site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!embedSite} onOpenChange={(o) => !o && setEmbedSite(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Embed Code — {embedSite?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Paste this snippet just before the closing <code>&lt;/body&gt;</code> tag of your website:
            </p>
            <div className="bg-muted rounded-lg p-4 relative">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                {embedSite ? getEmbedCode(embedSite.widgetToken) : ""}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => embedSite && copyToClipboard(getEmbedCode(embedSite.widgetToken), "embed")}
                data-testid="button-copy-embed"
              >
                {copied === "embed" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setEmbedSite(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget Site?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the site and invalidate its token. Any embedded widgets will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteSite.mutate({ id: deleteId })}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
