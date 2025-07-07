import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Clock, Coffee, Moon, Brain, Users, Wind, Heart } from 'lucide-react';
import type { DailyEnergyState } from '@/types/daily-focus';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

interface PersonalizedScheduleProps {
  energyState?: DailyEnergyState;
  profile?: UserProfileDataOutput | null;
}

const ICONS: { [key: string]: React.ReactElement } = {
  meditation: <Wind />,
  focus: <Brain />,
  social: <Users />,
  relax: <Heart />,
  default: <Clock />,
};

const generateSchedule = (energyState?: DailyEnergyState, profile?: UserProfileDataOutput | null) => {
  if (!energyState || !profile) {
    return [
      { time: '09:00', activity: '清晨冥想', description: '佩戴白水晶，专注呼吸', icon: 'meditation' },
      { time: '11:00', activity: '专注工作', description: '将黄水晶放置在桌面，提升创造力', icon: 'focus' },
      { time: '15:00', activity: '午后小憩', description: '手握粉水晶，释放压力', icon: 'relax' },
      { time: '21:00', activity: '睡前放松', description: '使用紫水晶，促进安眠', icon: 'default' },
    ];
  }

  const { energyLevel, mbtiMood, recommendedCrystal } = energyState;
  const suggestions = [];

  // Morning
  suggestions.push({
    time: '09:00',
    activity: '清晨能量启动',
    description: `以15分钟的冥想开始新的一天，佩戴您今日的水晶伙伴“${recommendedCrystal}”，设定积极意图。`,
    icon: 'meditation',
  });

  // Mid-day
  if (energyLevel >= 4) {
    suggestions.push({
      time: '11:00',
      activity: '高效创造时段',
      description: `能量充沛！非常适合处理复杂任务或进行创意工作。您的能量状态是“${mbtiMood}”，善用这股力量。`,
      icon: 'focus',
    });
  } else {
    suggestions.push({
      time: '11:00',
      activity: '稳步推进任务',
      description: `能量平稳，适合处理常规任务。记得保持专注，您的状态是“${mbtiMood}”。`,
      icon: 'focus',
    });
  }
  
  // Afternoon
  if (energyLevel <= 2) {
     suggestions.push({
      time: '15:00',
      activity: '能量补充小憩',
      description: '感觉能量较低，建议进行短暂休息、散步或听听音乐来充电。',
      icon: 'relax',
    });
  } else {
    suggestions.push({
      time: '15:00',
      activity: '社交或协作',
      description: `适合与同事沟通或进行团队协作，您的“${profile.inferredElement}”元素特质能帮助您顺畅交流。`,
      icon: 'social',
    });
  }

  // Evening
  suggestions.push({
    time: '21:00',
    activity: '睡前静心',
    description: `回顾今天，为自己做过的事情感到自豪。远离电子屏幕，阅读或听轻音乐放松身心。`,
    icon: 'default',
  });

  return suggestions;
};


const PersonalizedSchedule: React.FC<PersonalizedScheduleProps> = ({ energyState, profile }) => {
  const schedule = generateSchedule(energyState, profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle>个性化日程建议</CardTitle>
        <CardDescription>根据您的今日能量状态动态生成</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {schedule.map((item, index) => (
            <li key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                {ICONS[item.icon] || <Clock />}
              </div>
              <div>
                <p className="font-semibold">{item.time} - {item.activity}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PersonalizedSchedule; 