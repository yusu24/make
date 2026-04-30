const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="id"><head>
... (omitting head for brevity since we only need the body) ...
<body class="bg-background text-on-surface font-body-md">
<!-- Top Navigation Bar -->
<nav class="bg-white/90 backdrop-blur-md dark:bg-gray-950/90 font-['Plus_Jakarta_Sans'] text-sm font-medium docked full-width top-0 z-50 sticky border-b border-gray-100 dark:border-gray-800 shadow-sm">
<div class="flex justify-between items-center h-20 px-6 md:px-12 w-full max-w-screen-2xl mx-auto">
<div class="text-2xl font-black tracking-tight text-orange-600 dark:text-orange-500">GourmetSME</div>
<div class="hidden md:flex items-center space-x-8">
<a class="text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 pb-1" href="#">Home</a>
<a class="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors" href="#">Menu</a>
<a class="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors" href="#">About</a>
<a class="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors" href="#">Dashboard</a>
</div>
<div class="flex items-center space-x-4">
<button class="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all active:scale-95 duration-200">
<span class="material-symbols-outlined text-on-surface-variant">shopping_cart</span>
</button>
<button class="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all active:scale-95 duration-200">
<span class="material-symbols-outlined text-on-surface-variant">account_circle</span>
</button>
</div>
</div>
</nav>
<main>
<!-- Hero Section -->
<section class="relative h-[870px] flex items-center overflow-hidden">
<div class="absolute inset-0 z-0">
<img class="w-full h-full object-cover" data-alt="top-down shot of various gourmet dishes on a rustic wooden table with natural soft lighting and warm textures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyjZlhWZyxL_6dWYsByt_yisg1IxXql_DDLLSLk5GEgDI9EkNDVERyCFK2X_16g_EK3tQEs-HIKcxkcyLnX84fjMSyEljsT21HlGJP2eIYMBsaxkjWoCG7ZwJdK8h9AcrJSUIbvZzxZQSgRwgMRxsk5iQz3jU5M9wJkCd1UUlycRjDgTtv4QodLgbHqslxk-K5XKSjPKhGSVUkM_UF2A-Mu6AGfgIfpuJhz1nqNnjZYHSC3E8Ee8G_9QAq6DI8ggyMZuzsO6zJUD8"/>
<div class="absolute inset-0 bg-gradient-to-r from-on-background/80 to-transparent"></div>
</div>
<div class="relative z-10 w-full max-w-screen-2xl mx-auto px-6 md:px-12">
<div class="max-w-2xl text-white">
<span class="inline-block py-1 px-3 bg-primary-container text-white text-label-md font-label-md rounded-full mb-6">
                        Authentic Culinary Experiences
                    </span>
<h1 class="font-display-lg text-display-lg mb-6 leading-tight">Cita Rasa Bintang Lima, Harga UMKM</h1>
<p class="font-body-lg text-body-lg mb-10 text-gray-200 opacity-90">
                        Nikmati kelezatan kuliner pilihan dari pengusaha lokal terbaik. Kami menghadirkan hidangan berkualitas dengan bahan baku premium langsung ke meja Anda.
                    </p>
<div class="flex flex-col sm:flex-row gap-4">
<button class="px-8 py-4 bg-primary-container hover:bg-primary-fixed-dim text-white font-label-md rounded-xl transition-all shadow-[0_4px_0_0_#7a3000] hover:translate-y-1 hover:shadow-none active:scale-95">
                            Pesan Sekarang
                        </button>
<button class="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-label-md rounded-xl transition-all">
                            Lihat Menu
                        </button>
