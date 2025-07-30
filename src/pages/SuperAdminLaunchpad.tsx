import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Key, Settings, Zap, DollarSign, AlertTriangle, Rocket, Cog } from 'lucide-react';
import { UserManagement } from '@/components/superadmin/UserManagement';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { ApiKeyManagement } from '@/components/superadmin/ApiKeyManagement';
import { Integrations } from '@/components/settings/Integrations';
import { WageTableManager } from '@/components/superadmin/WageTableManager';
import { ComplianceAlertsManager } from '@/components/wage-compliance/ComplianceAlertsManager';
import Phase2Roadmap from '@/components/superadmin/Phase2Roadmap';
import { useNavigate } from 'react-router-dom';

type AdminView = 'dashboard' | 'users' | 'companies' | 'api-keys' | 'integrations' | 'wage-manager' | 'compliance-alerts' | 'phase2';

export default function SuperAdminLaunchpad() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  if (activeView === 'dashboard') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('superadmin.title')}</h1>
          <p className="text-muted-foreground">
            {t('superadmin.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/settings')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Cog className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">System Settings</h3>
                <p className="text-muted-foreground">Manage global system configurations and user accounts</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('users')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('superadmin.userManagement')}</h3>
                <p className="text-muted-foreground">{t('superadmin.userManagementDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('companies')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('superadmin.companySettings')}</h3>
                <p className="text-muted-foreground">{t('superadmin.companySettingsDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('api-keys')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('superadmin.apiKeyManagement')}</h3>
                <p className="text-muted-foreground">{t('superadmin.apiKeyManagementDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('integrations')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('superadmin.integrations')}</h3>
                <p className="text-muted-foreground">{t('superadmin.integrationsDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('wage-manager')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('superadmin.wageTableManager')}</h3>
                <p className="text-muted-foreground">{t('superadmin.wageTableManagerDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('compliance-alerts')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('superadmin.complianceAlerts')}</h3>
                <p className="text-muted-foreground">{t('superadmin.complianceAlertsDesc')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('phase2')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('superadmin.phase2Roadmap')}</h3>
                <p className="text-muted-foreground">{t('superadmin.phase2RoadmapDesc')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setActiveView('dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.backToDashboard')}
        </Button>
      </div>

      {activeView === 'users' && <UserManagement />}
      {activeView === 'companies' && <CompanySettings />}
      {activeView === 'api-keys' && <ApiKeyManagement />}
      {activeView === 'integrations' && <Integrations />}
      {activeView === 'wage-manager' && <WageTableManager />}
      {activeView === 'compliance-alerts' && <ComplianceAlertsManager />}
      {activeView === 'phase2' && <Phase2Roadmap />}
    </div>
  );
}