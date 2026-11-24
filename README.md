# Hanyu Duolingo - Nền tảng Luyện tập Tiếng Trung Phản Xạ Chuẩn HSK

Website luyện tập tiếng Trung thuần thực hành dành cho người Việt với trải nghiệm sinh động tương tự Duolingo. Dự án được xây dựng trên nền tảng **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, kiến trúc **Service Layer / Repository Pattern** tách biệt hoàn toàn giữa giao diện và nguồn dữ liệu, sẵn sàng cắm backend thật bất cứ lúc nào.

---

## 1. Tính năng nổi bật

- **3 Cấp độ chuẩn mực**: Cơ bản (HSK 1-2), Trung cấp (HSK 3-4), Nâng cao (HSK 5-6).
- **Hơn 44 đề thi với 440+ câu hỏi tự biên soạn mới**: Bám sát danh mục từ vựng Hanban/CTI và giáo trình HSK Standard Course, có đầy đủ chữ Hán, Pinyin chuẩn thanh điệu, giải thích ngữ pháp chi tiết.
- **8 Dạng bài tập tương tác đa dạng**:
  1. *Sắp xếp từ thành câu*: Click các viên gạch chữ Hán để xếp và hủy xếp kiểu Duolingo.
  2. *Trắc nghiệm chọn nghĩa*: Lựa chọn ngữ nghĩa chuẩn xác.
  3. *Điền từ vào chỗ trống*: Kiểm tra ngữ cảnh và lượng từ.
  4. *Nối cặp từ*: Nối chữ Hán/Pinyin với nghĩa tiếng Việt tương ứng.
  5. *Nghe chọn đáp án*: Tích hợp Web Speech API tiếng Trung (`zh-CN`), có nút nghe chậm (turtle mode).
  6. *Nghe và xếp câu*: Nghe âm thanh phát âm rồi xếp lại thứ tự các từ.
  7. *Chọn Pinyin chuẩn*: Rèn luyện thanh điệu và nhận diện mặt chữ.
  8. *Dịch câu ngắn*: Chấm điểm linh hoạt (bỏ qua dấu câu, khoảng trắng, viết hoa).
- **Bài kiểm tra lên cấp (Level-Up Exam)**: Đề thi tổng hợp 40 câu hỏi phủ khắp các chủ đề, giới hạn thời gian. Đạt từ 80% trở lên sẽ kích hoạt pháo giấy chúc mừng, trao huy hiệu và mở khóa cấp độ tiếp theo.
- **Bài kiểm tra xếp lớp đầu vào (Placement Test)**: 30 câu hỏi từ sơ cấp đến cao cấp giúp học viên mới xếp đúng trình độ ngay tức thì.
- **Sổ tay lỗi sai thông minh (Spaced Repetition)**: Tự động gom mọi câu làm sai, theo dõi số lần sai. Trả lời đúng liên tiếp 3 lần sẽ tự động chuyển sang trạng thái "Đã thuộc". Có chế độ sinh đề luyện riêng các câu hay sai.
- **Báo cáo tiến độ & Biểu đồ**: Biểu đồ điểm số theo thời gian, tỷ lệ chính xác theo từng dạng bài và từng chủ đề, chuỗi ngày học liên tục (Streak) và điểm kinh nghiệm (XP).
- **Sao lưu & Phục hồi**: Xuất/nhập dữ liệu dưới dạng JSON, hỗ trợ Reset dữ liệu sạch sẽ.

---

## 2. Cấu trúc thư mục dự án