</div>
</div>
</div>
</section>
<!-- Why Choose Us Section -->
<section class="py-xl bg-surface">
<div class="max-w-screen-2xl mx-auto px-6 md:px-12">
<div class="text-center mb-16">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-4">Mengapa Memilih Kami</h2>
<div class="w-24 h-1 bg-primary-container mx-auto rounded-full"></div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<!-- Feature 1 -->
<div class="p-lg bg-surface-container-low rounded-xl text-center group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
<div class="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
<span class="material-symbols-outlined text-3xl">eco</span>
</div>
<h3 class="font-headline-md text-headline-md mb-3 text-on-surface">Fresh Ingredients</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Kami hanya menggunakan bahan baku segar yang dipasok langsung setiap pagi dari petani lokal.</p>
</div>
<!-- Feature 2 -->
<div class="p-lg bg-surface-container-low rounded-xl text-center group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
<div class="w-16 h-16 bg-primary-fixed text-on-primary-fixed-variant rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
<span class="material-symbols-outlined text-3xl">speed</span>
</div>
<h3 class="font-headline-md text-headline-md mb-3 text-on-surface">Quick Delivery</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Sistem logistik yang terintegrasi memastikan pesanan Anda sampai dalam keadaan hangat dan tepat waktu.</p>
</div>
<!-- Feature 3 -->
<div class="p-lg bg-surface-container-low rounded-xl text-center group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
<div class="w-16 h-16 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
<span class="material-symbols-outlined text-3xl">restaurant</span>
</div>
<h3 class="font-headline-md text-headline-md mb-3 text-on-surface">Traditional Recipes</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Resep warisan nusantara yang diolah dengan standar kualitas modern untuk rasa yang otentik.</p>
</div>
</div>
</div>
</section>
<!-- Featured Menu Section -->
<section class="py-xl bg-surface-container-lowest">
<div class="max-w-screen-2xl mx-auto px-6 md:px-12">
<div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
<div>
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">Menu Favorit Minggu Ini</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Pilihan terpopuler dari komunitas UMKM pilihan kami</p>
</div>
<a class="text-primary font-label-md flex items-center gap-2 hover:underline" href="#">
                        Lihat Semua Menu <span class="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<!-- Menu Card 1 -->
<div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
<div class="relative h-64 overflow-hidden">
<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="vibrant healthy salad bowl with roasted salmon, avocado, and fresh greens in soft natural light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB044Br5WRMi78HQGErtBCvb0b-L-OCCrX-riTeMpV__39CbvaqJy2YkC6xTLvVQg-GdQwZ_NL-IGR04Qh41KiZioWZg9ogmhWnzMeleK-KeeJtn2biYaNoH91OuRFUHLGPPXqRARfLP6th4KJfEJ3tkZ24nZrk83l9bComgeUB_AE5IYlhcZHcBVBPSisx_MLaIykI-edcSK0xu51n12eavSPpj9FHNfPozxdVMttHp31DzlDFMbSTCMB4II6TaZvx_EzPZitBOkI"/>
<div class="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm">Organic</div>
</div>
<div class="p-md">
<div class="flex justify-between items-start mb-2">
<h4 class="font-headline-md text-on-surface">Salmon Zen Bowl</h4>
<span class="text-primary font-headline-md">Rp 85k</span>
</div>
<p class="font-body-md text-on-surface-variant mb-6 line-clamp-2">Perpaduan salmon panggang premium dengan quinoa organik dan saus wijen khas.</p>
<button class="w-full py-3 border-2 border-primary-container text-primary font-label-md rounded-lg hover:bg-primary-container hover:text-white transition-colors active:scale-95">
                                Tambah ke Keranjang
                            </button>
</div>
</div>
<!-- Menu Card 2 -->
<div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
<div class="relative h-64 overflow-hidden">
<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="gourmet wagyu beef burger with melting cheese and caramelized onions on a brioche bun close-up" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcSQRaNofh8bV-OcVe5naYIenTKfrv-br-lFxfcMBA68IQRUFhOEwrhh6qKHe0zVCuw8nzvgeJCTyqazR63IMkN8d7YMfFhqsjKJDLsg8B8_9q6HJwiQ9iyzmf7Awcwh5RZNTFH0zKR67A0DHO8D2laBEuRU3TxzFYc_0qOQn7E-WfCw8DEXyP0GjCmOZN9Y204PAs3ibzvS92yTgBuH5D71U5_8heH8u5mLSC17EAaHHEAzqrX_Inj7sYTF2ALdv5XNk2q4CmjuI"/>
<div class="absolute top-4 right-4 bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-label-sm">Best Seller</div>
</div>
<div class="p-md">
<div class="flex justify-between items-start mb-2">
<h4 class="font-headline-md text-on-surface">Wagyu SME Burger</h4>
<span class="text-primary font-headline-md">Rp 95k</span>
</div>
<p class="font-body-md text-on-surface-variant mb-6 line-clamp-2">Daging wagyu meltique dengan keju cheddar tua dan roti brioche yang lembut.</p>
<button class="w-full py-3 border-2 border-primary-container text-primary font-label-md rounded-lg hover:bg-primary-container hover:text-white transition-colors active:scale-95">
                                Tambah ke Keranjang
                            </button>
