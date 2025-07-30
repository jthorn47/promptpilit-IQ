/**
 * ACH Settings Component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Settings,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

interface ACHSettingsData {
  companyInfo: {
    immediateDestination: string;
    immediateOrigin: string;
    companyName: string;
    companyDiscretionaryData: string;
    companyIdentification: string;
    companyEntryDescription: string;
  };
  transmission: {
    method: 'sftp' | 'api' | 'manual';
    cutoffTime: string;
    maxRetryAttempts: number;
    retryDelayMinutes: number;
    testMode: boolean;
  };
  validation: {
    routingNumberValidation: boolean;
    accountNumberValidation: boolean;
    duplicateDetection: boolean;
    amountLimits: {
      maxPerTransaction: number;
      maxPerFile: number;
    };
  };
  notifications: {
    emailOnGeneration: boolean;
    emailOnTransmission: boolean;
    emailOnFailure: boolean;
    emailOnAcknowledgment: boolean;
    recipients: string[];
  };
}

const ACHSettings: React.FC = () => {
  const [settings, setSettings] = useState<ACHSettingsData>({
    companyInfo: {
      immediateDestination: '091000019',
      immediateOrigin: '1234567890',
      companyName: 'ACME CORPORATION',
      companyDiscretionaryData: '',
      companyIdentification: '1234567890',
      companyEntryDescription: 'PAYROLL'
    },
    transmission: {
      method: 'sftp',
      cutoffTime: '15:00',
      maxRetryAttempts: 3,
      retryDelayMinutes: 15,
      testMode: false
    },
    validation: {
      routingNumberValidation: true,
      accountNumberValidation: true,
      duplicateDetection: true,
      amountLimits: {
        maxPerTransaction: 1000000,
        maxPerFile: 10000000
      }
    },
    notifications: {
      emailOnGeneration: false,
      emailOnTransmission: true,
      emailOnFailure: true,
      emailOnAcknowledgment: true,
      recipients: ['admin@company.com', 'payroll@company.com']
    }
  });

  const [activeTab, setActiveTab] = useState<'company' | 'transmission' | 'validation' | 'notifications'>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleTest = async () => {
    // Simulate test connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResult(Math.random() > 0.3 ? 'success' : 'error');
    setTimeout(() => setTestResult(null), 5000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ACH Settings</h1>
          <p className="text-muted-foreground">Configure NACHA file generation and transmission settings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleTest}>
            <TestTube className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {testResult === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">
              {testResult === 'success' 
                ? 'Connection test successful' 
                : 'Connection test failed - please check your settings'}
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'company', label: 'Company Info', icon: Settings },
            { id: 'transmission', label: 'Transmission', icon: Zap },
            { id: 'validation', label: 'Validation', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>NACHA file header information for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Immediate Destination (Bank Routing)</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.companyInfo.immediateDestination}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, immediateDestination: e.target.value }
                  })}
                  placeholder="091000019"
                />
                <p className="text-xs text-muted-foreground mt-1">9-digit routing number of your bank</p>
              </div>
              <div>
                <label className="text-sm font-medium">Immediate Origin (Company ID)</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.companyInfo.immediateOrigin}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, immediateOrigin: e.target.value }
                  })}
                  placeholder="1234567890"
                />
                <p className="text-xs text-muted-foreground mt-1">10-digit company identification number</p>
              </div>
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.companyInfo.companyName}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, companyName: e.target.value }
                  })}
                  placeholder="ACME CORPORATION"
                  maxLength={23}
                />
                <p className="text-xs text-muted-foreground mt-1">Company name (max 23 characters, uppercase)</p>
              </div>
              <div>
                <label className="text-sm font-medium">Company Identification</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.companyInfo.companyIdentification}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, companyIdentification: e.target.value }
                  })}
                  placeholder="1234567890"
                />
                <p className="text-xs text-muted-foreground mt-1">Federal EIN or assigned company ID</p>
              </div>
              <div>
                <label className="text-sm font-medium">Entry Description</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.companyInfo.companyEntryDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, companyEntryDescription: e.target.value }
                  })}
                  placeholder="PAYROLL"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground mt-1">Description that appears on employee bank statements</p>
              </div>
              <div>
                <label className="text-sm font-medium">Discretionary Data</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.companyInfo.companyDiscretionaryData}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, companyDiscretionaryData: e.target.value }
                  })}
                  placeholder="Optional data"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">Optional field for additional company data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'transmission' && (
        <Card>
          <CardHeader>
            <CardTitle>Transmission Settings</CardTitle>
            <CardDescription>Configure how ACH files are sent to your bank</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Transmission Method</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.transmission.method}
                  onChange={(e) => setSettings({
                    ...settings,
                    transmission: { ...settings.transmission, method: e.target.value as 'sftp' | 'api' | 'manual' }
                  })}
                >
                  <option value="sftp">SFTP Upload</option>
                  <option value="api">Bank API</option>
                  <option value="manual">Manual Download</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Daily Cutoff Time</label>
                <input
                  type="time"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.transmission.cutoffTime}
                  onChange={(e) => setSettings({
                    ...settings,
                    transmission: { ...settings.transmission, cutoffTime: e.target.value }
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">Files generated after this time will be held until next day</p>
              </div>
              <div>
                <label className="text-sm font-medium">Max Retry Attempts</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.transmission.maxRetryAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    transmission: { ...settings.transmission, maxRetryAttempts: parseInt(e.target.value) }
                  })}
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Retry Delay (minutes)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={settings.transmission.retryDelayMinutes}
                  onChange={(e) => setSettings({
                    ...settings,
                    transmission: { ...settings.transmission, retryDelayMinutes: parseInt(e.target.value) }
                  })}
                  min="5"
                  max="120"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="testMode"
                checked={settings.transmission.testMode}
                onChange={(e) => setSettings({
                  ...settings,
                  transmission: { ...settings.transmission, testMode: e.target.checked }
                })}
              />
              <label htmlFor="testMode" className="text-sm font-medium">Test Mode</label>
              {settings.transmission.testMode && (
                <Badge variant="outline" className="text-yellow-600">Test files will not be transmitted</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'validation' && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Rules</CardTitle>
            <CardDescription>Configure validation and security settings for ACH files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="routingValidation"
                  checked={settings.validation.routingNumberValidation}
                  onChange={(e) => setSettings({
                    ...settings,
                    validation: { ...settings.validation, routingNumberValidation: e.target.checked }
                  })}
                />
                <label htmlFor="routingValidation" className="text-sm font-medium">Routing Number Validation</label>
                <Badge variant="outline" className="text-green-600">Recommended</Badge>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="accountValidation"
                  checked={settings.validation.accountNumberValidation}
                  onChange={(e) => setSettings({
                    ...settings,
                    validation: { ...settings.validation, accountNumberValidation: e.target.checked }
                  })}
                />
                <label htmlFor="accountValidation" className="text-sm font-medium">Account Number Validation</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="duplicateDetection"
                  checked={settings.validation.duplicateDetection}
                  onChange={(e) => setSettings({
                    ...settings,
                    validation: { ...settings.validation, duplicateDetection: e.target.checked }
                  })}
                />
                <label htmlFor="duplicateDetection" className="text-sm font-medium">Duplicate Transaction Detection</label>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Amount Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Per Transaction</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={settings.validation.amountLimits.maxPerTransaction}
                    onChange={(e) => setSettings({
                      ...settings,
                      validation: { 
                        ...settings.validation, 
                        amountLimits: { 
                          ...settings.validation.amountLimits, 
                          maxPerTransaction: parseInt(e.target.value) 
                        }
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently: {formatCurrency(settings.validation.amountLimits.maxPerTransaction)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Max Per File</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={settings.validation.amountLimits.maxPerFile}
                    onChange={(e) => setSettings({
                      ...settings,
                      validation: { 
                        ...settings.validation, 
                        amountLimits: { 
                          ...settings.validation.amountLimits, 
                          maxPerFile: parseInt(e.target.value) 
                        }
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently: {formatCurrency(settings.validation.amountLimits.maxPerFile)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure when and who receives email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailOnGeneration"
                  checked={settings.notifications.emailOnGeneration}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnGeneration: e.target.checked }
                  })}
                />
                <label htmlFor="emailOnGeneration" className="text-sm font-medium">Email on File Generation</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailOnTransmission"
                  checked={settings.notifications.emailOnTransmission}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnTransmission: e.target.checked }
                  })}
                />
                <label htmlFor="emailOnTransmission" className="text-sm font-medium">Email on Successful Transmission</label>
                <Badge variant="outline" className="text-green-600">Recommended</Badge>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailOnFailure"
                  checked={settings.notifications.emailOnFailure}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnFailure: e.target.checked }
                  })}
                />
                <label htmlFor="emailOnFailure" className="text-sm font-medium">Email on Transmission Failure</label>
                <Badge variant="outline" className="text-red-600">Important</Badge>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailOnAcknowledgment"
                  checked={settings.notifications.emailOnAcknowledgment}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnAcknowledgment: e.target.checked }
                  })}
                />
                <label htmlFor="emailOnAcknowledgment" className="text-sm font-medium">Email on Bank Acknowledgment</label>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Email Recipients</h3>
              <div className="space-y-2">
                {settings.notifications.recipients.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      className="flex-1 p-2 border rounded-md"
                      value={email}
                      onChange={(e) => {
                        const newRecipients = [...settings.notifications.recipients];
                        newRecipients[index] = e.target.value;
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, recipients: newRecipients }
                        });
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newRecipients = settings.notifications.recipients.filter((_, i) => i !== index);
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, recipients: newRecipients }
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { 
                      ...settings.notifications, 
                      recipients: [...settings.notifications.recipients, ''] 
                    }
                  })}
                >
                  Add Recipient
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ACHSettings;