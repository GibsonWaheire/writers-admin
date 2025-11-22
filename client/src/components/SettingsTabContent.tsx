import { 
  Eye, 
  CreditCard, 
  Lock, 
  Briefcase, 
  Settings, 
  Bell, 
  Clock,
  Wifi
} from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useSettings } from '../contexts/SettingsContext';
import type { UserSettings } from '../contexts/SettingsContext';

interface SettingsTabContentProps {
  activeTab: string;
  tempSettings: UserSettings;
  updateTempSettings: (path: string, value: any) => void;
  userRole: 'writer' | 'admin';
}

export function SettingsTabContent({ activeTab, tempSettings, updateTempSettings, userRole }: SettingsTabContentProps) {
  const { canModifyPrivacy } = useSettings();

  if (activeTab === 'privacy') {
    return (
      <div className="space-y-6 bg-white">
        <div>
          <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center text-gray-800">
                <Eye className="h-4 w-4 mr-2" />
                Profile Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profile-visibility">Who can see your profile?</Label>
                <Select
                  value={tempSettings.privacy.profileVisibility}
                  onValueChange={(value) => canModifyPrivacy() && updateTempSettings('privacy.profileVisibility', value)}
                  disabled={!canModifyPrivacy()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Everyone</SelectItem>
                    <SelectItem value="writers_only">Writers Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                {!canModifyPrivacy() && (
                  <p className="text-xs text-orange-600 mt-1">Writers must have public profiles to receive orders</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-gray-500">Let others see when you're online</p>
                </div>
                <Checkbox
                  checked={tempSettings.privacy.showOnlineStatus}
                  onCheckedChange={(checked) => updateTempSettings('privacy.showOnlineStatus', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Performance Stats</Label>
                  <p className="text-sm text-gray-500">Show your completion rate and ratings</p>
                </div>
                <Checkbox
                  checked={tempSettings.privacy.sharePerformanceStats}
                  onCheckedChange={(checked) => updateTempSettings('privacy.sharePerformanceStats', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Direct Messages</Label>
                  <p className="text-sm text-gray-500">Let clients contact you directly</p>
                </div>
                <Checkbox
                  checked={tempSettings.privacy.allowDirectMessages}
                  onCheckedChange={(checked) => updateTempSettings('privacy.allowDirectMessages', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeTab === 'payment') {
    return (
      <div className="space-y-6 bg-white">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {userRole === 'writer' ? 'Payment Settings' : 'Platform Payment Settings'}
          </h3>
          
          {userRole === 'writer' && tempSettings.writerPayment && (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-sm flex items-center text-gray-800">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Preferred Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select
                    value={tempSettings.writerPayment.preferredMethod}
                    onValueChange={(value) => updateTempSettings('writerPayment.preferredMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tempSettings.writerPayment.preferredMethod === 'mobile_money' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="mm-provider">Provider</Label>
                      <Select
                        value={tempSettings.writerPayment.mobileMoneyDetails?.provider || ''}
                        onValueChange={(value) => updateTempSettings('writerPayment.mobileMoneyDetails.provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Safaricom">Safaricom (M-Pesa)</SelectItem>
                          <SelectItem value="Airtel">Airtel Money</SelectItem>
                          <SelectItem value="Telkom">T-Kash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mm-phone">Phone Number</Label>
                      <Input
                        id="mm-phone"
                        value={tempSettings.writerPayment.mobileMoneyDetails?.phoneNumber || ''}
                        onChange={(e) => updateTempSettings('writerPayment.mobileMoneyDetails.phoneNumber', e.target.value)}
                        placeholder="+254712345678"
                      />
                    </div>
                  </div>
                )}

                {tempSettings.writerPayment.preferredMethod === 'bank_transfer' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input
                        id="bank-name"
                        value={tempSettings.writerPayment.bankDetails?.bankName || ''}
                        onChange={(e) => updateTempSettings('writerPayment.bankDetails.bankName', e.target.value)}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input
                        id="account-number"
                        value={tempSettings.writerPayment.bankDetails?.accountNumber || ''}
                        onChange={(e) => updateTempSettings('writerPayment.bankDetails.accountNumber', e.target.value)}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-name">Account Name</Label>
                      <Input
                        id="account-name"
                        value={tempSettings.writerPayment.bankDetails?.accountName || ''}
                        onChange={(e) => updateTempSettings('writerPayment.bankDetails.accountName', e.target.value)}
                        placeholder="Enter account name"
                      />
                    </div>
                  </div>
                )}

                {tempSettings.writerPayment.preferredMethod === 'paypal' && (
                  <div>
                    <Label htmlFor="paypal-email">PayPal Email</Label>
                    <Input
                      id="paypal-email"
                      type="email"
                      value={tempSettings.writerPayment.paypalEmail || ''}
                      onChange={(e) => updateTempSettings('writerPayment.paypalEmail', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                {tempSettings.writerPayment.preferredMethod === 'crypto' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="crypto-type">Cryptocurrency</Label>
                      <Select
                        value={tempSettings.writerPayment.cryptoWallet?.type || ''}
                        onValueChange={(value) => updateTempSettings('writerPayment.cryptoWallet.type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                          <SelectItem value="Ethereum">Ethereum</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="crypto-address">Wallet Address</Label>
                      <Input
                        id="crypto-address"
                        value={tempSettings.writerPayment.cryptoWallet?.address || ''}
                        onChange={(e) => updateTempSettings('writerPayment.cryptoWallet.address', e.target.value)}
                        placeholder="Enter wallet address"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {userRole === 'admin' && tempSettings.adminPayment && (
            <>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle className="text-sm flex items-center text-gray-800">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Platform Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platform-bank">Bank Name</Label>
                    <Input
                      id="platform-bank"
                      value={tempSettings.adminPayment.platformBankDetails.bankName}
                      onChange={(e) => updateTempSettings('adminPayment.platformBankDetails.bankName', e.target.value)}
                      placeholder="Platform bank name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform-account">Account Number</Label>
                    <Input
                      id="platform-account"
                      value={tempSettings.adminPayment.platformBankDetails.accountNumber}
                      onChange={(e) => updateTempSettings('adminPayment.platformBankDetails.accountNumber', e.target.value)}
                      placeholder="Platform account number"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle className="text-sm flex items-center text-gray-800">
                    <Wifi className="h-4 w-4 mr-2" />
                    Payment Gateways
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Stripe Integration</Label>
                      <p className="text-sm text-gray-500">Enable Stripe payments</p>
                    </div>
                    <Checkbox
                      checked={tempSettings.adminPayment.paymentGateways.stripe.enabled}
                      onCheckedChange={(checked) => updateTempSettings('adminPayment.paymentGateways.stripe.enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>PayPal Integration</Label>
                      <p className="text-sm text-gray-500">Enable PayPal payments</p>
                    </div>
                    <Checkbox
                      checked={tempSettings.adminPayment.paymentGateways.paypal.enabled}
                      onCheckedChange={(checked) => updateTempSettings('adminPayment.paymentGateways.paypal.enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>M-Pesa Integration</Label>
                      <p className="text-sm text-gray-500">Enable M-Pesa payments</p>
                    </div>
                    <Checkbox
                      checked={tempSettings.adminPayment.paymentGateways.mpesa.enabled}
                      onCheckedChange={(checked) => updateTempSettings('adminPayment.paymentGateways.mpesa.enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <CardTitle className="text-sm flex items-center text-gray-800">
                    <Clock className="h-4 w-4 mr-2" />
                    Auto-Payout Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Auto-Payouts</Label>
                      <p className="text-sm text-gray-500">Automatically pay writers</p>
                    </div>
                    <Checkbox
                      checked={tempSettings.adminPayment.autoPayoutSettings.enabled}
                      onCheckedChange={(checked) => updateTempSettings('adminPayment.autoPayoutSettings.enabled', checked)}
                    />
                  </div>
                  {tempSettings.adminPayment.autoPayoutSettings.enabled && (
                    <>
                      <div>
                        <Label htmlFor="min-payout">Minimum Payout Amount (KES)</Label>
                        <Input
                          id="min-payout"
                          type="number"
                          value={tempSettings.adminPayment.autoPayoutSettings.minimumAmount}
                          onChange={(e) => updateTempSettings('adminPayment.autoPayoutSettings.minimumAmount', parseInt(e.target.value))}
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payout-frequency">Payout Frequency</Label>
                        <Select
                          value={tempSettings.adminPayment.autoPayoutSettings.frequency}
                          onValueChange={(value) => updateTempSettings('adminPayment.autoPayoutSettings.frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'security') {
    return (
      <div className="space-y-6 bg-white">
        <div>
          <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center text-gray-800">
                <Lock className="h-4 w-4 mr-2" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Checkbox
                  checked={tempSettings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => updateTempSettings('security.twoFactorEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                </div>
                <Checkbox
                  checked={tempSettings.security.loginNotifications}
                  onCheckedChange={(checked) => updateTempSettings('security.loginNotifications', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Select
                  value={tempSettings.security.sessionTimeout.toString()}
                  onValueChange={(value) => updateTempSettings('security.sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">Automatically log out after this period of inactivity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeTab === 'work' && userRole === 'writer' && tempSettings.workPreferences) {
    return (
      <div className="space-y-6 bg-white">
        <div>
          <h3 className="text-lg font-semibold mb-4">Work Preferences</h3>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center text-gray-800">
                <Briefcase className="h-4 w-4 mr-2" />
                Work Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max-orders">Maximum Concurrent Orders</Label>
                <Select
                  value={tempSettings.workPreferences.maxConcurrentOrders.toString()}
                  onValueChange={(value) => updateTempSettings('workPreferences.maxConcurrentOrders', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 order</SelectItem>
                    <SelectItem value="2">2 orders</SelectItem>
                    <SelectItem value="3">3 orders</SelectItem>
                    <SelectItem value="5">5 orders</SelectItem>
                    <SelectItem value="10">10 orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="min-order-value">Minimum Order Value (KES)</Label>
                <Input
                  id="min-order-value"
                  type="number"
                  value={tempSettings.workPreferences.minimumOrderValue}
                  onChange={(e) => updateTempSettings('workPreferences.minimumOrderValue', parseInt(e.target.value))}
                  placeholder="500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Accept Orders</Label>
                  <p className="text-sm text-gray-500">Automatically accept orders that match your criteria</p>
                </div>
                <Checkbox
                  checked={tempSettings.workPreferences.autoAcceptOrders}
                  onCheckedChange={(checked) => updateTempSettings('workPreferences.autoAcceptOrders', checked)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="work-start">Work Start Time</Label>
                  <Input
                    id="work-start"
                    type="time"
                    value={tempSettings.workPreferences.workingHours.start}
                    onChange={(e) => updateTempSettings('workPreferences.workingHours.start', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="work-end">Work End Time</Label>
                  <Input
                    id="work-end"
                    type="time"
                    value={tempSettings.workPreferences.workingHours.end}
                    onChange={(e) => updateTempSettings('workPreferences.workingHours.end', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeTab === 'system' && userRole === 'admin' && tempSettings.systemSettings) {
    return (
      <div className="space-y-6 bg-white">
        <div>
          <h3 className="text-lg font-semibold mb-4">System Settings</h3>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center text-gray-800">
                <Settings className="h-4 w-4 mr-2" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Approve Orders</Label>
                  <p className="text-sm text-gray-500">Automatically approve completed orders</p>
                </div>
                <Checkbox
                  checked={tempSettings.systemSettings.autoApproveOrders}
                  onCheckedChange={(checked) => updateTempSettings('systemSettings.autoApproveOrders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Order Approval</Label>
                  <p className="text-sm text-gray-500">All orders must be approved by admin</p>
                </div>
                <Checkbox
                  checked={tempSettings.systemSettings.requireOrderApproval}
                  onCheckedChange={(checked) => updateTempSettings('systemSettings.requireOrderApproval', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="default-deadline">Default Order Deadline (days)</Label>
                <Input
                  id="default-deadline"
                  type="number"
                  value={tempSettings.systemSettings.defaultOrderDeadline}
                  onChange={(e) => updateTempSettings('systemSettings.defaultOrderDeadline', parseInt(e.target.value))}
                  placeholder="7"
                />
              </div>
              
              <div>
                <Label htmlFor="min-rating">Minimum Writer Rating</Label>
                <Input
                  id="min-rating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={tempSettings.systemSettings.minimumWriterRating}
                  onChange={(e) => updateTempSettings('systemSettings.minimumWriterRating', parseFloat(e.target.value))}
                  placeholder="3.0"
                />
              </div>
              
              <div>
                <Label htmlFor="platform-commission">Platform Commission (%)</Label>
                <Input
                  id="platform-commission"
                  type="number"
                  min="0"
                  max="50"
                  value={tempSettings.systemSettings.platformCommission}
                  onChange={(e) => updateTempSettings('systemSettings.platformCommission', parseInt(e.target.value))}
                  placeholder="15"
                />
              </div>
              
              <div>
                <Label htmlFor="balance-threshold">Low Balance Threshold (KES)</Label>
                <Input
                  id="balance-threshold"
                  type="number"
                  value={tempSettings.systemSettings.lowBalanceThreshold}
                  onChange={(e) => updateTempSettings('systemSettings.lowBalanceThreshold', parseInt(e.target.value))}
                  placeholder="50000"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Put the platform in maintenance mode</p>
                </div>
                <Checkbox
                  checked={tempSettings.systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => updateTempSettings('systemSettings.maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center text-gray-800">
                <Bell className="h-4 w-4 mr-2" />
                System Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Balance Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when platform balance is low</p>
                </div>
                <Checkbox
                  checked={tempSettings.systemSettings.systemNotifications.lowBalance}
                  onCheckedChange={(checked) => updateTempSettings('systemSettings.systemNotifications.lowBalance', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Overdue Order Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about overdue orders</p>
                </div>
                <Checkbox
                  checked={tempSettings.systemSettings.systemNotifications.overdueOrders}
                  onCheckedChange={(checked) => updateTempSettings('systemSettings.systemNotifications.overdueOrders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Writer Inactivity Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about inactive writers</p>
                </div>
                <Checkbox
                  checked={tempSettings.systemSettings.systemNotifications.writerInactivity}
                  onCheckedChange={(checked) => updateTempSettings('systemSettings.systemNotifications.writerInactivity', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Error Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about system errors</p>
                </div>
                <Checkbox
                  checked={tempSettings.systemSettings.systemNotifications.systemErrors}
                  onCheckedChange={(checked) => updateTempSettings('systemSettings.systemNotifications.systemErrors', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}