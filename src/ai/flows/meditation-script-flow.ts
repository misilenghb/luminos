'use server';
import { z } from 'zod';

// 输入参数定义
const InputSchema = z.object({
  profile: z.object({
    mbtiLikeType: z.string().optional(),
    gender: z.string().optional(),
    birthdate: z.string().optional(),
    nickname: z.string().optional(),
  }),
  energyState: z.object({
    date: z.any(),
    energyLevel: z.number(),
    dominantChakra: z.string(),
    recommendedCrystal: z.string(),
    energyColor: z.string(),
    mbtiMood: z.string(),
    elementBalance: z.string(),
    isSpecialDay: z.boolean().optional(),
    specialType: z.string().optional(),
  }),
  meditationType: z.string().optional(),
  crystal: z.string().optional(),
  scenario: z.string().optional(),
  duration: z.string().optional(),
});

// 只导出 async 函数
export async function meditationScriptFlow(input: z.infer<typeof InputSchema>): Promise<{script: string, input: any}> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('参数不合法: ' + JSON.stringify(parsed.error));
  }
  
  // 以下是示例内容，实际项目中应根据不同的冥想类型和水晶生成不同的脚本
  let scriptContent = '';
  const { scenario = '放松冥想', duration = '10', profile, energyState } = input;
  
  // 生成一个基本的冥想脚本
  scriptContent = `${scenario} - ${duration}分钟 引导脚本\n\n`;
  scriptContent += `请找一个安静、舒适的地方坐下或躺下，确保在接下来的${duration}分钟内不会被打扰。\n\n`;
  scriptContent += `闭上眼睛，开始深呼吸。吸气数到4，屏息数到2，呼气数到6。重复几次，让自己的身体完全放松。\n\n`;
  
  // 根据能量状态调整脚本
  if (energyState) {
    if (energyState.energyLevel <= 2) {
      scriptContent += `今天您的能量水平较低，这个冥想将帮助您恢复活力和平衡。\n\n`;
    } else if (energyState.energyLevel >= 4) {
      scriptContent += `今天您的能量水平很高，这个冥想将帮助您引导这些能量并深化您的体验。\n\n`;
    }
    
    // 根据主导脉轮添加内容
    if (energyState.dominantChakra === 'root') {
      scriptContent += `感受您的根脉轮与大地的连接，稳固而安全。想象红色的能量从脊柱底部开始向上流动。\n\n`;
    } else if (energyState.dominantChakra === 'heart') {
      scriptContent += `将意识带到您的心轮，感受绿色治愈能量的流动。让爱和宽恕的能量填满您的胸腔。\n\n`;
    } else if (energyState.dominantChakra === 'thirdEye') {
      scriptContent += `将注意力集中在眉心轮，感受靛蓝色的能量在此激活。开启您的直觉和内在智慧。\n\n`;
    }
    
    // 加入推荐水晶
    scriptContent += `如果有${energyState.recommendedCrystal}，可以将它放在您身边或握在手中，感受它的能量与您共振。\n\n`;
  }
  
  // 根据场景调整内容
  if (scenario.includes('放松')) {
    scriptContent += `让您的每一次呼吸都带走一些紧张和压力，每一次吸气都带来平静和放松。\n\n`;
  } else if (scenario.includes('专注')) {
    scriptContent += `将您的注意力集中在呼吸上，当思绪游走时，温和地将它们带回到呼吸上。\n\n`;
  } else if (scenario.includes('能量')) {
    scriptContent += `想象宇宙的能量通过头顶进入您的身体，流经每一个细胞，为您注入活力。\n\n`;
  } else if (scenario.includes('思绪')) {
    scriptContent += `观察您的想法，但不要评判它们。让它们像云朵一样飘过您的心灵天空。\n\n`;
  }
  
  // 添加结束语
  scriptContent += `慢慢地，开始意识到您周围的环境。轻轻活动您的手指和脚趾。\n\n`;
  scriptContent += `当您准备好时，深吸一口气，睁开眼睛，带着平静和清晰回到当下。\n\n`;
  scriptContent += `感谢自己今天为内在平静所做的努力。`;
  
  return {
    script: scriptContent,
    input
  };
}

export default meditationScriptFlow; 