import type { DesignStateInput } from '@/types/design';
import type { CrystalTypeMapping } from '@/lib/crystal-options';
import { crystalTypeMapping } from '@/lib/crystal-options';
import { optionListKeys } from '@/contexts/LanguageContext';
import enTranslations from '@/locales/en.json';
import zhTranslations from '@/locales/zh.json';
import type { GlobalDesignParams } from '@/components/GlobalDesignParameterChat';

type Language = 'en' | 'zh';

const translations = {
  en: enTranslations,
  zh: zhTranslations,
};

// A local, language-aware 't' function
const t = (lang: Language, key: string, options?: { defaultValue?: string }): string => {
    const langTranslations = translations[lang];
    const keys = key.split('.');
    let result: any = langTranslations;
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            // Fallback to English if not found in the target language
            if (lang !== 'en') {
                let enResult: any = translations.en;
                for (const enK of keys) {
                    enResult = enResult?.[enK];
                    if (enResult === undefined) return options?.defaultValue ?? key;
                }
                return String(enResult) || options?.defaultValue || key;
            }
            return options?.defaultValue ?? key;
        }
    }
    return String(result);
};

function capitalize(s: string) {
  if (typeof s !== 'string' || !s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const getCrystalDisplayName = (lang: Language, crystalKey: string): string => {
    const crystalData = (crystalTypeMapping as CrystalTypeMapping)[crystalKey];
    if (!crystalData) return crystalKey;

    if (lang === 'zh' && crystalData.displayName) {
        const zhNamePart = crystalData.displayName.split(' (')[0];
        if (/[\u4e00-\u9fa5]/.test(zhNamePart)) {
            return zhNamePart;
        }
    }
    return crystalData.englishName;
};

const getLabel = (lang: Language, group: keyof typeof optionListKeys | string, value: string | undefined): string => {
    if (!value) return '';
    
    const keyToTranslate = group === 'crystalColorNames'
        ? value.toLowerCase().replace(/[^a-z0-9]/g, '')
        : value;

    let path = `options.${group}.${keyToTranslate}`;
     if (group === 'universalInclusions') {
        path = `options.crystalProperties.${keyToTranslate}`;
    }
    
    let translatedLabel = t(lang, path);

    // If translation fails, create a sensible default
    if (translatedLabel === path) {
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return translatedLabel;
};

// 简单的中文到英文翻译映射
const accessoryTranslations: Record<string, string> = {
  // 基础配饰
  '小珍珠': 'small pearls',
  '珍珠': 'pearls',
  '银珠': 'silver beads',
  '金珠': 'gold beads',
  '小银珠': 'small silver beads',
  '小金珠': 'small gold beads',
  '银链': 'silver chain',
  '金链': 'gold chain',
  '细链': 'fine chain',
  '粗链': 'thick chain',
  '银饰': 'silver accessories',
  '金饰': 'gold accessories',
  '吊坠': 'pendant',
  '挂件': 'charm',
  '配饰': 'accessories',
  '装饰': 'decoration',
  '银色配饰': 'silver accessories',
  '金色配饰': 'gold accessories',
  '哑光银珠': 'matte silver beads',
  '抛光银珠': 'polished silver beads',
  
  // 形状和几何
  '几何形状': 'geometric shapes',
  '圆环': 'rings',
  '方形': 'square shapes',
  '三角形': 'triangular shapes',
  '椭圆形': 'oval shapes',
  '圆形': 'round shapes',
  '长方形': 'rectangular shapes',
  '菱形': 'diamond shapes',
  '心形': 'heart shapes',
  '星形': 'star shapes',
  
  // 材质和连接
  '弹性绳': 'elastic string',
  '弹性线': 'elastic cord',
  '银丝': 'silver wire',
  '金丝': 'gold wire',
  '丝线': 'silk thread',
  '皮绳': 'leather cord',
  '编织绳': 'braided cord',
  '尼龙线': 'nylon thread',
  
  // 质感和处理
  '哑光': 'matte',
  '抛光': 'polished',
  '拉丝': 'brushed',
  '光面': 'glossy',
  '磨砂': 'frosted',
  '镜面': 'mirror finish',
  '做旧': 'antique finish',
  '复古': 'vintage',
  
  // 金属类型
  '925银': '925 silver',
  '纯银': 'sterling silver',
  '白金': 'platinum',
  '黄金': 'gold',
  '玫瑰金': 'rose gold',
  '白色金属': 'white metal',
  '金属': 'metal',
  '合金': 'alloy',
  
  // 尺寸描述
  '小': 'small',
  '大': 'large',
  '中等': 'medium',
  '微小': 'tiny',
  '精致': 'delicate',
  '细': 'fine',
  '粗': 'thick',
  '薄': 'thin',
  
  // 常见装饰
  '间隔珠': 'spacer beads',
  '隔珠': 'spacer beads',
  '装饰珠': 'decorative beads',
  '金属珠': 'metal beads',
  '水晶珠': 'crystal beads',
  '玻璃珠': 'glass beads',
  '木珠': 'wooden beads',
  '石珠': 'stone beads',
  '陶瓷珠': 'ceramic beads',
  
  // 连接件
  '扣子': 'clasp',
  '磁扣': 'magnetic clasp',
  '龙虾扣': 'lobster clasp',
  '弹簧扣': 'spring clasp',
  '搭扣': 'toggle clasp',
  '连接环': 'jump rings',
  '开口环': 'split rings',
  
  // 特殊效果
  '闪亮': 'sparkling',
  '闪光': 'glittering',
  '光泽': 'lustrous',
  '透明': 'transparent',
  '半透明': 'translucent',
  '不透明': 'opaque',
  '彩虹': 'rainbow',
  '渐变': 'gradient',
  
  // 排列方式
  '对称': 'symmetrical',
  '不对称': 'asymmetrical',
  '规则': 'regular',
  '不规则': 'irregular',
  '交替': 'alternating',
  '重复': 'repeating',
  '随机': 'random'
};

// 翻译配饰文本的函数
const translateAccessories = (accessories: string, targetLang: Language): string => {
  if (!accessories || targetLang === 'zh') return accessories;
  
  // 如果目标语言是英文，尝试翻译中文配饰
  let translated = accessories;
  
  // 检查是否包含中文字符
  const hasChinese = /[\u4e00-\u9fa5]/.test(accessories);
  
  if (hasChinese) {
    // 尝试翻译常见的配饰词汇
    Object.entries(accessoryTranslations).forEach(([chinese, english]) => {
      translated = translated.replace(new RegExp(chinese, 'g'), english);
    });
    
    // 如果仍然包含中文字符，添加一个通用的英文描述
    if (/[\u4e00-\u9fa5]/.test(translated)) {
      translated = `decorative elements (${accessories})`;
    }
  }
  
  return translated;
};

const buildDrawingPromptForLanguage = (lang: Language, data: DesignStateInput): string => {
    // Part 1: Intelligently construct the subject phrase
    const designStyle = getLabel(lang, 'overallDesignStyles', data.overallDesignStyle);
    const designCategory = getLabel(lang, 'designCategories', data.designCategory);

    let structure = '';
    const categoryKey = data.designCategory;
    if (categoryKey && data.compositionalAesthetics?.overallStructure) {
        const structureOptionsKey = `structureOptions${capitalize(categoryKey)}` as string;
        structure = getLabel(lang, structureOptionsKey, data.compositionalAesthetics.overallStructure);
    }
    
    let subject;
    const structureAndCategoryParts = [structure];
    
    // De-duplicate category from structure. 
    // e.g., if structure is "Single Strand Bracelet", don't add "Bracelet" again.
    if (!structure || (designCategory && !structure.toLowerCase().includes(designCategory.toLowerCase()))) {
        structureAndCategoryParts.push(designCategory);
    }
    const structureAndCategory = structureAndCategoryParts.filter(Boolean).join(' ');

    const subjectParts = [designStyle, structureAndCategory];
    
    if (lang === 'zh') {
        // Creates phrases like "部落风的单圈手链"
        subject = subjectParts.filter(Boolean).join('的');
    } else {
        // Creates phrases like "Tribal single strand bracelet"
        subject = subjectParts.filter(Boolean).join(' ');
    }

    // Part 2: Build the main clause using the subject
    const styleKey = (data.imageStyle || 'style_photo_realistic').replace('style_', '');
    const imageStyleName = t(lang, `options.imageStyles.style_${styleKey}`);
    const mainClause = t(lang, `promptBuilder.main_clause.${styleKey}`, { defaultValue: t(lang, 'promptBuilder.main_clause.default')})
        .replace('{{subject}}', subject)
        .replace('{{image_style_name}}', imageStyleName);


    // Part 3: Gather all the descriptive details
    const detailParts: string[] = [];

    const mainStonesDescriptions = data.mainStones
        ?.map(stone => {
            if (!stone.crystalType) return null;
            
            const shape = getLabel(lang, 'mainStoneShapes', stone.shape);
            const crystal = getCrystalDisplayName(lang, stone.crystalType);
            
            let description = [shape, crystal].filter(Boolean).join(' ');

            const details: string[] = [];
            if (stone.color) {
                const translatedColor = getLabel(lang, 'crystalColorNames', stone.color);
                if (translatedColor && translatedColor.toLowerCase() !== stone.color.toLowerCase()) {
                    details.push(translatedColor);
                }
            }
            if (stone.inclusions && stone.inclusions.length > 0) {
                const inclusionsText = stone.inclusions
                    .map(inc => getLabel(lang, 'universalInclusions', inc))
                    .filter(Boolean)
                    .join(', ');
                if (inclusionsText) details.push(`inclusions: ${inclusionsText}`);
            }

            if (details.length > 0) {
                description += ` (${details.join(', ')})`;
            }
            
            return description;
        })
        .filter(Boolean)
        .join(` ${t(lang, 'promptBuilder.and')} `);

    if (mainStonesDescriptions) {
        detailParts.push(
            t(lang, 'promptBuilder.details.featuring')
                .replace('{{stones}}', mainStonesDescriptions)
        );
    }
    
    if (data.accessories && data.accessories.trim()) {
        // 翻译配饰文本
        const translatedAccessories = translateAccessories(data.accessories.trim(), lang);
        detailParts.push(
            t(lang, 'promptBuilder.details.withAccessories')
                .replace('{{accessories}}', translatedAccessories)
        );
    }
    
    const compositionStyle = getLabel(lang, 'arrangementStyles', data.compositionalAesthetics?.style);
    if(compositionStyle) {
        detailParts.push(
            t(lang, 'promptBuilder.details.arrangement')
            .replace('{{style}}', compositionStyle)
        )
    }

    // Part 4: Define the negative prompt
    const allCategoryKeys = ['bracelet', 'necklace', 'ring', 'earrings'];
    let negativePromptPart = '';
    const currentCategoryKey = data.designCategory;

    if (currentCategoryKey && allCategoryKeys.includes(currentCategoryKey)) {
        const exclusions = allCategoryKeys
            .filter(key => key !== currentCategoryKey)
            .map(key => getLabel(lang, 'designCategories', key));
        
        const exclusionString = exclusions.join(t(lang, 'promptBuilder.negativePrompt.separator'));
        
        negativePromptPart = t(lang, 'promptBuilder.negativePrompt.template')
            .replace('{{category}}', designCategory)
            .replace('{{exclusions}}', exclusionString);
    }

    // Part 5: Get the technical suffix based on image style
    const suffix = t(lang, `promptBuilder.params.${styleKey}`, {defaultValue: t(lang, 'promptBuilder.params.photo_realistic')});

    // Final Assembly: Join all parts with commas
    const finalPrompt = [
        mainClause,
        ...detailParts,
        negativePromptPart,
        suffix
    ].filter(Boolean).join(', ');
    
    // Clean up any double commas or extra whitespace
    return finalPrompt.replace(/, ,/g, ',').replace(/\s+/g, ' ').trim();
};

export const buildDrawingPrompts = (data: DesignStateInput): { en: string; zh: string } => {
    return {
        en: buildDrawingPromptForLanguage('en', data),
        zh: buildDrawingPromptForLanguage('zh', data)
    };
};

export function getGlobalDesignParams(): GlobalDesignParams | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('globalDesignParams');
    if (raw) return JSON.parse(raw) as GlobalDesignParams;
  }
  return null;
}

// 在生成prompt时自动带入全局参数
export function buildDesignPrompt(userInput: string, extraParams?: Partial<GlobalDesignParams>) {
  const globalParams = getGlobalDesignParams() || {};
  // 合并参数，优先extraParams
  const params: GlobalDesignParams = { ...globalParams, ...extraParams } as GlobalDesignParams;
  // 生成prompt字符串（示例，实际可根据业务调整）
  return `设计需求：${userInput}\n平台：${params.applicationPlatform || ''}\n比例：${params.aspectRatio || ''}\n类别：${params.designCategory || ''}\n风格：${params.overallDesignStyle || ''}\n用途：${params.userIntent || ''}`;
}

