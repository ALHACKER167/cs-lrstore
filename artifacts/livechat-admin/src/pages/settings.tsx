import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetAdminSettings,
  useUpdateAdminSettings,
  getGetAdminSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const settingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessDescription: z.string().min(1, "Description is required"),
  welcomeMessage: z.string().min(1, "Welcome message is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { data: settings, isLoading } = useGetAdminSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: "",
      businessDescription: "",
      welcomeMessage: "",
      systemPrompt: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        businessName: settings.businessName || "",
        businessDescription: settings.businessDescription || "",
        welcomeMessage: settings.welcomeMessage || "",
        systemPrompt: settings.systemPrompt || "",
      });
    }
  }, [settings, form]);

  const updateSettings = useUpdateAdminSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
        toast({ title: "Settings saved", description: "Your AI settings have been updated." });
      },
      onError: () => {
        toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" });
      },
    },
  });

  const onSubmit = (values: SettingsValues) => {
    updateSettings.mutate({ data: values });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8 max-w-3xl mx-auto w-full space-y-6">
          <Skeleton className="h-9 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Configure your AI assistant and chat behavior.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="border border-border rounded-xl bg-card shadow-sm p-6 space-y-6">
              <h2 className="text-base font-semibold text-foreground">Business Identity</h2>

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. LRSTORE"
                        {...field}
                        data-testid="input-business-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Toko topup game online terpercaya di Indonesia"
                        rows={2}
                        {...field}
                        data-testid="input-business-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Message</FormLabel>
                    <FormDescription>The first message visitors see when opening the chat.</FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g. Halo! Selamat datang di LRSTORE. Ada yang bisa kami bantu?"
                        {...field}
                        data-testid="input-welcome-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border border-border rounded-xl bg-card shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">AI System Prompt</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Instructions that define how your AI assistant behaves. This is sent as the system message to the AI model.
                </p>
              </div>

              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="You are a helpful assistant for..."
                        rows={14}
                        className="font-mono text-xs resize-y"
                        {...field}
                        data-testid="input-system-prompt"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettings.isPending}
                data-testid="button-save-settings"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