```text
app_lear/
├── app/                              # Next.js 14 App Router
│   ├── globals.css                   # Tailwind styles, font variables & animations
│   ├── layout.tsx                    # Root layout (Fonts Nunito, Noto Sans SC, Navbar, Footer)
│   ├── page.tsx                      # Trang chủ (Lời chào, Streak, 3 Level Cards, Ôn từ sai)
│   ├── levels/
│   │   └── [levelId]/page.tsx        # Danh sách chủ đề & đề thi của từng cấp độ
│   ├── practice/
│   │   ├── [examId]/page.tsx         # Trình làm bài tương tác (Timer, QuestionPalette, 8 dạng)
│   │   └── [examId]/result/
│   │       └── [attemptId]/page.tsx  # Trang kết quả (Điểm số, Pháo giấy, Xem giải thích chi tiết)
│   ├── level-test/
│   │   └── [levelId]/page.tsx        # Bài kiểm tra lên cấp (40 câu, tính năng mở khóa cấp mới)
│   ├── placement-test/page.tsx       # Bài kiểm tra phân loại đầu vào (30 câu)
│   ├── mistakes/page.tsx             # Sổ lỗi sai thông minh (Theo dõi câu sai & Đã thuộc)
│   ├── history/page.tsx              # Lịch sử các lần làm bài
│   ├── stats/page.tsx                # Thống kê tiến độ & Biểu đồ Recharts
│   ├── sources/page.tsx              # Nguồn học liệu chính thống (Hanban, BLCU)
│   └── profile/page.tsx              # Hồ sơ người học (Đổi tên, Huy hiệu, Xuất/Nhập JSON, Reset)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Thanh điều hướng trên cùng (Desktop & Mobile header)
│   │   ├── BottomNav.tsx             # Thanh điều hướng dưới màn hình cho Mobile
│   │   └── Footer.tsx                # Chân trang với họa tiết văn hóa truyền thống
│   ├── ui/
│   │   ├── ChineseDecoration.tsx     # Các họa tiết SVG mây, hoa mai, lồng đèn, con dấu
│   │   └── Confetti.tsx              # Hiệu ứng pháo giấy ăn mừng
│   └── charts/
│       ├── ScoreHistoryChart.tsx     # Biểu đồ điểm số qua thời gian
│       └── TopicAccuracyChart.tsx    # Biểu đồ độ chính xác theo chủ đề
├── features/
│   └── quiz/                         # Các component câu hỏi & logic bài thi
│       ├── AudioButton.tsx           # Nút phát âm Web Speech API (tốc độ thường & chậm)
│       ├── WordOrderQuestion.tsx     # Dạng 1: Xếp câu kiểu Duolingo
│       ├── MultipleChoiceQuestion.tsx# Dạng 2: Trắc nghiệm chọn nghĩa
│       ├── FillInBlankQuestion.tsx   # Dạng 3: Điền từ vào chỗ trống
│       ├── MatchingQuestion.tsx      # Dạng 4: Nối cặp từ Hán - Việt
│       ├── ListenChoiceQuestion.tsx  # Dạng 5: Nghe và chọn đáp án
│       ├── ListenWordOrderQuestion.tsx# Dạng 6: Nghe và xếp lại câu
│       ├── PinyinChoiceQuestion.tsx  # Dạng 7: Chọn Pinyin chuẩn
│       ├── ShortTranslateQuestion.tsx# Dạng 8: Dịch câu ngắn linh hoạt
│       ├── QuizRenderer.tsx          # Dispatcher điều hướng hiển thị câu hỏi
│       ├── QuestionPalette.tsx       # Bảng ma trận danh sách câu hỏi
│       └── QuizTimer.tsx             # Đồng hồ đếm giờ bật/tắt được
├── data/
│   └── mock/                         # Dữ liệu ngân hàng câu hỏi
│       ├── levels.ts                 # Định nghĩa 3 cấp độ HSK
│       ├── topics.ts                 # Danh mục các chủ đề
│       ├── vocabulary.ts             # Từ vựng HSK cốt lõi
│       ├── level-tests.ts            # Bộ sinh đề thi lên cấp & xếp lớp
│       └── exams/
│           ├── basic.ts              # 16 đề cấp Cơ bản (HSK 1-2)
│           ├── intermediate.ts       # 16 đề cấp Trung cấp (HSK 3-4)
│           └── advanced.ts           # 12 đề cấp Nâng cao (HSK 5-6)
├── services/                         # Lớp dịch vụ (Service Layer)
│   ├── types.ts                      # Interface IRepository chuẩn
│   ├── localRepository.ts            # Cài đặt Local (Mock data + LocalStorage version hanyu:v1)
│   ├── remoteRepository.ts           # Chữ ký hàm sẵn sàng kết nối API Backend
│   └── index.ts                      # Xuất repository dựa trên biến môi trường
├── store/
│   ├── useUserStore.ts               # Zustand store lưu trữ UserProfile & Progress
│   └── useQuizDraftStore.ts          # Zustand store lưu nháp bài đang làm (F5 không mất)
├── types/
│   └── index.ts                      # Toàn bộ kiểu TypeScript chặt chẽ
├── lib/
│   ├── grading.ts                    # Hàm chấm điểm linh hoạt cho 8 dạng câu hỏi
│   ├── speech.ts                     # Web Speech API wrapper hỗ trợ giọng zh-CN
│   ├── sound.ts                      # Bộ hiệu ứng âm thanh Web Audio API (không cần file mp3 ngoài)
│   ├── shuffle.ts                    # Thuật toán Fisher-Yates xáo trộn mảng
│   └── utils.ts                      # Helper format thời gian, ngày tháng, cn
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 3. Hướng dẫn cài đặt và chạy dự án

### Yêu cầu môi trường:
- Node.js version 18 trở lên (khuyên dùng Node 18, 20 hoặc 22+).
- Trình duyệt hiện đại hỗ trợ Web Speech API (Google Chrome, Microsoft Edge, Safari, Firefox).

### Các bước thực hiện:

1. **Cài đặt các gói phụ thuộc**:
   ```bash
   npm install
   ```

2. **Chạy máy chủ phát triển (Dev server)**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: `http://localhost:3000`

