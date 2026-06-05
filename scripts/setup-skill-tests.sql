-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.skill_tests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes int DEFAULT 15,
  passing_score int DEFAULT 70,
  questions jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skill_test_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  test_id uuid REFERENCES public.skill_tests(id),
  score int NOT NULL,
  passed boolean NOT NULL,
  answers jsonb,
  started_at timestamp DEFAULT now(),
  completed_at timestamp
);

ALTER TABLE public.skill_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tests" ON public.skill_tests FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own attempts" ON public.skill_test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.skill_test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.skill_tests TO anon, authenticated;
GRANT SELECT, INSERT ON public.skill_test_attempts TO authenticated;

INSERT INTO public.skill_tests (category, title, description, duration_minutes, passing_score, questions) VALUES
(
  'UI/UX Design',
  'Tes Dasar UI/UX Design',
  'Uji pemahaman kamu tentang prinsip desain antarmuka dan pengalaman pengguna.',
  15,
  70,
  '[
    {"id":"q1","question":"Apa kepanjangan dari UI?","options":["User Interface","Universal Interface","User Interaction","Unified Interface"],"correct":0,"explanation":"UI singkatan dari User Interface — antarmuka yang berinteraksi langsung dengan pengguna."},
    {"id":"q2","question":"Prinsip desain mana yang mengutamakan konsistensi visual?","options":["Proximity","Repetition","Alignment","Contrast"],"correct":1,"explanation":"Repetition (pengulangan) menciptakan konsistensi visual di seluruh desain."},
    {"id":"q3","question":"Apa tujuan utama wireframe dalam proses desain?","options":["Menentukan warna brand","Memetakan struktur dan layout halaman","Membuat animasi interaksi","Menulis kode frontend"],"correct":1,"explanation":"Wireframe digunakan untuk memetakan struktur dan layout sebelum desain visual dibuat."},
    {"id":"q4","question":"White space dalam desain UI berfungsi untuk?","options":["Menghemat ruang layar","Meningkatkan keterbacaan dan fokus","Menambah lebih banyak konten","Membuat desain lebih ramai"],"correct":1,"explanation":"White space meningkatkan keterbacaan dan membantu mata pengguna fokus pada konten penting."},
    {"id":"q5","question":"Apa yang dimaksud dengan user flow?","options":["Alur kode program","Jalur yang dilalui pengguna untuk menyelesaikan tugas","Animasi transisi halaman","Struktur database aplikasi"],"correct":1,"explanation":"User flow adalah jalur atau langkah-langkah yang dilalui pengguna untuk menyelesaikan suatu tujuan."},
    {"id":"q6","question":"Tool mana yang paling umum digunakan untuk prototyping UI?","options":["Photoshop","Excel","Figma","PowerPoint"],"correct":2,"explanation":"Figma adalah tool prototyping UI yang paling populer saat ini karena kolaboratif dan mudah digunakan."},
    {"id":"q7","question":"Contrast ratio minimum untuk teks agar memenuhi standar aksesibilitas WCAG AA adalah?","options":["2:1","3:1","4.5:1","7:1"],"correct":2,"explanation":"WCAG AA mensyaratkan contrast ratio minimal 4.5:1 untuk teks normal agar dapat dibaca oleh pengguna dengan gangguan penglihatan."},
    {"id":"q8","question":"Apa perbedaan UX dan UI?","options":["Tidak ada perbedaan","UX tentang pengalaman keseluruhan, UI tentang tampilan visual","UI tentang database, UX tentang server","UX khusus mobile, UI khusus desktop"],"correct":1,"explanation":"UX (User Experience) mencakup keseluruhan pengalaman pengguna, sedangkan UI (User Interface) fokus pada tampilan visual dan interaksi."},
    {"id":"q9","question":"Metode riset pengguna mana yang dilakukan dengan mengamati pengguna menggunakan produk secara langsung?","options":["Survey online","Usability testing","A/B testing","Analytics"],"correct":1,"explanation":"Usability testing melibatkan pengamatan langsung pengguna saat menggunakan produk untuk mengidentifikasi masalah."},
    {"id":"q10","question":"Apa yang dimaksud dengan responsive design?","options":["Desain yang merespons input suara","Desain yang menyesuaikan tampilan di berbagai ukuran layar","Desain dengan animasi cepat","Desain yang menggunakan AI"],"correct":1,"explanation":"Responsive design adalah pendekatan desain yang membuat tampilan website menyesuaikan diri dengan berbagai ukuran layar."}
  ]'
),
(
  'Web Development',
  'Tes Dasar Web Development',
  'Uji pengetahuan kamu tentang HTML, CSS, JavaScript, dan konsep web development.',
  15,
  70,
  '[
    {"id":"q1","question":"Tag HTML mana yang digunakan untuk membuat hyperlink?","options":["<link>","<a>","<href>","<url>"],"correct":1,"explanation":"Tag <a> (anchor) digunakan untuk membuat hyperlink di HTML."},
    {"id":"q2","question":"Apa fungsi CSS dalam web development?","options":["Mengambil data dari server","Mengatur tampilan dan styling halaman web","Mengelola database","Membuat logika program"],"correct":1,"explanation":"CSS (Cascading Style Sheets) digunakan untuk mengatur tampilan dan styling elemen HTML."},
    {"id":"q3","question":"Apa perbedaan == dan === di JavaScript?","options":["Tidak ada perbedaan","=== memeriksa nilai dan tipe data, == hanya nilai","== lebih cepat dari ===","=== hanya untuk string"],"correct":1,"explanation":"=== (strict equality) memeriksa nilai DAN tipe data, sedangkan == (loose equality) hanya memeriksa nilai setelah type coercion."},
    {"id":"q4","question":"Apa itu DOM dalam konteks web?","options":["Database Object Model","Document Object Model","Dynamic Output Method","Data Object Mapping"],"correct":1,"explanation":"DOM (Document Object Model) adalah representasi struktur HTML sebagai tree of objects yang dapat dimanipulasi dengan JavaScript."},
    {"id":"q5","question":"Metode HTTP mana yang digunakan untuk mengirim data baru ke server?","options":["GET","DELETE","POST","PUT"],"correct":2,"explanation":"POST digunakan untuk mengirim data baru ke server, sedangkan GET untuk mengambil data."},
    {"id":"q6","question":"Apa fungsi tag <meta viewport> di HTML?","options":["Menambahkan metadata SEO","Mengontrol tampilan di perangkat mobile","Menghubungkan CSS eksternal","Membuat favicon"],"correct":1,"explanation":"<meta viewport> mengontrol bagaimana halaman web ditampilkan di perangkat mobile, penting untuk responsive design."},
    {"id":"q7","question":"Apa itu API?","options":["A Programming Interface","Application Programming Interface","Advanced Protocol Integration","Automated Page Interface"],"correct":1,"explanation":"API (Application Programming Interface) adalah aturan dan protokol yang memungkinkan aplikasi berkomunikasi satu sama lain."},
    {"id":"q8","question":"CSS property mana yang digunakan untuk membuat elemen flex container?","options":["display: block","display: flex","float: left","position: flex"],"correct":1,"explanation":"display: flex mengaktifkan Flexbox layout pada sebuah container, memudahkan pengaturan tata letak elemen."},
    {"id":"q9","question":"Apa yang dilakukan console.log() di JavaScript?","options":["Menyimpan data ke database","Menampilkan output di browser console","Membuat log file di server","Mencetak halaman web"],"correct":1,"explanation":"console.log() menampilkan pesan atau nilai variabel di browser developer console, berguna untuk debugging."},
    {"id":"q10","question":"Framework JavaScript mana yang dikembangkan oleh Meta (Facebook)?","options":["Vue.js","Angular","React","Svelte"],"correct":2,"explanation":"React dikembangkan dan dikelola oleh Meta (Facebook) dan merupakan salah satu framework/library JavaScript paling populer."}
  ]'
),
(
  'Penulisan Konten',
  'Tes Dasar Content Writing',
  'Uji kemampuan menulis konten yang menarik, SEO-friendly, dan efektif.',
  15,
  70,
  '[
    {"id":"q1","question":"Apa yang dimaksud dengan SEO dalam penulisan konten?","options":["Social Engagement Optimization","Search Engine Optimization","Simple Editorial Output","Standard English Only"],"correct":1,"explanation":"SEO (Search Engine Optimization) adalah praktik mengoptimalkan konten agar mudah ditemukan di mesin pencari seperti Google."},
    {"id":"q2","question":"Struktur penulisan yang menempatkan informasi terpenting di awal disebut?","options":["Pyramid terbalik","Narasi kronologis","Deskripsi detail","Metode AIDA"],"correct":0,"explanation":"Inverted pyramid (piramida terbalik) adalah struktur jurnalistik yang meletakkan informasi paling penting di paragraf pertama."},
    {"id":"q3","question":"Apa fungsi headline/judul yang efektif?","options":["Memenuhi batas kata","Menarik perhatian dan mendorong pembaca untuk lanjut membaca","Menjelaskan semua isi artikel","Mengandung banyak kata kunci"],"correct":1,"explanation":"Headline yang efektif harus menarik perhatian pembaca dan membuat mereka ingin membaca lebih lanjut."},
    {"id":"q4","question":"Call-to-action (CTA) dalam konten marketing berfungsi untuk?","options":["Menambah panjang artikel","Mendorong pembaca melakukan tindakan tertentu","Menjelaskan produk secara teknis","Memberikan disclaimer"],"correct":1,"explanation":"CTA mendorong pembaca untuk melakukan tindakan spesifik seperti membeli, mendaftar, atau menghubungi."},
    {"id":"q5","question":"Tone of voice yang tepat untuk konten media sosial brand yang menyasar Gen Z adalah?","options":["Formal dan teknis","Kasual, autentik, dan relatable","Korporat dan profesional","Akademis dan informatif"],"correct":1,"explanation":"Gen Z lebih merespons konten yang kasual, autentik, dan terasa relatable dibanding gaya komunikasi formal."},
    {"id":"q6","question":"Berapa panjang ideal meta description untuk SEO?","options":["50-80 karakter","150-160 karakter","200-250 karakter","300+ karakter"],"correct":1,"explanation":"Meta description yang ideal adalah 150-160 karakter — cukup untuk mendeskripsikan halaman tanpa terpotong di hasil pencarian."},
    {"id":"q7","question":"Apa yang dimaksud dengan plagiarisme dalam penulisan konten?","options":["Menggunakan kata yang terlalu umum","Mengambil karya orang lain tanpa atribusi yang tepat","Menulis terlalu panjang","Menggunakan bahasa asing"],"correct":1,"explanation":"Plagiarisme adalah menggunakan karya, ide, atau kata-kata orang lain tanpa memberikan kredit atau atribusi yang sesuai."},
    {"id":"q8","question":"Apa itu evergreen content?","options":["Konten tentang alam dan lingkungan","Konten yang tetap relevan dan berguna dalam jangka panjang","Konten yang dibuat setiap hari","Konten untuk musim tertentu"],"correct":1,"explanation":"Evergreen content adalah konten yang tetap relevan dan berguna bagi pembaca dalam jangka waktu panjang, tidak terikat tren atau waktu tertentu."},
    {"id":"q9","question":"Platform apa yang paling efektif untuk konten B2B (Business to Business)?","options":["TikTok","Instagram","LinkedIn","Snapchat"],"correct":2,"explanation":"LinkedIn adalah platform paling efektif untuk konten B2B karena penggunanya adalah profesional dan pengambil keputusan bisnis."},
    {"id":"q10","question":"Apa yang harus selalu ada di setiap paragraf tulisan yang baik?","options":["Minimal 200 kata","Satu ide utama yang jelas","Minimal 3 referensi","Gambar pendukung"],"correct":1,"explanation":"Setiap paragraf yang baik harus memiliki satu ide utama yang jelas — hal ini memudahkan pembaca memahami dan mengikuti alur tulisan."}
  ]'
);
