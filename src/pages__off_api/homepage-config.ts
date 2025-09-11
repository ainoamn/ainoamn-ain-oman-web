// src/pages/api/homepage-config.ts
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // في المستقبل سيتم جلب هذه البيانات من قاعدة بيانات
  const homepageConfig = {
    showSearch: true,
    showTopBanner: true,
    showFeatured: true,
    showMiddleBanner: true,
    showTopRated: true,
    showCompanies: true,
    showLandlords: true,
    showPartners: true,
    showBadges: true,
    showMap: true,
    showStats: true,
    showSideAds: true
  };

  res.status(200).json(homepageConfig);
}
