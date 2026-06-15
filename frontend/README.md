# 🎨 Frontend — React + Vite SPA

> Ana proje dokümantasyonu için [ana README'ye](../README.md) bakın.

React 19 + Vite ile geliştirilmiş, özel CSS tasarım sistemi kullanan modern bir tek sayfa uygulaması (SPA).

---

## 🚀 Kurulum

### Ön Koşullar

- Node.js v18+
- Backend API'nin çalışıyor olması (`http://localhost:3000`)

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır.

---

## 📦 Sayfa ve Bileşen Yapısı

### Sayfalar (`/src/pages`)

| Sayfa | Rota | Açıklama |
|---|---|---|
| `HomePage` | `/` | PDF yükleme, belge listesi, nasıl çalışır rehberi |
| `ChatPage` | `/chat/:sessionId` | Sohbet ekranı (ChatWindow bileşenini render eder) |
| `LoginPage` | `/login` | Giriş formu |
| `RegisterPage` | `/register` | Kayıt formu |

### Bileşenler (`/src/components`)

```
Auth/
├── LoginForm.tsx       # E-posta + şifre (göster/gizle toggle dahil)
└── RegisterForm.tsx    # E-posta + şifre (göster/gizle toggle dahil)

Chat/
├── ChatWindow.tsx      # Mesaj listesi + boş durum + yazıyor indikatörü
├── MessageBubble.tsx   # Sağ/sol balonlar + react-markdown render
└── MessageInput.tsx    # Mesaj gönderme formu

Documents/
├── FileUpload.tsx      # Sürükle-bırak PDF yükleme alanı
└── ProcessingStatus.tsx # Gerçek zamanlı yükleme ilerleme durumu

Layout/
├── AppLayout.tsx       # Sidebar + Header + Outlet sarmalayıcı
├── Header.tsx          # Başlık çubuğu + tema değiştirme
└── Sidebar.tsx         # Belge ağacı, sohbet listesi, kullanıcı bilgisi

common/
└── LoadingSpinner.tsx  # Yükleme animasyonu
```

### Context'ler (`/src/contexts`)

| Context | Sorumluluk |
|---|---|
| `AuthContext` | Kullanıcı durumu, login/logout/register, token yönetimi |
| `SocketContext` | Socket.io bağlantısı, misafir/kullanıcı kimliği |
| `RAGContext` | Belgeler ve sohbet listesi, sohbet oluşturma/silme/yeniden adlandırma |

---

## 🎨 Tasarım Sistemi

Bu proje Tailwind CSS **kullanmaz**. Tüm stiller `src/index.css` dosyasında özel CSS değişkenleri ve utility sınıfları ile tanımlanmıştır.

### CSS Değişkenleri (Tema Renkleri)

```css
/* Karanlık Tema (varsayılan) */
--bg-primary:    #0a0b10
--bg-secondary:  #0f111a
--bg-tertiary:   #161824
--primary:       #8b5cf6   /* Mor vurgu */
--text-primary:  #f8fafc
--text-secondary: #94a3b8

/* Açık Tema (.light sınıfı ile aktif) */
--bg-primary:    #f8fafc
--bg-secondary:  #ffffff
--primary:       #7c3aed
```

### Tema Değiştirme

Header'daki 🌙 / ☀️ butonuna tıklanınca `document.documentElement.classList.toggle('light')` çağrılır ve tercih `localStorage`'a kaydedilir.

---

## 🔌 API Entegrasyonu

`/src/api/axios.ts` — Axios instance yapılandırması:
- Tüm isteklere `Authorization: Bearer <token>` header'ı eklenir
- 401 hatasında otomatik token yenileme (refresh) denenir
- Refresh de başarısız olursa kullanıcı çıkış yapılır ve `/login`'e yönlendirilir

`/src/api/chat.ts` — Sohbet API çağrıları (sessions, messages)

---

## 🧪 Kullanılabilir Komutlar

```bash
npm run dev       # Geliştirme sunucusu (hot-reload)
npm run build     # TypeScript derleme + Vite üretim bundle
npm run preview   # Üretim bundle'ını önizle
npm run lint      # ESLint
```

---

## 🔧 Vite Yapılandırması

`vite.config.ts` dosyası minimal tutulmuştur. Ağ erişimi için `--host` parametresi kullanılabilir:

```bash
npm run dev -- --host
```

---

## 📦 Bağımlılıklar

| Paket | Kullanım |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | İstemci taraflı routing |
| `axios` | HTTP istemcisi |
| `socket.io-client` | WebSocket bağlantısı |
| `react-markdown` | AI yanıtlarında Markdown render |
| `lucide-react` | İkon seti |
