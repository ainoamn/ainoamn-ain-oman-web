import type { NextApiRequest, NextApiResponse } from "next";

/** إعدادات عامة تُستخدم للثيم/الصفحة الرئيسية … لاحقًا سنربطها بقاعدة بيانات */
function handler(req: NextApiRequest, res: NextApiResponse) {
  // يمكن لاحقًا تبديل هذه القيم من لوحة التحكم وتخزينها في DB
  const config = {
    brand: {
      name: "عين عُمان",
      colors: {
        brand600: "#0d9488",
        brand700: "#0f766e",
        brand800: "#115e59",
        pageBg: "#FAF9F6"
      }
    },
    homepage: {
      featuredLimit: 6,
      heroImage: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop"
    }
  };

  res.status(200).json(config);
}
