/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { NavPath } from './types.ts';
import { ThemeProvider } from './context/ThemeContext.tsx';
import {useDemo} from './demo/DemoContext.tsx';
const DemoShowcase=lazy(()=>import('./demo/DemoShowcase.tsx').then(m=>({default:m.DemoShowcase})));
import {DEMO_MERCHANT} from './demo/previewMerchant.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import {ShopProvider} from './context/ShopContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { BottomNavigation } from './components/BottomNavigation.tsx';
import { Header } from './components/Header.tsx';
import { SimpleHome } from './views/SimpleHome.tsx';
const AutoHisaabView=lazy(()=>import('./views/AutoHisaabView.tsx').then(m=>({default:m.AutoHisaabView})));
const DailyCompanionView=lazy(()=>import('./views/DailyCompanionView.tsx').then(m=>({default:m.DailyCompanionView})));
const ReconciliationView=lazy(()=>import('./views/ReconciliationView.tsx').then(m=>({default:m.ReconciliationView})));
const DemandForecastView=lazy(()=>import('./views/DemandForecastView.tsx').then(m=>({default:m.DemandForecastView})));
const MohallaPowerView=lazy(()=>import('./views/MohallaPowerView.tsx').then(m=>({default:m.MohallaPowerView})));
const AuditLogView=lazy(()=>import('./views/RecordsAndPrivacyView.tsx').then(m=>({default:m.AuditLogView})));
const DataControlsView=lazy(()=>import('./views/RecordsAndPrivacyView.tsx').then(m=>({default:m.DataControlsView})));

const MerchantLeagueView = lazy(() => import('./views/MerchantLeagueView.tsx').then(m => ({default:m.MerchantLeagueView})));
const CreditReadinessView = lazy(() => import('./views/CreditReadinessView.tsx').then(m => ({default:m.CreditReadinessView})));
const FinancialPassportView = lazy(() => import('./views/FinancialPassportView.tsx').then(m => ({default:m.FinancialPassportView})));
const TransactionSafetyView = lazy(() => import('./views/TransactionSafetyView.tsx').then(m => ({default:m.TransactionSafetyView})));
const BusinessResilienceView = lazy(() => import('./views/BusinessResilienceView.tsx').then(m => ({default:m.BusinessResilienceView})));
const AIFinancialCoachView = lazy(() => import('./views/AIFinancialCoachView.tsx').then(m => ({default:m.AIFinancialCoachView})));
const OnboardingGatewayView = lazy(() => import('./views/OnboardingGatewayView.tsx').then(m => ({default:m.OnboardingGatewayView})));
const SettingsView = lazy(() => import('./views/SettingsView.tsx').then(m => ({default:m.SettingsView})));
import { AuthView } from './views/AuthView.tsx';
const UnderwriterVerificationView = lazy(() => import('./views/UnderwriterVerificationView.tsx').then(m => ({default:m.UnderwriterVerificationView})));

