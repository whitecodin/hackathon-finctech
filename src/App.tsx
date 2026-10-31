/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavPath } from './types.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { OverviewView } from './views/OverviewView.tsx';
import { CreditReadinessView } from './views/CreditReadinessView.tsx';
import { FinancialPassportView } from './views/FinancialPassportView.tsx';
import { TransactionSafetyView } from './views/TransactionSafetyView.tsx';
import { BusinessResilienceView } from './views/BusinessResilienceView.tsx';
import { AIFinancialCoachView } from './views/AIFinancialCoachView.tsx';
import { OnboardingGatewayView } from './views/OnboardingGatewayView.tsx';
import { ConsentPrivacyView } from './views/ConsentPrivacyView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { AuthView } from './views/AuthView.tsx';
import { UnderwriterVerificationView } from './views/UnderwriterVerificationView.tsx';
import { PassportQRCodeModal } from './components/PassportQRCodeModal.tsx';
import { GeminiLiveVoiceModal } from './components/GeminiLiveVoiceModal.tsx';
import { downloadPassportPdf, downloadExcelCsv, downloadJsonAudit } from './lib/exportUtils.ts';

function MainLayout() {
  const { merchant, updateMerchantLocally } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [currentPath, setCurrentPath] = useState<NavPath>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/passport/verify')) {
      return 'underwriter-verification';
    }
    return 'auth'; // Default to sign-in page on initial load / publication
  });
  const [initialCoachQuery, setInitialCoachQuery] = useState<string | undefined>(undefined);
  const [downloadModal, setDownloadModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);

  const handleNavigate = (path: NavPath, initialQuery?: string) => {
    setCurrentPath(path);
    if (initialQuery) {
      setInitialCoachQuery(initialQuery);
    } else {
      setInitialCoachQuery(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerDownload = () => {
    setDownloadModal(true);
  };

  const executeDownload = (format: 'pdf' | 'json' | 'csv') => {
    setDownloadModal(false);
    if (format === 'json') {
      downloadJsonAudit(merchant);
    } else if (format === 'csv') {
      downloadExcelCsv(merchant);
    } else {
      downloadPassportPdf(merchant);
    }
  };

  return (
    <div className={`min-h-screen ${currentPath === 'auth' ? 'bg-[#071122]' : 'bg-[#f7f9f6]'} text-[#131b2e] flex flex-col font-sans selection:bg-[#85f8c4] selection:text-[#002114]`}>
      {/* When in Auth, Underwriter Verification, or Onboarding, show focused screen without normal sidebar if requested */}
      {currentPath === 'auth' ? (
        <AuthView onNavigate={handleNavigate} />
      ) : currentPath === 'underwriter-verification' ? (
        <div className="min-h-screen">
          <UnderwriterVerificationView
            passportUid={merchant?.passportUid || 'VY-IND-2026-004821'}
            onNavigate={handleNavigate}
            merchant={merchant}
          />
        </div>
      ) : (
        <div className="flex flex-1">
          {/* 2. Fixed Left Navigation Sidebar */}
          <Sidebar
            currentPath={currentPath}
            onNavigate={handleNavigate}
            merchant={merchant}
            flaggedCount={2}
          />

          {/* 3. Main Content Container (Pushed right by sidebar width 260px) */}
          <div className="flex-1 ml-[260px] flex flex-col min-w-0">
            {/* Top Header Bar with Breadcrumbs & Language Switcher */}
            <Header
              currentPath={currentPath}
              onNavigate={handleNavigate}
              language={language}
              onLanguageChange={setLanguage}
              merchant={merchant}
              onOpenLiveVoice={() => setShowVoiceModal(true)}
            />

            {/* View Viewport */}
            <main className="flex-1 p-6 md:p-8 pt-24 max-w-[1400px] w-full mx-auto">
              {currentPath === 'overview' && (
                <OverviewView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                  onTriggerDownload={handleTriggerDownload}
                />
              )}

              {currentPath === 'financial-passport' && (
                <FinancialPassportView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                  onTriggerDownload={handleTriggerDownload}
                />
              )}

              {currentPath === 'credit-readiness' && (
                <CreditReadinessView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                  onTriggerDownload={handleTriggerDownload}
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
                  onTriggerDownload={handleTriggerDownload}
                />
              )}

              {currentPath === 'ai-financial-coach' && (
                <AIFinancialCoachView
                  merchant={merchant}
                  onNavigate={handleNavigate}
                  language={language}
                  onLanguageChange={setLanguage}
                  initialQuery={initialCoachQuery}
                />
              )}

              {currentPath === 'consent-privacy' && (
                <ConsentPrivacyView
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
            </main>
          </div>
        </div>
      )}

      {/* Dynamic QR Code & Underwriter Verification Modal */}
      <PassportQRCodeModal
        isOpen={downloadModal}
        onClose={() => setDownloadModal(false)}
        merchant={merchant}
        onExecuteDownload={executeDownload}
        onOpenVerificationPortal={() => handleNavigate('underwriter-verification')}
      />

      {/* Global Gemini Live Conversational Voice Experience Modal */}
      <GeminiLiveVoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        merchant={merchant}
        language={language}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
