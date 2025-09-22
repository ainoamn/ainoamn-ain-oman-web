import { useI18n } from "@/lib/i18n";
function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => setLang("ar")}
        className={"px-2 py-1 rounded " + (lang === "ar" ? "bg-black text-white" : "bg-neutral-100")}
      >
        العربية
      </button>
      <button
        onClick={() => setLang("en")}
        className={"px-2 py-1 rounded " + (lang === "en" ? "bg-black text-white" : "bg-neutral-100")}
      >
        English
      </button>
    </div>
  );
}
