'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, addMinutes, differenceInMinutes, isAfter, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Play, Pause, Square, RotateCcw, Timer, Gem, Sparkles, Heart, CheckCircle, Calendar, Settings, Volume2, VolumeX, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

// 冥想类型定义
interface MeditationType {
  id: string;
  name: string;
  duration: number; // 分钟
  description: string;
  crystal: string;
  chakra: string;
  intention: string;
  guidance: string[];
  frequency: 'daily' | 'weekly' | 'custom';
}

// 预设冥想类型
const MEDITATION_TYPES: MeditationType[] = [
  {
    id: 'morning-energy',
    name: '晨光能量激活',
    duration: 10,
    description: '开启新一天的正能量流动',
    crystal: '白水晶',
    chakra: 'crown',
    intention: '连接宇宙能量，激活内在光芒',
    guidance: [
      '轻柔地握住白水晶，感受它的清澈能量',
      '深呼吸，想象金色的光芒从头顶流入',
      '让这股能量充满整个身体，温暖每一个细胞',
      '设定今天的积极意图，感受无限可能',
      '缓慢睁开眼睛，保持这份宁静与活力'
    ],
    frequency: 'daily'
  },
  {
    id: 'heart-healing',
    name: '心轮疗愈冥想',
    duration: 15,
    description: '释放情感阻塞，开启爱的流动',
    crystal: '粉水晶',
    chakra: 'heart',
    intention: '释放心中的负面情绪，拥抱自我之爱',
    guidance: [
      '将粉水晶放在心口位置，感受它的温暖',
      '专注于心轮的绿色光芒，感受爱的振动',
      '原谅过去的伤痛，释放不再服务你的情绪',
      '向自己发送无条件的爱与接纳',
      '感受心轮的扩展，爱的能量向外辐射'
    ],
    frequency: 'weekly'
  },
  {
    id: 'protection-grounding',
    name: '保护接地冥想',
    duration: 12,
    description: '建立能量防护，连接大地母亲',
    crystal: '黑曜石',
    chakra: 'root',
    intention: '建立稳固的能量根基，清除负面能量',
    guidance: [
      '手持黑曜石，感受它的沉稳力量',
      '想象从脚底延伸出根系，深入大地核心',
      '吸收大地的稳定能量，让它流遍全身',
      '在身体周围建立保护性的光罩',
      '感受安全感与稳定感充满内心'
    ],
    frequency: 'custom'
  },
  {
    id: 'intuition-awakening',
    name: '直觉觉醒冥想',
    duration: 20,
    description: '开发第三眼，增强直觉能力',
    crystal: '紫水晶',
    chakra: 'thirdEye',
    intention: '激活内在智慧，信任直觉指引',
    guidance: [
      '将紫水晶放在眉心位置，感受微妙的振动',
      '专注于第三眼的紫色光芒，让它渐渐明亮',
      '静静倾听内在的声音，不加判断地接收',
      '信任第一个出现的直觉和图像',
      '感谢内在智慧的指引，保持开放的心态'
    ],
    frequency: 'weekly'
  }
];

// 冥想记录类型
interface MeditationRecord {
  id: string;
  type: string;
  date: Date;
  duration: number;
  completed: boolean;
  notes?: string;
  rating?: number; // 1-5
}

// 音效类型
type SoundType = 'bell' | 'nature' | 'om' | 'silence';

// 提醒时间预设
const REMINDER_PRESETS = [
  { label: '晨起 (07:00)', value: '07:00' },
  { label: '午休 (12:00)', value: '12:00' },
  { label: '黄昏 (18:00)', value: '18:00' },
  { label: '睡前 (21:00)', value: '21:00' },
];

interface CrystalMeditationReminderProps {
  profile?: UserProfileDataOutput;
  className?: string;
}

