import BlogArticle from "../components/BlogArticle";

export const metadata = {
  title: "Akademi Buluşmaları Devam Ediyor | IEEE TEDU",
};

export default function Page() {
  return (
    <BlogArticle
      date="24 Eki 2026"
      title="Akademi Buluşmaları Devam Ediyor"
      paragraphs={[
        "IEEE TEDU Öğrenci Topluluğu olarak gerçekleştirdiğimiz bu etkinlikte teknoloji dünyasını şekillendiren en önemli dinamikleri masaya yatırdık. Öğrencilerimiz, sektör profesyonelleri ile bir araya gelerek vizyonlarını genişletme fırsatı buldu.",
        "Mühendislik ve inovasyon ekosistemine doğrudan katkı sağlayan Fikirler & Projeler serisi, sadece teorik bilginin değil pratiğe dönüşen becerilerin önemini vurgulamaktadır. Geleceğin mimarları olarak sorumluluğumuzun farkındayız.",
        "Alanında lider eğitmenler eşliğinde yürüttüğümüz atölyeler ve soru-cevap seanslarıyla tüm üyelerimizin yeni bir projeye adım atmasına olanak sağladık. Geliştirdiğimiz çözümler gelecekte daha büyük bir ekosistemin parçası olacak."
      ]}
    />
  );
}
