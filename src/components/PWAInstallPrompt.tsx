'use client';

import { useEffect, useState } from 'react';

// 极简PWA组件，完全避免水合错误
export default function PWAInstallPrompt() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 服务端渲染时返回空
  if (!isClient) {
    return null;
  }

  // 客户端渲染简单指示器，使用 suppressHydrationWarning 避免警告
  return (
    <div
      className="fixed bottom-4 right-4 z-40 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
      suppressHydrationWarning
    >
      PWA就绪
    </div>
  );
}
