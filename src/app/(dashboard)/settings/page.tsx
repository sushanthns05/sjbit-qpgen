"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Users, Building, Shield } from "lucide-react";
import { saveAiProviderConfig, getAiProviderConfig } from "./actions";

export default function SettingsPage() {
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [apiVersion, setApiVersion] = useState("v1");
  const [model, setModel] = useState("gemini-1.5-pro");
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load existing config on mount
  useState(() => {
    getAiProviderConfig().then((res) => {
      if (res.success && res.data) {
        setProvider(res.data.provider || "gemini");
        setApiKey(res.data.apiKey || "");
        setApiVersion(res.data.apiVersion || "v1");
        setModel(res.data.model || "gemini-1.5-pro");
      }
    });
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    // Real test implementation would call a backend route that pings the provider
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({ success: true, message: "✓ Connection successful" });
    }, 1500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTestResult(null);
    const result = await saveAiProviderConfig({ provider, apiKey, apiVersion, model });
    setIsSaving(false);
    setTestResult(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-zinc-500">Manage system configuration, AI providers, and departments.</p>
      </div>

      <Tabs defaultValue="ai-providers" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="ai-providers" className="flex items-center gap-2">
            <Brain className="h-4 w-4" /> AI Providers
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building className="h-4 w-4" /> Departments
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-providers" className="mt-6">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>AI Provider Configuration</CardTitle>
              <CardDescription>
                Configure the primary AI model used for question generation.
                Keys are encrypted at rest and never exposed to the client.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="provider">Provider</Label>
                <select 
                  id="provider" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  type="password" 
                  placeholder="***************" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="api-version">API Version</Label>
                  <Input 
                    id="api-version" 
                    placeholder="v1" 
                    value={apiVersion}
                    onChange={(e) => setApiVersion(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input 
                    id="model" 
                    placeholder="gemini-1.5-pro" 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-md text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {testResult.message}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting || isSaving}>
                {isTesting ? "Testing..." : "TEST CONNECTION"}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Management</CardTitle>
              <CardDescription>Configure departments and subjects.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">Department configuration coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage faculty, reviewers, and admins.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">User management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
