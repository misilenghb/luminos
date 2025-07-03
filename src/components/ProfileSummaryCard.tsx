"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Sun, Moon, Brain, Sparkles } from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

interface ProfileSummaryCardProps {
  profile: UserProfileDataOutput;
}

const extractMbtiType = (description?: string): string | null => {
  if (!description) return null;
  const match = description.match(/\b([IE][NS][TF][JP])\b/);
  return match ? match[0] : null;
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => {
    if (!value || value.includes('cannot be determined') || value.includes('无法') || value.includes('could not be generated')) return null;
    return (
        <div className="flex items-center text-sm">
            <Icon className="h-4 w-4 mr-3 text-muted-foreground shrink-0" />
            <span className="font-semibold mr-2">{label}:</span>
            <span className="text-muted-foreground truncate">{value}</span>
        </div>
    )
}

const ProfileSummaryCard = ({ profile }: ProfileSummaryCardProps) => {
    const { t } = useLanguage();
    const mbtiType = extractMbtiType(profile.mbtiLikeType);
    
    return (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                    <AvatarFallback>{profile.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{profile.name || t('energyExplorationPage.userProfile.title')}</CardTitle>
                    <CardDescription>{t('dailyFocusPage.profileCard.description')}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                 <InfoRow icon={Sun} label={t('dailyFocusPage.profileCard.zodiac')} value={profile.inferredZodiac} />
                 <InfoRow icon={Moon} label={t('dailyFocusPage.profileCard.chineseZodiac')} value={profile.inferredChineseZodiac} />
                 <InfoRow icon={Sparkles} label={t('dailyFocusPage.profileCard.element')} value={profile.inferredElement} />
                 <InfoRow icon={Brain} label={t('dailyFocusPage.profileCard.mbti')} value={mbtiType} />
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full" variant="outline">
                    <Link href="/gallery">{t('dailyFocusPage.profileCard.viewFullProfile')}</Link>
                 </Button>
            </CardFooter>
        </Card>
    );
};

ProfileSummaryCard.Skeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </CardHeader>
        <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

ProfileSummaryCard.CreatePrompt = () => {
    const { t } = useLanguage();
    return (
        <Card className="text-center p-6">
            <CardHeader className="p-0 mb-4">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-2">{t('dailyFocusPage.noProfile.title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <p className="text-sm text-muted-foreground">{t('dailyFocusPage.noProfile.description')}</p>
            </CardContent>
            <CardFooter className="p-0 mt-4">
                <Button asChild className="w-full">
                    <Link href="/energy-exploration">{t('dailyFocusPage.noProfile.button')}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

ProfileSummaryCard.displayName = 'ProfileSummaryCard';

export default ProfileSummaryCard;
