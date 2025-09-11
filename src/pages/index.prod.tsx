import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <main style={{padding:"32px 16px",maxWidth:1200,margin:"0 auto"}}>
        <h1 style={{fontSize:32,marginBottom:8}}>BYF PRO</h1>
        <p>الصفحة الرئيسية تعمل الآن. سنضيف بقية الصفحات لاحقًا.</p>
      </main>
      <Footer />
    </div>
  );
}