</div>
</div>
<!-- Menu Card 3 -->
<div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
<div class="relative h-64 overflow-hidden">
<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="artisanal pepperoni pizza with fresh mozzarella and basil leaves on a rustic stone plate" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAewkOmjGEIixpN-4xPYtuGJjl-po0V_1qTpEpm6ZqPW8uurK_yCKJpMrHUqoBBW5KeagJR49gxMnhM5jf4Rxk14fkHJ80WpbX4Zi04xFrR3v5myttbuW44CTq2xhDngqiOxDSm0AKQbllv6pZdo7EZCXT5SU_Cs8dJo2IB9yz9DP9cCwoymIHBRq4hV3R3SNN7g0SzLT7EeEepvAv-lyf2lQWNf6ExbeXiXaqi4HvB8RhkpcOm0o21tvU2LS6JwW_3qr345xYSexE"/>
<div class="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-sm">Traditional</div>
</div>
<div class="p-md">
<div class="flex justify-between items-start mb-2">
<h4 class="font-headline-md text-on-surface">Truffle Margaritha</h4>
<span class="text-primary font-headline-md">Rp 110k</span>
</div>
<p class="font-body-md text-on-surface-variant mb-6 line-clamp-2">Pizza tipis ala Italia dengan sentuhan minyak truffle asli dan keju mozzarella segar.</p>
<button class="w-full py-3 border-2 border-primary-container text-primary font-label-md rounded-lg hover:bg-primary-container hover:text-white transition-colors active:scale-95">
                                Tambah ke Keranjang
                            </button>
