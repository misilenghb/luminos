"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, UserPlus, LogIn, Loader2, Menu, Sparkles } from 'lucide-react'; 
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

const Header = () => {
  const { t } = useLanguage();
  const { isAuthenticated, logout, isAuthLoading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const navLinks = [
    { href: "/", label: t('header.home') },
    { href: "/daily-focus", label: t('header.dailyFocus') },
    { href: "/energy-exploration", label: t('header.energyExploration') },
    { href: "/simple-design", label: t('header.simpleDesign') },
    { href: "/creative-workshop", label: t('header.creativeWorkshop') },
  ];

  const handleLogout = () => {
    logout();
    setIsSheetOpen(false); // Close sheet on logout
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold gradient-text">
          {t('header.title')}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 md:gap-2">
          {navLinks.map(link => (
            <Button key={link.href} variant="ghost" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}

          <div className="h-6 border-l border-border mx-2"></div>
          {isAuthLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isAuthenticated ? (
             <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('header.logout')}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4"/>{t('header.login')}</Link>
              </Button>
              <Button size="sm" asChild>
                 <Link href="/register"><UserPlus className="mr-2 h-4 w-4" />{t('header.register')}</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" asChild title={t('header.settings')}>
            <Link href="/settings" aria-label={t('header.settings')}><Settings className="h-5 w-5" /></Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] p-4 flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>{t('header.mobileMenuTitle')}</SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <nav className="flex flex-col gap-2">
                {navLinks.map(link => (
                  <SheetClose key={link.href} asChild>
                    <Link href={link.href} className="text-lg py-2 hover:bg-accent rounded-md px-2 -mx-2 flex items-center">
                      {link.href === '/daily-focus' && <Sparkles className="mr-2 h-5 w-5" />}
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              
              <div className="mt-auto pt-4 border-t space-y-2">
                {isAuthLoading ? (
                  <div className="flex justify-center p-2"><Loader2 className="h-5 w-5 animate-spin" /></div>
                ) : isAuthenticated ? (
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('header.logout')}
                  </Button>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/login"><LogIn className="mr-2 h-4 w-4"/>{t('header.login')}</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full justify-start">
                        <Link href="/register"><UserPlus className="mr-2 h-4 w-4" />{t('header.register')}</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
                <SheetClose asChild>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" />{t('header.settings')}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