function MainLayout() {
  const { merchant, user, updateMerchantLocally } = useAuth();
  const {demoEnabled,enterDemo} = useDemo();
  const [menuOpen,setMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [currentPath, setCurrentPath] = useState<NavPath>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/passport/verify')) {
      return 'underwriter-verification';
    }
    return 'auth'; // Default to sign-in page on initial load / publication
  });
  useEffect(()=>{if((user||demoEnabled) && currentPath==='auth')setCurrentPath('overview')},[user,demoEnabled,currentPath]);
  useEffect(()=>{
    if(new URLSearchParams(window.location.search).get('demo')==='1'){
      const view=new URLSearchParams(window.location.search).get('view');
      enterDemo();
      setCurrentPath(view&&['merchant-league','auto-hisaab','daily-hisaab','udhar','stock','regulars','reconciliation','forecast','mohalla-power','audit-history','data-controls','ai-financial-coach'].includes(view)?view as NavPath:'overview');
      const url=new URL(window.location.href);url.searchParams.delete('demo');
      window.history.replaceState(null,'',url.pathname+url.search+url.hash);
    }
  },[enterDemo]);
  const [initialCoachQuery, setInitialCoachQuery] = useState<string | undefined>(undefined);

  const handleNavigate = (path: NavPath, initialQuery?: string) => {
    setCurrentPath(path);
    if (initialQuery) {
      setInitialCoachQuery(initialQuery);
    } else {
      setInitialCoachQuery(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans">
      {/* When in Auth, Underwriter Verification, or Onboarding, show focused screen without normal sidebar if requested */}
      <Suspense fallback={<div className="p-8 text-center" role="status">Opening…</div>}>
      {currentPath === 'auth' && !demoEnabled ? (
        <AuthView onNavigate={handleNavigate} />
      ) : currentPath === 'underwriter-verification' ? (
        <div className="min-h-screen">
          <UnderwriterVerificationView
            passportUid={merchant?.passportUid || 'VY-IND-2026-004821'}
            onNavigate={handleNavigate}
            merchant={merchant}
          />
        </div>
      ) : !user && !demoEnabled ? (
        <AuthView onNavigate={handleNavigate} />
      ) : (
        <div className="dashboard-layout flex flex-1">
          {/* 2. Fixed Left Navigation Sidebar */}
          {menuOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={()=>setMenuOpen(false)} />}
          <div className={menuOpen?'sidebar-container menu-open':'sidebar-container'}>
          <Sidebar onClose={()=>setMenuOpen(false)}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            merchant={demoEnabled ? DEMO_MERCHANT as typeof merchant : merchant}
            flaggedCount={2}
          />
          </div>

          {/* 3. Main Content Container (Pushed right by sidebar width 260px) */}
          <div className="dashboard-content flex-1 flex flex-col min-w-0">
            {/* Top Header Bar with Breadcrumbs & Language Switcher */}
            <Header
              currentPath={currentPath}
              onNavigate={handleNavigate}
              onMenu={()=>setMenuOpen(true)}
              language={language}
              onLanguageChange={setLanguage}
              merchant={demoEnabled ? DEMO_MERCHANT as typeof merchant : merchant}
            />

            {/* View Viewport */}
            <main className="dashboard-main flex-1 w-full mx-auto">
              {(['daily-hisaab','udhar','stock','regulars'] as NavPath[]).includes(currentPath) ? <DailyCompanionView path={currentPath as 'daily-hisaab'|'udhar'|'stock'|'regulars'} onNavigate={handleNavigate}/> :
              currentPath==='auto-hisaab' ? <AutoHisaabView onNavigate={handleNavigate}/> :
              currentPath==='reconciliation' ? <ReconciliationView onNavigate={handleNavigate}/> :
              currentPath==='forecast' ? <DemandForecastView onNavigate={handleNavigate}/> :
              currentPath==='mohalla-power' ? <MohallaPowerView onNavigate={handleNavigate}/> :
              currentPath==='audit-history' ? <AuditLogView onNavigate={handleNavigate}/> :
              (currentPath==='data-controls'||currentPath==='consent-privacy') ? <DataControlsView onNavigate={handleNavigate}/> :
              currentPath==='ai-financial-coach' ? <AIFinancialCoachView merchant={demoEnabled?DEMO_MERCHANT as typeof merchant:merchant} onNavigate={handleNavigate} language={language} onLanguageChange={setLanguage} initialQuery={initialCoachQuery}/> :
              demoEnabled ? <DemoShowcase path={currentPath} onNavigate={handleNavigate} /> : <>
              {currentPath === 'merchant-league' && <MerchantLeagueView onNavigate={handleNavigate} />}
              {currentPath === 'overview' && (
                <SimpleHome
                  merchant={merchant}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPath === 'financial-passport' && (
                <FinancialPassportView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPath === 'credit-readiness' && (
                <CreditReadinessView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPath === 'transaction-safety' && (
                <TransactionSafetyView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPath === 'business-resilience' && (
                <BusinessResilienceView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPath === 'onboarding' && (
                <OnboardingGatewayView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                  onPassportCreated={() => handleNavigate('financial-passport')}
                />
              )}

              {currentPath === 'settings' && (
                <SettingsView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                  onUpdateMerchant={updateMerchantLocally}
                />
              )}
              </>}
            </main>
            <BottomNavigation currentPath={currentPath} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <ShopProvider><MainLayout /></ShopProvider>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}
