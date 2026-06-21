import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Conversations from "@/pages/conversations";
import ConversationDetail from "@/pages/conversation-detail";
import WidgetSites from "@/pages/widget-sites";
import WidgetPreview from "@/pages/widget-preview";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Snow } from "@/components/snow";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/conversations/:id">
        {(params) => <ConversationDetail id={params.id} />}
      </Route>
      <Route path="/widget-sites" component={WidgetSites} />
      <Route path="/widget-preview" component={WidgetPreview} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Snow />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
