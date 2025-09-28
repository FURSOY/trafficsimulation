Bu proje, tarayıcıda çalışan 2D kuş bakışı bir trafik simülasyonu ve ona bağlı bir harita editörü geliştirmeyi amaçlamaktadır. Proje iki ana bileşenden oluşur: (1) harita editörü ve (2) trafik simülasyonu motoru.

Harita Editörü:
Kullanıcının gerçek dünya verisine bağımlı olmadan, kendi tasarladığı yollar ve trafik öğeleriyle bir harita oluşturabilmesi hedeflenir. Yol çizim modu ile tek yön, çift yön ve şerit sayısı seçilerek yol çizilebilir. Kavşak ve düğüm noktaları tanımlanabilir. Trafik ışığı, dur tabelası, U dönüşü, park alanı, otobüs durağı gibi öğeler paletten seçilip haritaya eklenebilir. Snap/izgara sistemi sayesinde öğeler otomatik hizalanır. Harita JSON gibi bir formatta kaydedilip tekrar yüklenebilir.

Trafik Simülasyonu Motoru:
Editörde oluşturulan haritayı okuyarak gerçekçi bir trafik akışını simüle eder. Harita verisini JSON’dan okur ve yol ağı grafını oluşturur. Yol ağı üzerinde otomobil, otobüs, kamyon gibi farklı araç türlerini oluşturur ve hareket ettirir. Sürücü davranışları yüzdelere göre belirlenir (örneğin %90 dikkatli, %4 aceleci, %2 agresif). Trafik ışıkları, şerit değiştirme, hız limiti gibi kurallar uygulanır. Kuralları çiğneyen sürücüler, kazalar, çekici gibi olaylar simülasyona dahil edilir. Başlangıçta saniye saniye çalışır, ileride 2x, 10x, 100x gibi hızlandırmalar eklenebilir. Görselleştirme 2D kuş bakışı ve özelleştirilmiş renk ve ikonlarla yapılır. İlk aşamada pasif izleme vardır, ileride araç sürme veya olay müdahalesi gibi aktif etkileşim eklenebilir.

Teknik Yaklaşım ve Fazlar:
Çizim ve görselleştirme HTML Canvas veya WebGL (pür JS veya React + Canvas) ile yapılabilir. Yollar, kavşaklar, trafik öğeleri ve bağlantılar için standart bir JSON formatı tasarlanır. Fazlar:
1. Editör v1: Yol çizme + kaydetme.
2. Simülasyon v1: Basit araçların çizilen yol üzerinde hareket etmesi.
3. Editör v2: Trafik ışığı, kavşak, snap eklenmesi.
4. Simülasyon v2: Araç davranış yüzdeleri, kaza/çekici gibi olaylar.
5. Gelişmiş görselleştirme ve kullanıcı etkileşimi.

Proje tek kişi tarafından hobi amaçlı yürütülecek, tarayıcıda çalışacak ve grafiklerden çok davranışın gerçekçiliği hedeflenecektir.
