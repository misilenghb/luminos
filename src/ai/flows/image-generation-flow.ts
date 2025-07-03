'use server';

/**
 * @fileOverview An AI flow that generates images based on a text prompt.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

// 读取localStorage模型选择（服务端需前端传入或默认）
function getImageModel(inputModel?: string) {
  if (inputModel) return inputModel;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pollinations_image_model') || 'flux';
  }
  return 'flux';
}

const POLLINATIONS_TOKEN = 'il05Qcr-VQMGovbi';

// 类型定义
export type GenerateImageInput = {
  prompt: string;
  language?: 'en' | 'zh';
  model?: string;
  applicationPlatform?: string; // 新增应用平台参数
};
export type GenerateImageOutput = {
  imageUrls: string[];
};

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  // 组合提示词
  const compositionEn = "Studio product photography of the jewelry piece, full view, perfectly centered, no cropping. The composition is elegant against a clean background.";
  const compositionZh = "作品的专业影棚级产品摄影，完整视图，完美居中，无裁剪。在简洁的背景下，构图典雅。";
  const compositionPhrase = input.language === 'zh' ? compositionZh : compositionEn;
  
  // 根据应用平台调整提示词格式
  let imagePrompt = input.prompt;
  const platform = input.applicationPlatform || 'flux';
  
  // 为不同平台优化提示词格式
  switch (platform) {
    case 'midjourney':
      // Midjourney 格式：添加参数和比例
      imagePrompt = `${input.prompt}, ${compositionPhrase} --ar 3:4 --v 6`;
      break;
    case 'dalle':
      // DALL-E 格式：更自然的描述
      imagePrompt = `${input.prompt}. ${compositionPhrase}`;
      break;
    case 'local-comfyui':
    case 'local-automatic1111':
    case 'local-invokeai':
      // 本地模型：简洁的提示词
      imagePrompt = `${input.prompt}, ${compositionPhrase}`;
      break;
    case 'custom':
      // 自定义平台：保持原始提示词
      imagePrompt = input.prompt;
      break;
    default:
      // flux 和其他 Pollinations 模型
      imagePrompt = `${input.prompt}, ${compositionPhrase}`;
  }

  // 读取模型，优先使用应用平台参数
  const model = getImageModel(input.model || input.applicationPlatform);
  
  // 生成图片API
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?model=${model}&token=${POLLINATIONS_TOKEN}&nologo=true&enhance=true&private=true&safe=true&width=1024&height=1024`;

  // 修改为一次只生成1张图片，避免429错误
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `${url}&seed=${seed}`;
  
  return { imageUrls: [imageUrl] };
}
