import { useGetAdminConversation, getGetAdminConversationQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, User, Bot } from "lucide-react";
import { format } from "date-fns";

export default function ConversationDetail({ id }: { id: string }) {
  const convId = parseInt(id, 10);
  const { data: conv, isLoading } = useGetAdminConversation(convId, {
    query: { enabled: !!convId, queryKey: getGetAdminConversationQueryKey(convId) },
  });

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/conversations">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-7 w-48" /> : (conv?.title || "Conversation")}
            </h1>
            {!isLoading && conv?.createdAt && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(new Date(conv.createdAt), "MMMM d, yyyy 'at' HH:mm")}
              </p>
            )}
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col gap-0 divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex gap-3 p-4 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : conv?.messages?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No messages in this conversation.</div>
            ) : (
              conv?.messages?.map((msg) => (
                <div
                  key={msg.id}
                  data-testid={`message-${msg.id}`}
                  className={`flex gap-3 p-4 ${msg.role === "user" ? "bg-muted/30" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                    msg.role === "user" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground capitalize">{msg.role}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
