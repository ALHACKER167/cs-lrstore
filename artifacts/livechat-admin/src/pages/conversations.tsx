import { useListAdminConversations } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";
import { MessageSquare } from "lucide-react";

export default function Conversations() {
  const { data: conversations, isLoading } = useListAdminConversations();

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
            <p className="text-muted-foreground mt-2">View and monitor all chat history.</p>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Visitor</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : conversations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
                      <p>No conversations found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                conversations?.map((conv) => (
                  <TableRow key={conv.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Link href={`/conversations/${conv.id}`} className="block w-full">
                        {conv.visitorName || "Anonymous"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/conversations/${conv.id}`} className="block w-full text-muted-foreground">
                        {conv.title || "New Conversation"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/conversations/${conv.id}`} className="block w-full">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {conv.messageCount}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/conversations/${conv.id}`} className="block w-full text-muted-foreground">
                        {format(new Date(conv.createdAt), "MMM d, yyyy HH:mm")}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
