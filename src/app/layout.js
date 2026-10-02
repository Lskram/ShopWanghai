import './globals.css';

export const metadata = {
  title: 'ร้านค้าสวัสดิการ กองทุนหมู่บ้านวังไฮ | ช้อปของกิน ของใช้ เพื่อชุมชน',
  description: 'ร้านค้าชุมชนกองทุนหมู่บ้านวังไฮ ของกิน ของใช้ ขนมไทยโบราณ วัตถุดิบ สินค้า OTOP ราคาประหยัด พร้อมส่งฟรีถึงบ้านในหมู่บ้าน',
  keywords: 'กองทุนหมู่บ้านวังไฮ, ขนมไทยโบราณ, ร้านขายของชำวังไฮ, สินค้า OTOP วังไฮ, ร้านค้าสวัสดิการชุมชน',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
