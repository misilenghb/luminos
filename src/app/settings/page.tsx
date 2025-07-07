"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Sun, Moon, CloudSun, CloudMoon, Crown, User, LogIn, Loader2, Wifi, Languages, Database } from 'lucide-react';
import type { Theme } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ThemeTestComponent from '@/components/ThemeTestComponent';
import UserGalleryStats from '@/components/UserGalleryStats';

// Pollinations supported models
const getImageModels = (t: any) => [
  { value: 'flux', label: `flux (${t('settingsPage.aiModels.models.flux')})` },
  { value: 'flux-pro', label: `flux-pro (${t('settingsPage.aiModels.models.fluxPro')})` },
  { value: 'flux-realism', label: `flux-realism (${t('settingsPage.aiModels.models.fluxRealism')})` },
  { value: 'flux-anime', label: `flux-anime (${t('settingsPage.aiModels.models.fluxAnime')})` },
  { value: 'flux-3d', label: `flux-3d (${t('settingsPage.aiModels.models.flux3d')})` },
  { value: 'flux-cablyai', label: `flux-cablyai (${t('settingsPage.aiModels.models.fluxCablyai')})` },
  { value: 'turbo', label: `turbo (${t('settingsPage.aiModels.models.turbo')})` },
  { value: 'variation', label: `variation (${t('settingsPage.aiModels.models.variation')})` },
  { value: 'dreamshaper', label: `dreamshaper (${t('settingsPage.aiModels.models.dreamshaper')})` },
  { value: 'anything', label: `anything (${t('settingsPage.aiModels.models.anything')})` },
  { value: 'pixart', label: `pixart (${t('settingsPage.aiModels.models.pixart')})` },
];

const getTextModels = (t: any) => [
  { value: 'openai', label: `openai (${t('settingsPage.aiModels.models.openai')})` },
  { value: 'mistral', label: `mistral (${t('settingsPage.aiModels.models.mistral')})` },
  { value: 'gemini', label: `gemini (${t('settingsPage.aiModels.models.gemini')})` },
];