</div>
</div>
</div>
</div>
</section>
<!-- Testimonials Section -->
<section class="py-xl bg-surface relative overflow-hidden">
<div class="absolute -top-24 -left-24 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl"></div>
<div class="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl"></div>
<div class="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
<div class="text-center mb-16">
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-4">Apa Kata Pelanggan</h2>
<p class="font-body-md text-on-surface-variant">Ribuan cerita bahagia dari penikmat GourmetSME</p>
</div>
<div class="flex flex-col md:flex-row gap-gutter overflow-x-auto pb-8 scrollbar-hide">
<!-- Testimonial 1 -->
<div class="min-w-[320px] md:min-w-0 md:flex-1 p-md bg-white rounded-2xl shadow-md border border-outline-variant/30 glass-card">
<div class="flex items-center gap-1 text-tertiary-container mb-4">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
<p class="font-body-md text-on-surface-variant italic mb-6">"Kualitas makanannya benar-benar di luar ekspektasi untuk harga semurah ini. Salmonnya sangat segar dan pengirimannya cepat!"</p>
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-surface-dim overflow-hidden">
<img class="w-full h-full object-cover" data-alt="portrait of a young woman with a friendly smile, natural professional outdoor lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwOgKgkUZU2UlJLUVlFXazvstlPldkSeiKyOaIdqtrTzPrY6LKg0w5bRYm562GlOSgPILsXmg1nACjUJnDy2CAu6BwYtaNrHioifMiMNgCX40yEUJggh7U_nAnU8RPjrAqu_p4_D4rBnuveQ8tuw6_pPhrEN4cktrghwe4oauXWoOVj3tDMiKDQwRNCz5yEDAxlLeS9kurLh8E57hbLTjqDoN2XrD8RRyGtq7163UQlJ8pqf5Bsr9GyiRmThkFa2KdXaWd41bTtjc"/>
</div>
<div>
<p class="font-label-md text-on-surface">Sarah Johnson</p>
<p class="text-label-sm text-on-surface-variant">Food Enthusiast</p>
</div>
</div>
</div>
<!-- Testimonial 2 -->
<div class="min-w-[320px] md:min-w-0 md:flex-1 p-md bg-white rounded-2xl shadow-md border border-outline-variant/30 glass-card">
<div class="flex items-center gap-1 text-tertiary-container mb-4">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
<p class="font-body-md text-on-surface-variant italic mb-6">"Sebagai pecinta burger, saya akui wagyu mereka juaranya. GourmetSME sangat membantu saya menemukan hidden gem kuliner lokal."</p>
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-surface-dim overflow-hidden">
<img class="w-full h-full object-cover" data-alt="smiling man in his 30s wearing a casual shirt, bright daylight portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpQ7Iavbw2WJ4x_j9hhsYM9VNRKIwazY49dNb9uC8hydb615KHU0h0mt78oa6UsQODX1O4rE0MXJSxeEMOkw7wwjhPHLoW6amRgZe2MK8zztS54NyuRrLEY0VMNBqMxMAT9L60lYAk9dh6sj3b_5u0MDE4zlJEam_YylP77YfHn2G9r9Lwwdxb8QM8zCcGfCUCdIseEEO5GCwMB8c9EiUBVvKp1FQB7t2dVD9xuKM7dI3spUvmlEhvzK3-zVy9_c5Tuy1OaSJraUU"/>
</div>
<div>
<p class="font-label-md text-on-surface">David Perkasa</p>
<p class="text-label-sm text-on-surface-variant">Graphic Designer</p>
</div>
</div>
</div>
<!-- Testimonial 3 -->
<div class="min-w-[320px] md:min-w-0 md:flex-1 p-md bg-white rounded-2xl shadow-md border border-outline-variant/30 glass-card">
<div class="flex items-center gap-1 text-tertiary-container mb-4">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
<p class="font-body-md text-on-surface-variant italic mb-6">"Pizza artisan terbaik yang pernah saya pesan online. Adonannya pas, toppingnya melimpah. Sangat direkomendasikan!"</p>
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-full bg-surface-dim overflow-hidden">
<img class="w-full h-full object-cover" data-alt="confident young professional woman looking at camera, soft studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0uEv9PfRfFFSJK32NCFbW5SWXbbSCU1kO6xTCpjkLAShjJ7gBDa6PdGpTaLub8dviu7ZMn5tB4ancB0K_2MRazrbMV5SoqR92RKETyDBEcxSDuzqOazM5ANeQmpDA4dVHt6RfOMPzyrNFSyHyGP9K13vshpLGmzb4AFeRtIL4uPs6isSZfvDTPu5lP0p81TF00oiaXpvDQ6MRfR0rQGMtid-jyQ5piBpNm8Qwd0T3ruFzAjy-3lueA3wfyWdsCYL4ybh6gbNhPEc"/>
</div>
<div>
<p class="font-label-md text-on-surface">Amanda Putri</p>
<p class="text-label-sm text-on-surface-variant">Health Coach</p>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Newsletter CTA -->
<section class="py-xl bg-primary">
<div class="max-w-4xl mx-auto px-6 text-center text-on-primary">
<h2 class="font-headline-lg text-headline-lg mb-6">Dapatkan Promo Menarik Setiap Minggu!</h2>
<p class="font-body-lg text-body-lg mb-8 opacity-90">Bergabunglah dengan buletin kami untuk info diskon eksklusif dan menu terbaru langsung di email Anda.</p>
<form class="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
<input class="flex-1 px-6 py-4 rounded-xl border-none text-on-surface focus:ring-2 focus:ring-primary-container bg-white" placeholder="Alamat Email Anda" type="email"/>
<button class="px-8 py-4 bg-on-background text-white font-label-md rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg">
                        Berlangganan
                    </button>
