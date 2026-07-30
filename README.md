# Dashboard น้องลัดดา

Dashboard สำหรับทีมแอดมินดูบทสนทนา LINE, ข้อมูล CRM, งานติดตาม และรับช่วงตอบลูกค้าแบบ manual

## Production

- URL: `https://dashboard.srv1651337.hstgr.cloud`
- Frontend: React + Vite
- Data/Auth: Supabase พร้อม RLS
- Manual LINE reply: Supabase Edge Function `ladda-manual-reply`
- Runtime: Docker + Nginx หลัง Traefik HTTPS

Production จะไม่แสดงข้อมูล demo หากตั้งค่า Supabase ผิด แต่จะแจ้งข้อผิดพลาดและหยุดอ่านข้อมูลแทน

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

เปิดข้อมูลตัวอย่างได้เฉพาะ local development โดยตั้ง `VITE_ENABLE_DEMO=true`

## Verification

```bash
npm run check
```

## Production deployment

สร้างไฟล์ `.env.production` บนเซิร์ฟเวอร์เท่านั้น:

```dotenv
VITE_SUPABASE_URL=https://fwzdgzpuajcsigwlyojr.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key>
VITE_ENABLE_MICROSOFT_LOGIN=false
```

จากนั้นรัน:

```bash
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

ห้ามเก็บ Supabase service-role key, LINE token หรือ OAuth token ใน repository หรือ frontend build

