'use client';
import type React from 'react';
import Header from './Header';
// import Footer from './Footer'; // Optional: if you decide to add a footer
// import GlobalDesignParameterChat, { GlobalDesignParams } from '../GlobalDesignParameterChat';
// import { useEffect, useState } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // 已移除全局设计参数弹窗设定
  // const [showParamChat, setShowParamChat] = useState(false);
  // const [params, setParams] = useState<GlobalDesignParams | null>(null);

  // useEffect(() => {
  //   // 检查localStorage是否已有参数，否则弹出
  //   const saved = localStorage.getItem('globalDesignParams');
  //   if (!saved) setShowParamChat(true);
  //   else setParams(JSON.parse(saved));
  // }, []);

  // const handleComplete = (p: GlobalDesignParams) => {
  //   setParams(p);
  //   localStorage.setItem('globalDesignParams', JSON.stringify(p));
  // };

  return (
    <>
      <Header />
      {/* 已移除全局设计参数弹窗 */}
      {/* <GlobalDesignParameterChat open={showParamChat} onClose={() => setShowParamChat(false)} onComplete={handleComplete} /> */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default AppLayout;