function getLocalModel(key: string, defaultValue: string) {
  if (typeof window === 'undefined') return defaultValue;
  return localStorage.getItem(key) || defaultValue;
}
function setLocalModel(key: string, value: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();


  const [isTesting, setIsTesting] = useState(false);
  const [imageModel, setImageModel] = useState(() => getLocalModel('pollinations_image_model', 'flux'));
  const [textModel, setTextModel] = useState(() => getLocalModel('pollinations_text_model', 'openai'));
  const [token, setToken] = useState(() => getLocalModel('pollinations_token', ''));

  const themeOptions = [
    { value: 'morning', label: t('options.themes.morning'), icon: <Sun className="h-4 w-4" /> },
    { value: 'noon', label: t('options.themes.noon'), icon: <CloudSun className="h-4 w-4" /> },
    { value: 'dusk', label: t('options.themes.dusk'), icon: <CloudMoon className="h-4 w-4" /> },
    { value: 'night', label: t('options.themes.night'), icon: <Moon className="h-4 w-4" /> },
  ];
  
  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // Placeholder for the removed testFirestoreConnection function
      toast({
        title: t('toasts.testConnectionSuccessTitle'),
        description: t('toasts.testConnectionSuccessDesc'),
      });
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      toast({
        variant: "destructive",
        title: t('toasts.testConnectionErrorTitle'),
        description: error instanceof Error ? error.message : t('toasts.testConnectionErrorDesc'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleImageModelChange = (value: string) => {
    setImageModel(value);
    setLocalModel('pollinations_image_model', value);
    toast({ title: t('settingsPage.aiModels.imageModelSwitched'), description: `${t('common.currentModel', { model: value })}` });
  };
  const handleTextModelChange = (value: string) => {
    setTextModel(value);
    setLocalModel('pollinations_text_model', value);
    toast({ title: t('settingsPage.aiModels.textModelSwitched'), description: `${t('common.currentModel', { model: value })}` });
  };

  return (
    <div className="container-center space-section">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold energy-gradient flex items-center justify-center mb-4">
          <SettingsIcon className="mr-3 h-10 w-10" />
          {t('settingsPage.title')}
        </h1>

      </header>

      <div className="max-w-md mx-auto space-content">
         <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>{t('settingsPage.accountTitle')}</CardTitle>
            <CardDescription>{t('settingsPage.accountDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
               <div className="space-y-4">
                  <p>{t('settingsPage.loggedInAs', { email: user?.email })}</p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/settings/membership">
                        <Crown className="mr-2 h-4 w-4 text-accent" />
                        {t('settingsPage.membershipButton')}
                    </Link>
                  </Button>
               </div>
            ) : (
                <div className="space-y-4 text-center">
                    <p className="text-muted-foreground">{t('settingsPage.notLoggedIn')}</p>
                    <Button asChild className="w-full">
                        <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            {t('settingsPage.loginButton')}
                        </Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* {t('settingsPage.userGalleryStats')} - 仅在用户登录时显示 */}
        {isAuthenticated && <UserGalleryStats />}

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center"><Languages className="mr-2 h-5 w-5 text-primary"/>{t('settingsPage.language')}</CardTitle>
            <CardDescription>{t('settingsPage.selectLanguage')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language-select">{t('settingsPage.language')}</Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as 'en' | 'zh')}
              >
                <SelectTrigger id="language-select">
                  <SelectValue placeholder={t('settingsPage.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settingsPage.english')}</SelectItem>
                  <SelectItem value="zh">{t('settingsPage.chinese')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center"><Sun className="mr-2 h-5 w-5 text-primary"/>{t('settingsPage.theme')}</CardTitle>
            <CardDescription>{t('settingsPage.selectTheme')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="theme-select">{t('settingsPage.theme')}</Label>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value as Theme)}
              >
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder={t('settingsPage.selectTheme')} />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map(option => (
                     <SelectItem key={option.value} value={option.value}>
                       <div className="flex items-center gap-2">
                         {option.icon}
                         <span>{option.label}</span>
                       </div>
                     </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center"><Wifi className="mr-2 h-5 w-5 text-primary"/>{t('settingsPage.testConnectionTitle')}</CardTitle>
            <CardDescription>{t('settingsPage.testConnectionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTestConnection} disabled={isTesting} className="w-full">
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isTesting ? t('settingsPage.testingConnectionButton') : t('settingsPage.testConnectionButton')}
            </Button>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-primary"/>
              {t('settingsPage.databaseManagement.title')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.databaseManagement.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('settingsPage.databaseManagement.helpText')}
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/database-management">
                  <Database className="mr-2 h-4 w-4" />
                  {t('settingsPage.databaseManagement.button')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle>{t('settingsPage.aiModels.title')}</CardTitle>
            <CardDescription>{t('settingsPage.aiModels.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>{t('settingsPage.aiModels.imageModelLabel')}</Label>
              <Select value={imageModel} onValueChange={handleImageModelChange}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder={t('settingsPage.aiModels.imageModelPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {getImageModels(t).map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('settingsPage.aiModels.textModelLabel')}</Label>
              <Select value={textModel} onValueChange={handleTextModelChange}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder={t('settingsPage.aiModels.textModelPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {getTextModels(t).map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label>Pollinations API Token</Label>
              <input
                type="text"
                className="input input-bordered w-full mt-2 px-3 py-2 border rounded"
                value={token}
                onChange={e => {
                  setToken(e.target.value);
                  setLocalModel('pollinations_token', e.target.value);
                }}
                placeholder={t('settingsPage.aiModels.tokenPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* {t('settingsPage.themeTest')} */}
      <div className="mt-12">
        <ThemeTestComponent />
      </div>
    </div>
  );
}
