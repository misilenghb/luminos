'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const steps: { key: keyof GlobalDesignParams; label: string; optionsKey: keyof typeof import('@/contexts/LanguageContext').optionListKeys }[] = [
  { key: 'applicationPlatform', label: '应用平台', optionsKey: 'applicationPlatforms' },
  { key: 'aspectRatio', label: '画布比例', optionsKey: 'photographyAspectRatios' },
  { key: 'designCategory', label: '设计类别', optionsKey: 'designCategories' },
  { key: 'overallDesignStyle', label: '设计风格', optionsKey: 'overallDesignStyles' },
  { key: 'userIntent', label: '用途/意图', optionsKey: 'userIntents' },
];

export interface GlobalDesignParams {
  applicationPlatform: string;
  aspectRatio: string;
  designCategory: string;
  overallDesignStyle: string;
  userIntent: string;
}

const defaultParams: GlobalDesignParams = {
  applicationPlatform: '',
  aspectRatio: '',
  designCategory: '',
  overallDesignStyle: '',
  userIntent: '',
};

const GlobalDesignParameterChat: React.FC<{ open: boolean; onClose: () => void; onComplete: (params: GlobalDesignParams) => void; }> = ({ open, onClose, onComplete }) => {
  const { t, getTranslatedOptions } = useLanguage();
  const [params, setParams] = useState<GlobalDesignParams>(defaultParams);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);

  const current = steps[step];
  const options = getTranslatedOptions(current.optionsKey);
  const isLast = step === steps.length - 1;
  const isComplete = Object.values(params).every(Boolean);

  const handleNext = () => {
    setTouched(false);
    if (isLast) {
      onComplete(params);
      onClose();
      setStep(0);
      setParams(defaultParams);
    } else {
      setStep(s => s + 1);
    }
  };
  const handlePrev = () => {
    setTouched(false);
    setStep(s => Math.max(0, s - 1));
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI设计参数设置</DialogTitle>
          <DialogDescription>请依次完善设计参数，填写完整后可发起AI设计建议，避免资源浪费。</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <div className="mb-2 font-medium">{current.label}</div>
            <Select value={params[current.key as keyof GlobalDesignParams]} onValueChange={v => { setParams(p => ({ ...p, [current.key]: v })); setTouched(true); }}>
              <SelectTrigger><SelectValue placeholder={`请选择${current.label}`} /></SelectTrigger>
              <SelectContent>
                {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {touched && !params[current.key as keyof GlobalDesignParams] && <div className="text-destructive text-xs mt-2">请先选择{current.label}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handlePrev} disabled={step === 0}>上一步</Button>
          <Button onClick={handleNext} disabled={!params[current.key as keyof GlobalDesignParams]}> {isLast ? '完成' : '下一步'} </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalDesignParameterChat; 