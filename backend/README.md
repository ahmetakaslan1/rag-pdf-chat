# 🔧 Backend — NestJS API

> Ana proje dokümantasyonu için [ana README'ye](../README.md) bakın.

NestJS ile yazılmış RESTful API ve WebSocket Gateway. PostgreSQL (pgvector), Redis (BullMQ), Google Gemini AI entegrasyonlarını içerir.

---

## 🚀 Kurulum

### Ön Koşullar

- Node.js v18+
- Docker (PostgreSQL + Redis için) **ya da** yerel kurulum
- `.env` dosyası (proje kökünde — [şablon için](../.env.example))

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda başlat (hot-reload aktif)
npm run start:dev

# Üretim build
npm run build
npm run start:prod
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde başlar.

---

## 📦 Modüller

| Modül | Sorumluluk |
|---|---|
| `AuthModule` | JWT çift token, register/login/logout/refresh |
| `UsersModule` | Kullanıcı CRUD, şifre hash |
| `DocumentsModule` | PDF yükleme, MIME doğrulama, IDOR koruma |
| `QueueModule` | BullMQ kuyruk + DocumentProcessor worker |
| `RagModule` | Chunk bölümleme, vektör saklama, cosine similarity arama |
| `GeminiModule` | Google Gemini embedding + chat completion |
| `ChatModule` | Sohbet oturumları, mesajlar, WebSocket Gateway |
| `StorageModule` | Strategy Pattern — Local veya S3 depolama |
| `CleanupModule` | Her 30 dakikada misafir veri temizleme cron job |
| `ConfigModule` | Joi ile env doğrulama |
| `DatabaseModule` | TypeORM + pgvector yapılandırması |

---

## 🔄 PDF İşleme Akışı

```
PDF Yüklendi
    │
    ▼
[DocumentsController] → Dosya doğrulama (MIME, boyut, IDOR)
    │
    ▼
[BullMQ Queue] → İş kuyruğa eklendi (asenkron)
    │
    ▼
[DocumentProcessor Worker]
    ├── pdf-parse ile metin çıkarma
    ├── Null-byte temizleme
    ├── Veritabanına parsed_content kaydetme
    ├── Metni chunk'lara bölme
    └── Her chunk için Gemini Embedding API çağrısı
         └── pgvector'a 768 boyutlu vektör kaydetme
    │
    ▼
[Socket.io] → Tarayıcıya %10, %30... %100 ilerleme bildirimi
```

---

## 🔑 Ortam Değişkenleri

`.env` dosyası proje **kökünde** bulunmalıdır (`backend/` içinde değil).

```env
# Uygulama
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Veritabanı
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=rag_chat_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (en az 32 karakter)
JWT_ACCESS_SECRET=super_secret_access_key_min_32_chars_here!!
JWT_REFRESH_SECRET=super_secret_refresh_key_min_32_chars_here!!
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Depolama
STORAGE_TYPE=local
LOCAL_UPLOAD_DIR=./uploads
LOCAL_BASE_URL=http://localhost:3000

# Gemini API
GEMINI_API_KEY=your_api_key_here
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
GEMINI_CHAT_MODEL=gemini-2.5-flash

# Rate Limit
THROTTLE_TTL=60
THROTTLE_LIMIT=20
```

---

## 🧪 Kullanılabilir Komutlar

```bash
npm run start:dev     # Geliştirme (hot-reload)
npm run start:debug   # Debug modu
npm run build         # TypeScript derleme
npm run start:prod    # Üretim
npm run lint          # ESLint
```

---

## 📁 Kaynak Yapısı

```
src/
├── auth/
│   ├── strategies/         # JWT Access + Refresh stratejileri
│   ├── auth.controller.ts  # /api/auth/* endpoint'leri
│   └── auth.service.ts
├── chat/
│   ├── entities/           # ChatSession, Message entity'leri
│   ├── events.gateway.ts   # Socket.io WebSocket Gateway
│   ├── chat.controller.ts  # /api/chat/* endpoint'leri
│   └── chat.service.ts
├── cleanup/
│   └── cleanup.service.ts  # @Cron her 30 dk misafir temizliği
├── common/
│   ├── decorators/         # @Public, @CurrentUser, @Roles
│   ├── filters/            # GlobalExceptionFilter
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── interceptors/       # OwnerContextInterceptor
│   └── utils/              # logger.ts
├── config/
│   └── env.validation.ts   # Joi şeması
├── database/
│   └── database.module.ts  # TypeORM + pgvector init
├── documents/
│   ├── entities/           # Document, DocumentChunk entity'leri
│   ├── documents.controller.ts
│   └── documents.service.ts
├── gemini/
│   └── gemini.service.ts   # generateEmbedding, generateChatResponse
├── queue/
│   ├── constants/          # DOCUMENT_QUEUE sabiti
│   └── processors/
│       └── document.processor.ts  # BullMQ worker
├── rag/
│   └── rag.service.ts      # processAndStoreChunks, searchSimilarChunks
├── storage/
│   ├── strategies/         # LocalStorageStrategy, S3StorageStrategy
│   └── storage.service.ts
└── users/
    └── users.service.ts
```