3. **Kiểm tra biên dịch sản phẩm (Production build)**:
   ```bash
   npm run build
   npm run start
   ```

---

## 4. Hướng dẫn thêm đề mới vào `data/mock/`

Để bổ sung thêm một đề thi mới vào hệ thống:

1. Mở file đề tương ứng theo cấp độ trong `data/mock/exams/` (ví dụ `basic.ts` nếu là HSK 1-2, `intermediate.ts` nếu là HSK 3-4, hoặc `advanced.ts` nếu là HSK 5-6).
2. Thêm một đối tượng `Exam` mới vào mảng xuất khẩu:

```typescript
{
  id: "basic-chao-hoi-5",
  topicId: "basic-chao-hoi",
  levelId: "basic",
  title: "Luyện tập chào hỏi nâng cao",
  description: "Bổ sung mẫu câu chào hỏi và cảm ơn mở rộng.",
  questions: [
    {
      id: "b-ch-5-1",
      type: "word_order", // Một trong 8 dạng câu hỏi
      hskLevel: 1,
      topicId: "basic-chao-hoi",
      tags: ["chào_hỏi", "giao_tiếp"],
      prompt: "Sắp xếp các từ thành câu: 'Rất vui được quen bạn.'",
      tiles: ["很高兴", "认识", "你", "。"],
      correctAnswer: ["很高兴", "认识", "你", "。"],
      explanation: "很高兴 (rất vui) đứng trước động từ 认识 (quen biết).",
      pinyin: "Hěn gāoxìng rènshi nǐ.",
      chineseText: "很高兴认识你。",
    },
    // Thêm các câu hỏi tiếp theo...
  ]
}
```

Hệ thống sẽ tự động cập nhật số lượng đề, tiến độ mở khóa cấp độ và ngân hàng câu hỏi mà không cần can thiệp vào mã nguồn giao diện.

---

## 5. Hướng dẫn chuyển sang Backend thật (Remote Repository)

Kiến trúc dự án áp dụng mô hình **Repository Pattern**. Toàn bộ các trang và component giao diện chỉ giao tiếp thông qua interface `IRepository` trong `services/types.ts`:

1. Mở file `services/remoteRepository.ts`.
2. Điền logic gọi API thật (dùng `fetch` hoặc `axios`) vào các phương thức đã được định nghĩa sẵn chữ ký hàm (ví dụ `getLevels()`, `submitAttempt()`, `getMistakes()`...).
3. Trong file `.env.local`, chỉ định nguồn dữ liệu chuyển sang remote:
   ```env
   NEXT_PUBLIC_DATA_SOURCE=remote
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1
   ```
4. Giao diện người dùng sẽ tự động sử dụng API từ máy chủ từ xa mà không cần thay đổi bất kỳ dòng mã nào trên giao diện!