const CrystalMeditationReminder: React.FC<CrystalMeditationReminderProps> = ({ profile, className }) => {
  // 状态管理
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationType>(MEDITATION_TYPES[0]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState<SoundType>('bell');
  const [records, setRecords] = useState<MeditationRecord[]>([]);
  const [showGuidance, setShowGuidance] = useState(false);
  const [currentGuidanceStep, setCurrentGuidanceStep] = useState(0);
  const [meditationNotes, setMeditationNotes] = useState('');
  const [meditationRating, setMeditationRating] = useState(0);

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('meditationSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setReminderEnabled(settings.reminderEnabled || false);
      setReminderTime(settings.reminderTime || '07:00');
      setSoundEnabled(settings.soundEnabled || true);
      setSoundType(settings.soundType || 'bell');
    }

    const savedRecords = localStorage.getItem('meditationRecords');
    if (savedRecords) {
      const records = JSON.parse(savedRecords).map((r: any) => ({
        ...r,
        date: new Date(r.date)
      }));
      setRecords(records);
    }
  }, []);

  // 保存设置到localStorage
  const saveSettings = useCallback(() => {
    const settings = {
      reminderEnabled,
      reminderTime,
      soundEnabled,
      soundType
    };
    localStorage.setItem('meditationSettings', JSON.stringify(settings));
  }, [reminderEnabled, reminderTime, soundEnabled, soundType]);

  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && !isPaused) {
      interval = setInterval(() => {
        setCurrentTime(time => {
          if (time >= selectedMeditation.duration * 60) {
            setIsTimerActive(false);
            handleMeditationComplete();
            return 0;
          }
          return time + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, isPaused, selectedMeditation.duration]);

  // 冥想完成处理
  const handleMeditationComplete = () => {
    if (soundEnabled && soundType !== 'silence') {
      // 这里可以播放完成音效
      console.log('播放完成音效:', soundType);
    }
    
    // 添加记录
    const newRecord: MeditationRecord = {
      id: Date.now().toString(),
      type: selectedMeditation.id,
      date: new Date(),
      duration: selectedMeditation.duration,
      completed: true,
      rating: meditationRating,
      notes: meditationNotes
    };
    
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem('meditationRecords', JSON.stringify(updatedRecords));
    
    // 重置状态
    setCurrentTime(0);
    setCurrentGuidanceStep(0);
    setShowGuidance(false);
  };

  // 开始冥想
  const startMeditation = () => {
    setIsTimerActive(true);
    setIsPaused(false);
    setCurrentTime(0);
    setShowGuidance(true);
    setCurrentGuidanceStep(0);
  };

  // 暂停/继续
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // 停止冥想
  const stopMeditation = () => {
    setIsTimerActive(false);
    setIsPaused(false);
    setCurrentTime(0);
    setShowGuidance(false);
    setCurrentGuidanceStep(0);
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比
  const progress = (currentTime / (selectedMeditation.duration * 60)) * 100;

  // 获取今天的冥想记录
  const todayRecords = records.filter(record => 
    format(record.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  // 获取本周完成的冥想次数
  const weeklyCount = records.filter(record => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return record.date >= weekStart && record.completed;
  }).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 冥想状态卡片 */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Gem className="mr-2 h-5 w-5 text-purple-500" />
              水晶冥想
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-white/50">
                今日 {todayRecords.length} 次
              </Badge>
              <Badge variant="outline" className="bg-white/50">
                本周 {weeklyCount} 次
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* 选择冥想类型 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">选择冥想类型</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MEDITATION_TYPES.map((meditation) => (
                <Card 
                  key={meditation.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedMeditation.id === meditation.id ? "ring-2 ring-primary" : ""
                  )}
                  onClick={() => setSelectedMeditation(meditation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{meditation.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{meditation.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{meditation.duration}分钟</Badge>
                          <Badge variant="outline" className="text-xs">{meditation.crystal}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 计时器和控制 */}
          <div className="text-center space-y-4">
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-green-400 p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      / {selectedMeditation.duration}分钟
                    </div>
                  </div>
                </div>
              </div>
              {isTimerActive && (
                <div className="absolute inset-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 2.827} 282.7`}
                      className="transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-3">
              {!isTimerActive ? (
                <Button onClick={startMeditation} className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>开始冥想</span>
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={togglePause} className="flex items-center space-x-2">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    <span>{isPaused ? '继续' : '暂停'}</span>
                  </Button>
                  <Button variant="outline" onClick={stopMeditation} className="flex items-center space-x-2">
                    <Square className="h-4 w-4" />
                    <span>停止</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 冥想引导对话框 */}
      <Dialog open={showGuidance} onOpenChange={setShowGuidance}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-pink-500" />
              {selectedMeditation.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
              <div className="text-3xl font-mono font-bold mb-2">
                {formatTime(currentTime)}
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">冥想引导</h3>
              <div className="space-y-2">
                {selectedMeditation.guidance.map((step, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-300",
                      index === currentGuidanceStep
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "bg-muted/30 border-muted"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        index === currentGuidanceStep
                          ? "bg-primary text-primary-foreground"
                          : index < currentGuidanceStep
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {index < currentGuidanceStep ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {currentGuidanceStep < selectedMeditation.guidance.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentGuidanceStep(currentGuidanceStep + 1)}
                  className="w-full"
                >
                  下一步
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 设置和记录标签页 */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">设置</TabsTrigger>
          <TabsTrigger value="records">记录</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                冥想设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 提醒设置 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">每日提醒</label>
                  <p className="text-xs text-muted-foreground">定时提醒您进行冥想</p>
                </div>
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>

              {reminderEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">提醒时间</label>
                  <Select value={reminderTime} onValueChange={setReminderTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_PRESETS.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 音效设置 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">音效提示</label>
                  <p className="text-xs text-muted-foreground">冥想开始和结束时播放音效</p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              {soundEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">音效类型</label>
                  <Select value={soundType} onValueChange={(value) => setSoundType(value as SoundType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bell">钟声</SelectItem>
                      <SelectItem value="nature">自然音</SelectItem>
                      <SelectItem value="om">唵声</SelectItem>
                      <SelectItem value="silence">静音</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                冥想记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8">
                  <Gem className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">还没有冥想记录</p>
                  <p className="text-xs text-muted-foreground">开始您的第一次水晶冥想吧！</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.slice(-10).reverse().map((record) => {
                    const meditation = MEDITATION_TYPES.find(m => m.id === record.type);
                    return (
                      <div key={record.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">{meditation?.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {format(record.date, 'MM/dd HH:mm', { locale: zhCN })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {record.duration}分钟
                            </Badge>
                            {record.rating && (
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span
                                    key={i}
                                    className={cn(
                                      "text-xs",
                                      i < (record.rating || 0) ? "text-yellow-400" : "text-muted-foreground"
                                    )}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {record.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrystalMeditationReminder; 