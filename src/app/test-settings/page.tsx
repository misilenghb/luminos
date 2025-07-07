"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestSettingsPage() {
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Test Settings Page
      </h1>
      
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Language Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Current Language: <strong>{language}</strong></p>
            <p className="mb-4">Title Translation: {t('settingsPage.title')}</p>
            <Button onClick={handleLanguageSwitch} className="w-full">
              Switch to {language === 'en' ? 'Chinese' : 'English'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>If you can see this card, React components are loading correctly.</p>
            <p>Current time: {new Date().toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
