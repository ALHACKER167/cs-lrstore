import { useGetAdminStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Globe, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your LRSTORE LiveChat system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Conversations" 
            value={stats?.totalConversations} 
            icon={MessageSquare} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="Conversations Today" 
            value={stats?.conversationsToday} 
            icon={Activity} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="Total Messages" 
            value={stats?.totalMessages} 
            icon={Users} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="Active Widget Sites" 
            value={stats?.activeWidgetSites} 
            icon={Globe} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value?: number, icon: any, isLoading: boolean }) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold text-foreground">{value?.toLocaleString() || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
