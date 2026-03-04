import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    sentimentThreshold: 65,
    peRatioMax: 50,
    minMarketCap: 10,
    confidenceThreshold: 70,
    includeETFs: false,
    includePennyStocks: false,
    emailNotifications: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your threshold preferences have been updated.",
    });
  };

  const handleReset = () => {
    setSettings({
      sentimentThreshold: 65,
      peRatioMax: 50,
      minMarketCap: 10,
      confidenceThreshold: 70,
      includeETFs: false,
      includePennyStocks: false,
      emailNotifications: true,
      weeklyReport: true,
    });
    toast({
      title: "Settings reset",
      description: "All thresholds have been restored to defaults.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Adjust screening thresholds and notification preferences that shape how picks are filtered</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Threshold Settings */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Screening Thresholds</h2>
          </div>

          {/* Sentiment Threshold */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Minimum Sentiment Score</Label>
              <span className="text-sm font-mono font-semibold text-primary">
                {settings.sentimentThreshold}
              </span>
            </div>
            <Slider
              value={[settings.sentimentThreshold]}
              onValueChange={([value]) =>
                setSettings((s) => ({ ...s, sentimentThreshold: value }))
              }
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Stocks below this sentiment score will be marked as SKIP candidates.
            </p>
          </div>

          {/* P/E Ratio Max */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Maximum P/E Ratio</Label>
              <span className="text-sm font-mono font-semibold text-primary">
                {settings.peRatioMax}
              </span>
            </div>
            <Slider
              value={[settings.peRatioMax]}
              onValueChange={([value]) =>
                setSettings((s) => ({ ...s, peRatioMax: value }))
              }
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Stocks with P/E ratio above this will be flagged as potentially overvalued.
            </p>
          </div>

          {/* Min Market Cap */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Minimum Market Cap (Billions)</Label>
              <span className="text-sm font-mono font-semibold text-primary">
                ${settings.minMarketCap}B
              </span>
            </div>
            <Slider
              value={[settings.minMarketCap]}
              onValueChange={([value]) =>
                setSettings((s) => ({ ...s, minMarketCap: value }))
              }
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Only include companies with market cap above this threshold.
            </p>
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Minimum Confidence for PICK</Label>
              <span className="text-sm font-mono font-semibold text-primary">
                {settings.confidenceThreshold}%
              </span>
            </div>
            <Slider
              value={[settings.confidenceThreshold]}
              onValueChange={([value]) =>
                setSettings((s) => ({ ...s, confidenceThreshold: value }))
              }
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Decision confidence must exceed this to qualify as a PICK.
            </p>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold pb-4 border-b border-border">
            Screening Options
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include ETFs</Label>
              <p className="text-xs text-muted-foreground">
                Allow exchange-traded funds in the screening
              </p>
            </div>
            <Switch
              checked={settings.includeETFs}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, includeETFs: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include Penny Stocks</Label>
              <p className="text-xs text-muted-foreground">
                Allow stocks priced under $5
              </p>
            </div>
            <Switch
              checked={settings.includePennyStocks}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, includePennyStocks: checked }))
              }
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <h2 className="text-lg font-semibold pb-4 border-b border-border">
            Notifications
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive alerts when new picks are published
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Report</Label>
              <p className="text-xs text-muted-foreground">
                Get a summary email every Sunday
              </p>
            </div>
            <Switch
              checked={settings.weeklyReport}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, weeklyReport: checked }))
              }
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
