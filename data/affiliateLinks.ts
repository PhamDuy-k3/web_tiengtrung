export type AffiliateCategory = "all" | "tech" | "desk" | "chinese";

export interface AffiliateProduct {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: Exclude<AffiliateCategory, "all">;
  tagLabel: string;
  platform: "TikTok Shop" | "Shopee" | "Tiki" | "Lazada" | "Khác";
  badge?: string;
  priceHint?: string;
  /** Dán link TikTok Affiliate của bạn vào đây (vd: https://vt.tiktok.com/...) */
  affiliateUrl: string;
  enabled: boolean;
}

/**
 * Danh sách link TikTok Affiliate hiển thị trên trang /support.
 * Tập trung vào đồ công nghệ/góc học tập thiết yếu (ai dùng máy tính/điện thoại cũng cần)
 * kèm một số sản phẩm học tiếng Trung cốt lõi.
 */
export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // ── Công nghệ & Phụ kiện (dễ chốt đơn nhất) ──
  {
    id: "tt-tech-earbuds",
    title: "Tai nghe Bluetooth KY A6 (Giảm ồn ENC · Pin 8H · 5 Quà tặng)",
    subtitle: "Âm thanh nổi HiFi · Chống nước IPX5 · Tương thích mọi điện thoại",
    description:
      "Thiết kế bán trong tai đeo êm, giảm tiếng ồn ENC giúp nghe bài giảng HSK và thu âm luyện nói rõ nét, thời lượng pin lên đến 8 giờ.",
    category: "tech",
    tagLabel: "Công nghệ · Âm thanh",
    platform: "TikTok Shop",
    badge: "Giảm sốc",
    priceHint: "Giá mềm · Xem ưu đãi",
    affiliateUrl: "https://vt.tiktok.com/ZS9PpA1FBYNR2-vdB6b/",
    enabled: true,
  },
  // {
  //   id: "tt-tech-charger",
  //   title: "Củ sạc nhanh GaN 33W–65W kèm cáp bọc dù siêu bền",
  //   subtitle: "Sạc nhanh cho điện thoại, iPad & Laptop",
  //   description:
  //     "Nhỏ gọn dễ mang theo khi học tập ở quán cà phê hoặc thư viện, hỗ trợ nhiều cổng sạc cùng lúc, không nóng máy.",
  //   category: "tech",
  //   tagLabel: "Công nghệ · Phụ kiện",
  //   platform: "TikTok Shop",
  //   badge: "Thiết yếu",
  //   priceHint: "Giá mềm · Xem ưu đãi",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },
  // {
  //   id: "tt-tech-powerbank",
  //   title: "Pin sạc dự phòng 10.000mAh–20.000mAh sạc nhanh PD",
  //   subtitle: "Học mọi lúc mọi nơi không lo hết pin",
  //   description:
  //     "Dung lượng chuẩn, có màn hình LED báo phần trăm pin, rất tiện cho người hay ôn từ vựng và làm đề trên điện thoại khi di chuyển.",
  //   category: "tech",
  //   tagLabel: "Công nghệ · Di động",
  //   platform: "TikTok Shop",
  //   priceHint: "~180.000đ – 350.000đ",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },
  {
    id: "tt-tech-stand",
    title: "Giá đỡ nhôm 3 trong 1 từ tính xoay 360° (Điện thoại / Tablet / Laptop)",
    subtitle: "Chỉnh độ cao 8 mức · Gấp gọn di động · Đế tam chân chắc chắn",
    description:
      "Nâng màn hình ngang tầm mắt để đỡ mỏi cổ khi ngồi học lâu, gập gọn mang đi làm hoặc ra quán cà phê rất tiện.",
    category: "tech",
    tagLabel: "Công nghệ · Góc máy",
    platform: "TikTok Shop",
    badge: "Khuyên dùng",
    priceHint: "Giá mềm · Đang sale",
    affiliateUrl: "https://vt.tiktok.com/ZS9PpDeFmbvoy-znqN6/",
    enabled: true,
  },
  // {
  //   id: "tt-tech-mouse",
  //   title: "Chuột không dây Silent bấm êm + Lót chuột cỡ lớn",
  //   subtitle: "Không gây tiếng ồn ban đêm khi làm bài tập",
  //   description:
  //     "Click siêu êm, pin trâu, phù hợp học khuya hoặc làm việc ở thư viện, văn phòng mà không ảnh hưởng người xung quanh.",
  //   category: "tech",
  //   tagLabel: "Công nghệ · Văn phòng",
  //   platform: "TikTok Shop",
  //   priceHint: "~90.000đ – 190.000đ",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },
  // {
  //   id: "tt-tech-glasses",
  //   title: "Kính gọng nhẹ chống ánh sáng xanh màn hình máy tính",
  //   subtitle: "Bảo vệ mắt khi ôn thi & đọc chữ Hán lâu",
  //   description:
  //     "Giảm chói và mỏi mắt khi nhìn màn hình máy tính/điện thoại nhiều giờ liên tục, gọng nhẹ đeo thoải mái cả ngày.",
  //   category: "tech",
  //   tagLabel: "Bảo vệ mắt",
  //   platform: "TikTok Shop",
  //   priceHint: "~70.000đ – 150.000đ",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },

  // // ── Góc học tập & Sức khỏe ──
  // {
  //   id: "tt-desk-lamp",
  //   title: "Đèn kẹp màn hình / Đèn bàn học chống cận cảm ứng",
  //   subtitle: "Ánh sáng dịu mắt khi học buổi tối",
  //   description:
  //     "Điều chỉnh được độ sáng và nhiệt độ màu, không nhấp nháy, tiết kiệm diện tích bàn học.",
  //   category: "desk",
  //   tagLabel: "Góc học tập",
  //   platform: "TikTok Shop",
  //   badge: "Phổ biến",
  //   priceHint: "~120.000đ – 260.000đ",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },
  {
    id: "tt-desk-bottle",
    title: "Bình giữ nhiệt 500ml TOPGIA Inox 304 cao cấp có dây xách",
    subtitle: "TikTok Mall chính hãng · Nắp thông minh tiện lợi",
    description:
      "Chất liệu Inox 304 an toàn, giữ nóng/lạnh suốt nhiều giờ cho cốc cà phê, trà hoặc nước mát khi ngồi học bài và làm việc.",
    category: "desk",
    tagLabel: "Đồ dùng hằng ngày",
    platform: "TikTok Shop",
    badge: "Mall · Bán chạy",
    priceHint: "Giá mềm · Freeship",
    affiliateUrl: "https://vt.tiktok.com/ZS9PpHQVWmGNr-Gl1N2/",
    enabled: true,
  },
  // {
  //   id: "tt-desk-cushion",
  //   title: "Gối tựa lưng cao su non công thái học cho ghế ngồi",
  //   subtitle: "Ngồi học lâu không đau lưng",
  //   description:
  //     "Nâng đỡ cột sống thắt lưng, chất liệu thoáng khí, phù hợp cho học sinh, sinh viên và dân văn phòng.",
  //   category: "desk",
  //   tagLabel: "Sức khỏe · Văn phòng",
  //   platform: "TikTok Shop",
  //   priceHint: "~130.000đ – 240.000đ",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },

  // // ── Học tiếng Trung (cốt lõi, không tải PDF được) ──
  {
    id: "tt-cn-copybook",
    title: "Sách Tập Viết Chữ Hán - Phiên Bản Mới (MCBOOKS)",
    subtitle: "TikTok Mall chính hãng · Luyện nét chuẩn ô ly",
    description:
      "Hướng dẫn viết chữ Hán bài bản theo đúng quy tắc bút thuận, phù hợp cho người mới bắt đầu luyện viết song song với bài học trên web.",
    category: "chinese",
    tagLabel: "Học tiếng Trung",
    platform: "TikTok Shop",
    badge: "Mall · 4.9★",
    priceHint: "Đang sale · Freeship",
    affiliateUrl: "https://vt.tiktok.com/ZS9Pp9R5xEBxU-hREg9/",
    enabled: true,
  },
  // {
  //   id: "tt-cn-copybook",
  //   title: "Sách Tập Viết Chữ Hán - Phiên Bản Mới (MCBOOKS)",
  //   subtitle: "TikTok Mall chính hãng · Luyện nét chuẩn ô ly",
  //   description:
  //     "Hướng dẫn viết chữ Hán bài bản theo đúng quy tắc bút thuận, phù hợp cho người mới bắt đầu luyện viết song song với bài học trên web.",
  //   category: "chinese",
  //   tagLabel: "Học tiếng Trung",
  //   platform: "TikTok Shop",
  //   badge: "Mall · 4.9★",
  //   priceHint: "Đang sale · Freeship",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },
  // {
  //   id: "tt-cn-flashcard",
  //   title: "Bộ Flashcard 214 Bộ thủ & Từ vựng HSK 1–2",
  //   subtitle: "Ôn nhanh mọi lúc không cần mở điện thoại",
  //   description:
  //     "In rõ nét chữ Hán, Pinyin, nghĩa tiếng Việt và ví dụ ngắn, tiện cầm tay ôn trước khi ngủ hoặc lúc rảnh.",
  //   category: "chinese",
  //   tagLabel: "Học tiếng Trung",
  //   platform: "TikTok Shop",
  //   priceHint: "~55.000đ – 110.000đ",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },
  // {
  //   id: "tt-cn-hsk12",
  //   title: "Combo Giáo trình chuẩn HSK 1 & HSK 2 (Sách giấy)",
  //   subtitle: "HSK Standard Course — Dành cho người thích sách giấy",
  //   description:
  //     "Bộ sách gốc kèm bài tập thực hành, phù hợp để ghi chú trực tiếp song song với quá trình luyện đề trên web.",
  //   category: "chinese",
  //   tagLabel: "Học tiếng Trung · HSK 1–2",
  //   platform: "TikTok Shop",
  //   priceHint: "~180.000đ – 260.000đ",
  //   affiliateUrl: "https://www.tiktok.com",
  //   enabled: true,
  // },
];