</form>
</div>
</section>
</main>
<!-- Footer -->
<footer class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
<div class="w-full py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12 max-w-screen-2xl mx-auto">
<div class="max-w-xs">
<div class="text-lg font-bold text-orange-600 mb-4">GourmetSME</div>
<p class="font-['Plus_Jakarta_Sans'] text-sm text-gray-500 leading-relaxed">
                    Platform kuliner kurasi terbaik untuk menghubungkan pecinta rasa dengan para pengusaha UMKM kuliner pilihan di Indonesia.
                </p>
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-12 flex-1 md:justify-items-end">
<div>
<h4 class="font-label-md text-on-surface mb-6">Company</h4>
<ul class="space-y-4 font-['Plus_Jakarta_Sans'] text-sm text-gray-500">
<li><a class="hover:text-orange-600 transition-colors" href="#">About Us</a></li>
<li><a class="hover:text-orange-600 transition-colors" href="#">Careers</a></li>
<li><a class="hover:text-orange-600 transition-colors" href="#">Our Merchants</a></li>
</ul>
</div>
<div>
<h4 class="font-label-md text-on-surface mb-6">Support</h4>
<ul class="space-y-4 font-['Plus_Jakarta_Sans'] text-sm text-gray-500">
<li><a class="hover:text-orange-600 transition-colors" href="#">Help Center</a></li>
<li><a class="hover:text-orange-600 transition-colors" href="#">Contact Us</a></li>
<li><a class="hover:text-orange-600 transition-colors" href="#">Privacy Policy</a></li>
</ul>
</div>
<div>
<h4 class="font-label-md text-on-surface mb-6">Legal</h4>
<ul class="space-y-4 font-['Plus_Jakarta_Sans'] text-sm text-gray-500">
<li><a class="hover:text-orange-600 transition-colors" href="#">Terms of Service</a></li>
<li><a class="hover:text-orange-600 transition-colors" href="#">Refund Policy</a></li>
</ul>
</div>
</div>
</div>
<div class="w-full py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-100 dark:border-gray-800 max-w-screen-2xl mx-auto">
<div class="font-['Plus_Jakarta_Sans'] text-sm text-gray-500">
                © 2024 GourmetSME Culinary UMKM Platform. All rights reserved.
            </div>
