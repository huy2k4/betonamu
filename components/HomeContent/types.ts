import { TaiLieuCardProps } from '@/components/TaiLieuCard/TaiLieuCard';
import { BannerSlide } from '@/components/HeroBannerCarousel/HeroBannerCarousel';

export type HomeTabId = 'explore' | 'vocab' | 'plan';

export interface HomeTabConfig {
  id: HomeTabId;
  label: string;
  emoji: string;
  badge?: string;
  color: string;
}

export interface HomeContentTabsProps {
  initialTab?: HomeTabId;
  featuredDocs: TaiLieuCardProps[];
  heroBanners: BannerSlide[];
}
