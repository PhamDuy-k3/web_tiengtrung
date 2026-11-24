import React from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { ChineseCloud, ChineseSeal } from "@/components/ui/ChineseDecoration";

export default function SourcesPage() {
  const sources = [
    {
      title: "Khung chuẩn năng lực Hán ngữ Quốc tế (HSK 1 - 6)",
      author: "Hanban / Chinese Testing International (CTI) - 汉办 / 汉考国际",
      description:
        "Quy chuẩn cấp độ chính thức ban hành bởi Bộ Giáo dục Trung Quốc và Hanban. Định lượng chính xác danh mục từ vựng tích lũy từ 150 từ (HSK 1) đến 5000 từ (HSK 6), cùng đại cương ngữ pháp phân cấp chuẩn.",
      type: "Tiêu chuẩn quốc tế chính thống",
    },
    {
      title: "HSK Standard Course (HSK标准教程)",
      author: "Khương Lệ Bình (姜丽萍) chủ biên - Đại học Ngôn ngữ Bắc Kinh (BLCU)",
      description:
        "Bộ giáo trình chuẩn mực được biên soạn theo đúng ma trận đề thi HSK thực tế, phân chia rõ lộ trình ngữ pháp, trình tự chủ đề và ngữ cảnh giao tiếp thực tiễn cho từng cấp độ.",
      type: "Giáo trình giảng dạy chuẩn",
    },
    {
      title: "Giáo trình Hán ngữ 6 cuốn (汉语教程)",
      author: "Dương Ký Châu (杨寄洲) - NXB Đại học Ngôn ngữ Bắc Kinh",
      description:
        "Bộ giáo trình kinh điển được giảng dạy tại hầu hết các khoa tiếng Trung của các trường đại học tại Việt Nam, chuẩn hóa phát âm Pinyin và hệ thống ngữ pháp cơ sở.",
      type: "Giáo trình cơ sở ngữ pháp",
    },
    {
      title: "Developing Chinese (发展汉语)",
      author: "NXB Đại học Ngôn ngữ Bắc Kinh",
      description:
        "Tài liệu tham khảo chuyên sâu cho các cấu trúc câu phức, bổ ngữ kết quả, bổ ngữ khả năng, câu chữ 把/被 và văn phong viết luận trung - cao cấp.",
      type: "Tài liệu bổ trợ ngữ pháp",
    },
    {
      title: "Từ điển Hán - Việt & Hiện đại Hán ngữ Từ điển (现代汉语词典)",
      author: "Viện Khoa học Xã hội Trung Quốc (CASS)",
      description:
        "Quy chuẩn phiên âm Pinyin có dấu thanh điệu chuẩn mực và định nghĩa ngữ nghĩa tiếng Việt chính xác, loại bỏ các cách hiểu sai lệch hoặc Hán Việt tối nghĩa.",
      type: "Từ điển tra cứu chuẩn mực",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-3 relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
          <ChineseCloud className="w-32 h-16 text-coral" />
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-coral" size={24} />
          <span className="text-xs font-bold text-coral uppercase tracking-wider">
            Nguồn học liệu chính thống
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal">
          Nguồn tham khảo & Quy chuẩn nội dung
        </h1>
        <p className="text-sm text-charcoal/70 leading-relaxed max-w-2xl">
          Toàn bộ ngân hàng câu hỏi, phiên âm Pinyin, chủ đề và hệ thống ngữ pháp trên website được xây dựng bám sát theo các tiêu chuẩn học thuật chính thống của cơ quan khảo thí HSK Trung Quốc.
        </p>
      </div>

      {/* Cam kết bản quyền và phương pháp học */}
      <div className="p-5 bg-amber-50 rounded-3xl border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2">
        <div className="font-bold flex items-center gap-1.5 text-amber-900">
          <CheckCircle size={16} />
          <span>Cam kết học thuật & Bản quyền nội dung:</span>
        </div>
        <p className="leading-relaxed">
          Website chỉ sử dụng khung danh mục từ vựng và đại cương ngữ pháp HSK làm chuẩn kiến thức; toàn bộ câu hỏi, ví dụ giao tiếp, ngữ cảnh bài tập đều được đội ngũ tự biên soạn mới 100%, không sao chép nguyên văn đề thi có bản quyền của bất kỳ tổ chức nào.
        </p>
      </div>

      {/* Source Cards */}
      <div className="space-y-4">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border-2 border-cream-300 shadow-card hover:border-amber-300 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cream-200 text-charcoal/70">
                {src.type}
              </span>
              <ChineseSeal text="Chính thống" />
            </div>

            <h3 className="font-black text-lg text-charcoal">{src.title}</h3>
            <div className="text-xs font-bold text-coral-deep">{src.author}</div>
            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
              {src.description}
            </p>
          </div>
        ))}
      </div>

      {/* Return button */}
      <div className="pt-4 text-center">
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-sm shadow-duo-coral transition-all"
        >
          Quay lại luyện tập
        </Link>
      </div>
    </div>
  );
}
