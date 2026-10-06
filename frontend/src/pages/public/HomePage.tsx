import { useMemo } from 'react'
import { AtmosphereSection } from '@/components/home/AtmosphereSection'
import { CTASection } from '@/components/home/CTASection'
import { FeaturedMenu } from '@/components/home/FeaturedMenu'
import { GalleryPreview } from '@/components/home/GalleryPreview'
import { Hero } from '@/components/home/Hero'
import { LocationSection } from '@/components/home/LocationSection'
import { PopularStack } from '@/components/home/PopularStack'
import { RestaurantStory } from '@/components/home/RestaurantStory'
import { SpecialSection } from '@/components/home/SpecialSection'
import { WhyTasty } from '@/components/home/WhyTasty'
import { Seo } from '@/components/Seo'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { restaurantJsonLd } from '@/utils/structuredData'

export default function HomePage() {
  const { t, locale } = useI18n()
  const { settings } = useSettings()
  const jsonLd = useMemo(() => (settings ? restaurantJsonLd(settings, locale) : undefined), [settings, locale])

  return (
    <>
      <Seo title={t.meta.home.title} description={t.meta.home.description} jsonLd={jsonLd} />
      <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
        <Hero />
        <FeaturedMenu />
        <PopularStack />
        <RestaurantStory />
        <WhyTasty />
        <GalleryPreview />
        <AtmosphereSection />
        <SpecialSection />
        <CTASection />
        <LocationSection />
      </div>
    </>
  )
}
