# OXY-HYDRO EXPLORER

Statik web dashboard projesi. Site, Vercel üzerinde statik olarak deploy edilecek ve Firebase Realtime Database üzerinden DENEYAP Kart verilerini okuyacak.

## Dosya Yapısı

- `index.html` - Ana sayfa.
- `style.css` - Modern uzay temalı koyu tasarım.
- `app.js` - Firebase ve dashboard mantığı.
- `package.json` - Vercel için script.
- `README.md` - Proje açıklaması.

## Özellikler

- Realtime Database path: `/oxyHydroExplorer/status`
- Firebase Web SDK kullanımı
- Kullanıcıya canlı sistem durumu sunar
- Bağlantı yoksa "DENEYAP Kart bağlantısı yok" uyarısı gösterir
- Veri 10 saniyeden eskiyse "Veri güncel değil" uyarısı verir
- Demo modu app.js içinde aç/kapat değişkeni ile kontrol edilir

## Kullanım

1. `app.js` içindeki `FIREBASE_CONFIG` değerlerini kendi Firebase projeniz ile değiştirin.
2. `DEMO_MODE` değişkenini gerçek veri okumak istediğinizde `false` yapın.
3. Vercel deploy için bu depo statik site olarak yayınlanabilir.

## Deploy

Bu proje Vercel statik site olarak çalışır. `package.json` içinde `vercel-build` scripti yer almaktadır.

> Not: Hidrojen enerji modu web sitesinde simülasyon modu olarak gösterilir ve hidrojen riski varsa elektroliz durumu otomatik olarak "Durduruldu" olarak işaretlenir.
