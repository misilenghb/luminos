'use client';

import React from 'react';
import SimpleEnergyChart from './SimpleEnergyChart';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

interface EnergyTrendChartProps {
  profile?: UserProfileDataOutput;
  className?: string;
}

const EnergyTrendChart: React.FC<EnergyTrendChartProps> = ({ profile, className }) => {
  return <SimpleEnergyChart profile={profile} className={className} />;
};

export default EnergyTrendChart;
