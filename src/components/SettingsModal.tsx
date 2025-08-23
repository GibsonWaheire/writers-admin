import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Palette, 
  Globe, 
  Download, 
  Upload, 
  RotateCcw,
  Save,
  Briefcase,
  Lock,
  Mail,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

import { SettingsTabContent } from './SettingsTabContent';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    exportSettings, 
    importSettings, 
    isLoading,
    canModifyNotifications
  } = useSettings();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    if (!tempSettings) return;

    setIsSaving(true);
    await updateSettings(tempSettings);
    setIsSaving(false);
  };

  const handleReset = async () => {
    const success = await resetSettings();
    if (success) {
      setTempSettings(settings);
    }
  };

  const handleExport = () => {
    const settingsData = exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-${user?.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const settingsData = e.target?.result as string;
        await importSettings(settingsData);
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    reader.readAsText(file);
  };

  const updateTempSettings = (path: string, value: any) => {
    if (!tempSettings) return;

    const keys = path.split('.');
    const newSettings = { ...tempSettings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setTempSettings(newSettings);
  };

  if (!tempSettings || !user) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'display', label: 'Display', icon: Palette },
    ...(user.role === 'writer' ? [{ id: 'work', label: 'Work Preferences', icon: Briefcase }] : []),
    ...(user.role === 'admin' ? [{ id: 'system', label: 'System Settings', icon: Settings }] : []),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-2xl border-0">
        <DialogHeader className="pb-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Manage your account preferences and settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="hidden md:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-settings')?.click()}
                className="hidden md:flex"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                id="import-settings"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden bg-gray-50">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 pr-4 bg-white pl-4 py-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pl-6 overflow-y-auto bg-white py-4">
            {activeTab === 'profile' && (
              <div className="space-y-6 bg-white">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={tempSettings.profile.name}
                        onChange={(e) => updateTempSettings('profile.name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={tempSettings.profile.email}
                        onChange={(e) => updateTempSettings('profile.email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={tempSettings.profile.phone || ''}
                        onChange={(e) => updateTempSettings('profile.phone', e.target.value)}
                        placeholder="+254712345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={tempSettings.profile.country}
                        onValueChange={(value) => updateTempSettings('profile.country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={tempSettings.profile.timezone}
                        onValueChange={(value) => updateTempSettings('profile.timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                          <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
                          <SelectItem value="Africa/Cairo">Central Africa Time (CAT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Preferred Language</Label>
                      <Select
                        value={tempSettings.profile.language}
                        onValueChange={(value) => updateTempSettings('profile.language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="sw">Swahili</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={tempSettings.profile.bio || ''}
                      onChange={(e) => updateTempSettings('profile.bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 bg-white">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                      <CardTitle className="text-sm flex items-center text-gray-800">
                        <Bell className="h-4 w-4 mr-2" />
                        Delivery Methods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="email-notifications"
                            checked={tempSettings.notifications.email}
                            onCheckedChange={(checked) => canModifyNotifications() && updateTempSettings('notifications.email', checked)}
                            disabled={!canModifyNotifications()}
                          />
                          <Label htmlFor="email-notifications" className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Notifications
                          </Label>
                        </div>
                        {!canModifyNotifications() && (
                          <span className="text-xs text-orange-600 font-medium">Required for writers</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sms-notifications"
                            checked={tempSettings.notifications.sms}
                            onCheckedChange={(checked) => canModifyNotifications() && updateTempSettings('notifications.sms', checked)}
                            disabled={!canModifyNotifications()}
                          />
                          <Label htmlFor="sms-notifications" className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-2" />
                            SMS Notifications
                          </Label>
                        </div>
                        {!canModifyNotifications() && (
                          <span className="text-xs text-orange-600 font-medium">Required for writers</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="whatsapp-notifications"
                          checked={tempSettings.notifications.whatsapp}
                          onCheckedChange={(checked) => updateTempSettings('notifications.whatsapp', checked)}
                        />
                        <Label htmlFor="whatsapp-notifications" className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp Notifications
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                      <CardTitle className="text-sm text-gray-800">Notification Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="order-updates"
                          checked={tempSettings.notifications.orderUpdates}
                          onCheckedChange={(checked) => updateTempSettings('notifications.orderUpdates', checked)}
                        />
                        <Label htmlFor="order-updates">Order Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="payment-alerts"
                          checked={tempSettings.notifications.paymentAlerts}
                          onCheckedChange={(checked) => updateTempSettings('notifications.paymentAlerts', checked)}
                        />
                        <Label htmlFor="payment-alerts">Payment Alerts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="system-notifications"
                          checked={tempSettings.notifications.systemNotifications}
                          onCheckedChange={(checked) => updateTempSettings('notifications.systemNotifications', checked)}
                        />
                        <Label htmlFor="system-notifications">System Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="weekly-reports"
                          checked={tempSettings.notifications.weeklyReports}
                          onCheckedChange={(checked) => updateTempSettings('notifications.weeklyReports', checked)}
                        />
                        <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      </div>
                      {user.role === 'admin' && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="marketing-emails"
                            checked={tempSettings.notifications.marketingEmails}
                            onCheckedChange={(checked) => updateTempSettings('notifications.marketingEmails', checked)}
                          />
                          <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-6 bg-white">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Display Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={tempSettings.display.theme}
                        onValueChange={(value) => updateTempSettings('display.theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={tempSettings.display.currency}
                        onValueChange={(value) => updateTempSettings('display.currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select
                        value={tempSettings.display.dateFormat}
                        onValueChange={(value) => updateTempSettings('display.dateFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="time-format">Time Format</Label>
                      <Select
                        value={tempSettings.display.timeFormat}
                        onValueChange={(value) => updateTempSettings('display.timeFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="compact-mode"
                        checked={tempSettings.display.compactMode}
                        onCheckedChange={(checked) => updateTempSettings('display.compactMode', checked)}
                      />
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional tab content */}
            <SettingsTabContent
              activeTab={activeTab}
              tempSettings={tempSettings}
              updateTempSettings={updateTempSettings}
              userRole={user.role}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-white px-6 pb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Globe className="h-4 w-4" />
            <span>Settings are saved automatically</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
