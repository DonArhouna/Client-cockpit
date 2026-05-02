import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users, Bell, Lock, Server } from 'lucide-react';
import { ProfilePage } from '../profile/ProfilePage';
import { CollaboratorsTab } from './CollaboratorsTab';
import { SecurityTab } from './SecurityTab';
import { NotificationsTab } from './NotificationsTab';
import { AgentTab } from './AgentTab';

export function SettingsPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="space-y-6 p-6 min-h-[calc(100vh/0.9-4rem)]">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('settings.title') || 'Paramètres'}</h1>
                <p className="text-muted-foreground">
                    Gérez vos informations personnelles et les accès de vos collaborateurs.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <TabsTrigger value="profile" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none border-none">
                        <User className="h-4 w-4" />
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="collaborators" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none border-none">
                        <Users className="h-4 w-4" />
                        Collaborateurs
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none border-none">
                        <Lock className="h-4 w-4" />
                        Sécurité
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none border-none">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="agent" className="rounded-lg gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-none border-none">
                        <Server className="h-4 w-4" />
                        Agent Sage
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
                    <ProfilePage />
                </TabsContent>

                <TabsContent value="collaborators" className="mt-0 focus-visible:outline-none">
                    <CollaboratorsTab />
                </TabsContent>

                <TabsContent value="security" className="mt-0 focus-visible:outline-none">
                    <SecurityTab />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
                    <NotificationsTab />
                </TabsContent>

                <TabsContent value="agent" className="mt-0 focus-visible:outline-none">
                    <AgentTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
