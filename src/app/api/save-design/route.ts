import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      userEmail,
      title,
      description,
      prompt,
      imageUrl,
      thumbnailUrl,
      style,
      category,
      crystalsUsed,
      colors,
      tags,
      generationParams,
      aiAnalysis
    } = body;

    // 验证必需字段
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: '用户ID或邮箱是必需的' },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: '图片URL是必需的' },
        { status: 400 }
      );
    }

    // 如果只有邮箱，先获取用户档案
    let finalUserId = userId;
    let profileId = null;

    if (!userId && userEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('email', userEmail)
        .single();
      
      if (profile) {
        finalUserId = profile.user_id || profile.id;
        profileId = profile.id;
      }
    }

    if (!finalUserId) {
      return NextResponse.json(
        { error: '无法找到有效的用户ID' },
        { status: 400 }
      );
    }

    // 获取profile_id（如果还没有的话）
    if (!profileId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', finalUserId)
        .single();
      
      if (profile) {
        profileId = profile.id;
      }
    }

    // 准备要保存的数据
    const designData = {
      user_id: finalUserId,
      profile_id: profileId,
      title: title || '简易设计作品',
      description,
      prompt,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      style: style || 'simple',
      category: category || 'jewelry',
      crystals_used: crystalsUsed || [],
      colors: colors || [],
      tags: tags || [],
      is_favorite: false,
      is_public: false,
      view_count: 0,
      like_count: 0,
      share_count: 0,
      generation_params: generationParams || {},
      ai_analysis: aiAnalysis || {}
    };

    // 保存到数据库
    const { data, error } = await supabase
      .from('design_works')
      .insert(designData)
      .select()
      .single();

    if (error) {
      console.error('保存设计作品失败:', error);
      return NextResponse.json(
        { error: '保存设计作品失败', details: error.message },
        { status: 500 }
      );
    }

    // 返回成功结果
    return NextResponse.json({
      success: true,
      message: '设计作品已成功保存',
      design: data
    });

  } catch (error) {
    console.error('保存设计作品API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 