<div class="flex gap-6">
<a class="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
</a>
<a class="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="#">
<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.058-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
</a>
</div>
</div>
</footer>
</body>\`;

// 1. Regex class=" -> className="
let jsxBody = html.replace(/class="/g, 'className="');

// 2. Self closing tags
jsxBody = jsxBody.replace(/<img([^>]+)>/g, (match) => {
    if (match.endsWith('/>')) return match;
    return match.substring(0, match.length - 1) + ' />';
});
jsxBody = jsxBody.replace(/<input([^>]+)>/g, (match) => {
    if (match.endsWith('/>')) return match;
    return match.substring(0, match.length - 1) + ' />';
});

// 3. Prefix tailwind custom classes
const colorClasses = [
    'on-surface-variant', 'on-primary-fixed-variant', 'outline', 'error-container',
    'surface-tint', 'on-surface', 'primary-container', 'on-background', 'on-primary',
    'surface-variant', 'surface-container-lowest', 'on-secondary-fixed-variant',
    'surface-container-high', 'background', 'on-tertiary-container', 'primary-fixed',
    'outline-variant', 'on-primary-container', 'surface-container-highest',
    'secondary-fixed', 'tertiary', 'secondary-fixed-dim', 'inverse-on-surface',
    'on-error-container', 'inverse-primary', 'on-primary-fixed', 'tertiary-fixed',
    'surface-bright', 'surface', 'secondary-container', 'secondary',
    'on-secondary-fixed', 'on-error', 'primary', 'on-tertiary-fixed-variant',
    'surface-container-low', 'inverse-surface', 'on-tertiary', 'tertiary-fixed-dim',
    'error', 'surface-dim', 'on-secondary', 'surface-container', 'primary-fixed-dim',
    'on-secondary-container', 'tertiary-container', 'on-tertiary-fixed'
];

colorClasses.forEach(c => {
    jsxBody = jsxBody.replace(new RegExp(\`bg-\${c}\`, 'g'), \`bg-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`text-\${c}\`, 'g'), \`text-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`border-\${c}\`, 'g'), \`border-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`ring-\${c}\`, 'g'), \`ring-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`shadow-\${c}\`, 'g'), \`shadow-kl-\${c}\`);
});

const fontClasses = ['label-sm', 'headline-md', 'headline-lg', 'body-md', 'body-lg', 'display-lg', 'label-md'];
fontClasses.forEach(c => {
    jsxBody = jsxBody.replace(new RegExp(\`font-\${c}\`, 'g'), \`font-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`text-\${c}\`, 'g'), \`text-kl-\${c}\`);
});

const spaceClasses = ['sm', 'margin', 'md', 'xs', 'base', 'xl', 'lg', 'gutter'];
spaceClasses.forEach(c => {
    jsxBody = jsxBody.replace(new RegExp(\`p-\${c}\`, 'g'), \`p-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`py-\${c}\`, 'g'), \`py-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`px-\${c}\`, 'g'), \`px-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`m-\${c}\`, 'g'), \`m-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`my-\${c}\`, 'g'), \`my-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`mx-\${c}\`, 'g'), \`mx-kl-\${c}\`);
    jsxBody = jsxBody.replace(new RegExp(\`gap-\${c}\`, 'g'), \`gap-kl-\${c}\`);
});

const componentStr = \`import React from 'react';

export default function Storefront() {
  return (
    <div className="kuliner-landing">
      \${jsxBody}
    </div>
  );
}
\`;

fs.writeFileSync('src/apps/kuliner/pages/Storefront.jsx', componentStr);

const tailwindConfigExtension = \`
// Add this to tailwind.config.js extend block:
kuliner: {
  colors: {
    'kl-on-surface-variant': '#584237',
    'kl-on-primary-fixed-variant': '#7a3000',
    'kl-outline': '#8c7166',
    'kl-error-container': '#ffdad6',
    'kl-surface-tint': '#a04100',
    'kl-on-surface': '#1e1b18',
    'kl-primary-container': '#f37021',
    'kl-on-background': '#1e1b18',
    'kl-on-primary': '#ffffff',
    'kl-surface-variant': '#e9e1dc',
    'kl-surface-container-lowest': '#ffffff',
    'kl-on-secondary-fixed-variant': '#005313',
    'kl-surface-container-high': '#efe6e2',
    'kl-background': '#fff8f5',
    'kl-on-tertiary-container': '#402c00',
    'kl-primary-fixed': '#ffdbcb',
    'kl-outline-variant': '#e0c0b2',
    'kl-on-primary-container': '#541f00',
    'kl-surface-container-highest': '#e9e1dc',
    'kl-secondary-fixed': '#94f990',
    'kl-tertiary': '#7c5800',
    'kl-secondary-fixed-dim': '#78dc77',
    'kl-inverse-on-surface': '#f8efea',
    'kl-on-error-container': '#93000a',
    'kl-inverse-primary': '#ffb693',
    'kl-on-primary-fixed': '#341000',
    'kl-tertiary-fixed': '#ffdea8',
    'kl-surface-bright': '#fff8f5',
    'kl-surface': '#fff8f5',
    'kl-secondary-container': '#91f78e',
    'kl-secondary': '#006e1c',
    'kl-on-secondary-fixed': '#002204',
    'kl-on-error': '#ffffff',
    'kl-primary': '#a04100',
    'kl-on-tertiary-fixed-variant': '#5e4200',
    'kl-surface-container-low': '#fbf2ed',
    'kl-inverse-surface': '#34302c',
    'kl-on-tertiary': '#ffffff',
    'kl-tertiary-fixed-dim': '#ffba20',
    'kl-error': '#ba1a1a',
    'kl-surface-dim': '#e1d8d4',
    'kl-on-secondary': '#ffffff',
    'kl-surface-container': '#f5ece7',
    'kl-primary-fixed-dim': '#ffb693',
    'kl-on-secondary-container': '#00731e',
    'kl-tertiary-container': '#c48d00',
    'kl-on-tertiary-fixed': '#271900'
  },
  spacing: {
    'kl-sm': '12px',
    'kl-margin': '32px',
    'kl-md': '24px',
    'kl-xs': '4px',
    'kl-base': '8px',
    'kl-xl': '64px',
    'kl-lg': '40px',
    'kl-gutter': '24px'
  },
  fontSize: {
    'kl-label-sm': ['12px', {lineHeight: '16px', fontWeight: '500'}],
    'kl-headline-md': ['24px', {lineHeight: '32px', fontWeight: '600'}],
    'kl-headline-lg': ['32px', {lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700'}],
    'kl-body-md': ['16px', {lineHeight: '24px', fontWeight: '400'}],
    'kl-body-lg': ['18px', {lineHeight: '28px', fontWeight: '400'}],
    'kl-display-lg': ['48px', {lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700'}],
    'kl-label-md': ['14px', {lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600'}]
  },
  fontFamily: {
    'kl-label-sm': ['Inter'],
    'kl-headline-md': ['Plus Jakarta Sans'],
    'kl-headline-lg': ['Plus Jakarta Sans'],
    'kl-body-md': ['Plus Jakarta Sans'],
    'kl-body-lg': ['Plus Jakarta Sans'],
    'kl-display-lg': ['Plus Jakarta Sans'],
    'kl-label-md': ['Inter']
  }
}
\`;

fs.writeFileSync('tailwind-kuliner-config.txt', tailwindConfigExtension);
