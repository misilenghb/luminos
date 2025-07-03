
"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Gem } from 'lucide-react';
import type { Bead } from '@/ai/schemas/design-schemas';

interface Bracelet3DPreviewProps {
    beads?: Bead[];
}

const colorNameToHex = (colorName: string): string => {
    const lowerColor = (colorName || "grey").toLowerCase();
    const colorMap: Record<string, string> = {
        pink: '#FFC0CB',
        lightpink: '#FFB6C1',
        rosepink: '#FF69B4',
        palepink: '#DB7093',
        purple: '#800080',
        lavender: '#E6E6FA',
        deeppurple: '#4B0082',
        lilac: '#C8A2C8',
        clear: '#F0F8FF',
        white: '#FFFFFF',
        yellow: '#FFFF00',
        goldenyellow: '#FFDF00',
        orangeyellow: '#FFA500',
        brownishyellow: '#D2B48C',
        bluesheen: '#87CEEB',
        rainbow: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
        peach: '#FFDAB9',
        grey: '#808080',
        'grey-green': '#A9A9A9',
        darkgrey: '#A9A9A9',
        black: '#000000',
        blueflash: '#00BFFF',
        greenflash: '#32CD32',
        goldflash: '#FFD700',
        rainbowflash: 'linear-gradient(to right, #FF7F50, #DA70D6, #00BFFF)',
        lightbrown: '#CD853F',
        darkbrown: '#8B4513',
        greyishbrown: '#A0522D',
        blackishbrown: '#5C4033',
        deepblue: '#00008B',
        royalblue: '#4169E1',
        azureblue: '#F0FFFF',
        'bluewithgoldflecks': '#00008B',
        skyblue: '#87CEEB',
        bluegreen: '#0D98BA',
        green: '#008000',
        'robinseggblue': '#00CCCC',
        deepred: '#8B0000',
        reddishbrown: '#A52A2A',
        orange: '#FFA500',
        redpurple: '#C71585',
        verydarkbrown: '#3E2723',
        translucentwhite: '#F5F5F5',
        darkgreen: '#006400',
        paleblue: '#ADD8E6',
        lightblue: '#ADD8E6',
        seagreen: '#2E8B57',
        silver: '#C0C0C0'
    };
    const key = lowerColor.replace(/ /g, '').replace(/\(.*\)/, '');
    return colorMap[key] || '#cccccc'; // Default grey
};


const Bracelet3DPreview: React.FC<Bracelet3DPreviewProps> = ({ beads }) => {
    const { t } = useLanguage();
    const radius = 80; // in pixels

    if (!beads || beads.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Gem className="mr-2 h-5 w-5 text-accent" />{t('bracelet3DPreview.title')}</CardTitle>
                    <CardDescription>{t('bracelet3DPreview.description')}</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">{t('bracelet3DPreview.emptyState')}</p>
                </CardContent>
            </Card>
        );
    }
    
    const angleStep = beads.length > 0 ? 360 / beads.length : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Gem className="mr-2 h-5 w-5 text-accent" />{t('bracelet3DPreview.title')}</CardTitle>
                <CardDescription>{t('bracelet3DPreview.description')}</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center relative">
                <div className="relative w-0 h-0">
                    {beads.map((bead, index) => {
                        const angle = angleStep * index;
                        const beadColor = colorNameToHex(bead.color || 'grey');
                        const sizeValue = bead.type === 'spacer' ? 12 : (bead.role === 'focal' ? 32 : 24);
                        const size = `${sizeValue}px`;
                        
                        return (
                            <div
                                key={index}
                                className="absolute rounded-full border-2 border-white/50 shadow-lg"
                                style={{
                                    width: size,
                                    height: size,
                                    background: beadColor,
                                    transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
                                    transformOrigin: '0 0',
                                    top: '50%',
                                    left: '50%',
                                    marginLeft: `-${sizeValue / 2}px`,
                                    marginTop: `-${sizeValue / 2}px`,
                                    transition: 'all 0.5s ease-in-out',
                                    zIndex: bead.role === 'focal' ? 10 : 5,
                                }}
                                title={bead.crystalType || 'Spacer'}
                            />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default Bracelet3DPreview;
