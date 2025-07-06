import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          await cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          await cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      title,
      description,
      mainStone,
      auxiliaryStones,
      style,
      occasion,
      preferences,
      imageUrl,
      aiAnalysis,
      isPublic = false // 默认不公开
    } = body;

    const finalUserId = session.user.id;

    // 保存设计到数据库
    const { data, error } = await supabase
      .from('design_works')
      .insert([
        {
          user_id: finalUserId,
          title,
          description: JSON.stringify(description),
          main_stone: mainStone,
          auxiliary_stones: JSON.stringify(auxiliaryStones),
          style,
          occasion,
          preferences: JSON.stringify(preferences),
          image_url: imageUrl,
          ai_analysis: aiAnalysis,
          is_public: isPublic // 添加is_public字段
        }
      ])
      .select();

    if (error) {
      console.error('保存设计作品失败:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('处理请求时出错:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 