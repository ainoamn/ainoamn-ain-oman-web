// src/components/LanguageSwitcher.tsx
import { useRouter } from 'next/router';
function LanguageSwitcher() {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  const changeLanguage = (newLocale: string) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('ar')}
        className={`px-3 py-1 rounded ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        العربية
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
    </div>
  );
}