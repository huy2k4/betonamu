'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { HomeTabId, HomeContentTabsProps } from './types';
import ExploreTab from './tabs/ExploreTab';
import VocabTab from './tabs/VocabTab';
import RoadmapTab from './tabs/RoadmapTab';
import styles from './HomeContent.module.css';

export default function HomeContentTabs({
  initialTab = 'explore',
  featuredDocs,
  heroBanners,
}: HomeContentTabsProps) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as HomeTabId | null;
  const intentFromUrl = searchParams.get('intent') as HomeTabId | null;
  const urlTab = tabFromUrl || intentFromUrl;

  const [localTab, setLocalTab] = useState<HomeTabId | null>(null);

  const activeTab: HomeTabId =
    localTab ||
    (urlTab && ['explore', 'vocab', 'plan'].includes(urlTab)
      ? (urlTab as HomeTabId)
      : initialTab);

  // Listen for custom event from LeftSidebar when clicked on homepage
  useEffect(() => {
    const handleCustomTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: HomeTabId }>;
      if (customEvent.detail?.tabId && ['explore', 'vocab', 'plan'].includes(customEvent.detail.tabId)) {
        setLocalTab(customEvent.detail.tabId);
      }
    };

    window.addEventListener('betonamu:switch-home-tab', handleCustomTabSwitch);
    return () => {
      window.removeEventListener('betonamu:switch-home-tab', handleCustomTabSwitch);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* NỘI DUNG MAINCONTENT — ĐIỀU HƯỚNG BẰNG FOLDER TAB TỪ LEFTSIDEBAR */}
      <div key={activeTab} className={styles.tabContentFade}>
        {activeTab === 'explore' && (
          <ExploreTab featuredDocs={featuredDocs} heroBanners={heroBanners} />
        )}

        {activeTab === 'vocab' && <VocabTab />}

        {activeTab === 'plan' && <RoadmapTab />}
      </div>
    </div>
  );
}
