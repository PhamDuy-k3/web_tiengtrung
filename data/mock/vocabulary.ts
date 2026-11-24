export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  hskLevel: number;
  partOfSpeech: string;
  exampleZh: string;
  exampleVn: string;
}

export const mockVocabulary: VocabularyItem[] = [
  // HSK 1
  {
    id: "v-hsk1-1",
    hanzi: "你好",
    pinyin: "nǐ hǎo",
    vietnamese: "Xin chào",
    hskLevel: 1,
    partOfSpeech: "thán từ",
    exampleZh: "你好，很高兴认识你！",
    exampleVn: "Xin chào, rất vui được làm quen với bạn!",
  },
  {
    id: "v-hsk1-2",
    hanzi: "谢谢",
    pinyin: "xièxie",
    vietnamese: "Cảm ơn",
    hskLevel: 1,
    partOfSpeech: "động từ",
    exampleZh: "太谢谢你的帮助了。",
    exampleVn: "Rất cảm ơn sự giúp đỡ của bạn.",
  },
  {
    id: "v-hsk1-3",
    hanzi: "老师",
    pinyin: "lǎoshī",
    vietnamese: "Thầy/Cô giáo",
    hskLevel: 1,
    partOfSpeech: "danh từ",
    exampleZh: "王老师教我们汉语。",
    exampleVn: "Thầy Vương dạy chúng tôi tiếng Trung.",
  },
  {
    id: "v-hsk1-4",
    hanzi: "学生",
    pinyin: "xuésheng",
    vietnamese: "Học sinh, sinh viên",
    hskLevel: 1,
    partOfSpeech: "danh từ",
    exampleZh: "我是河内大学的学生。",
    exampleVn: "Tôi là sinh viên trường Đại học Hà Nội.",
  },
  {
    id: "v-hsk1-5",
    hanzi: "中国",
    pinyin: "Zhōngguó",
    vietnamese: "Trung Quốc",
    hskLevel: 1,
    partOfSpeech: "danh từ riêng",
    exampleZh: "他下个月去中国旅游。",
    exampleVn: "Tháng sau anh ấy đi Trung Quốc du lịch.",
  },
  // HSK 2
  {
    id: "v-hsk2-1",
    hanzi: "便宜",
    pinyin: "piányi",
    vietnamese: "Rẻ",
    hskLevel: 2,
    partOfSpeech: "tính từ",
    exampleZh: "这件衣服又好看又便宜。",
    exampleVn: "Bộ quần áo này vừa đẹp vừa rẻ.",
  },
  {
    id: "v-hsk2-2",
    hanzi: "准备",
    pinyin: "zhǔnbèi",
    vietnamese: "Chuẩn bị",
    hskLevel: 2,
    partOfSpeech: "động từ",
    exampleZh: "你准备好考试了吗？",
    exampleVn: "Bạn đã chuẩn bị tốt cho kỳ thi chưa?",
  },
  {
    id: "v-hsk2-3",
    hanzi: "运动",
    pinyin: "yùndòng",
    vietnamese: "Vận động, thể thao",
    hskLevel: 2,
    partOfSpeech: "danh từ/động từ",
    exampleZh: "多运动对身体好。",
    exampleVn: "Vận động nhiều rất tốt cho sức khỏe.",
  },
  // HSK 3
  {
    id: "v-hsk3-1",
    hanzi: "解决",
    pinyin: "jiějué",
    vietnamese: "Giải quyết",
    hskLevel: 3,
    partOfSpeech: "động từ",
    exampleZh: "这个问题很难解决。",
    exampleVn: "Vấn đề này rất khó giải quyết.",
  },
  {
    id: "v-hsk3-2",
    hanzi: "热情",
    pinyin: "rèqíng",
    vietnamese: "Nhiệt tình",
    hskLevel: 3,
    partOfSpeech: "tính từ",
    exampleZh: "这里的服务员很热情。",
    exampleVn: "Nhân viên phục vụ ở đây rất nhiệt tình.",
  },
  // HSK 4
  {
    id: "v-hsk4-1",
    hanzi: "坚持",
    pinyin: "jiānchí",
    vietnamese: "Kiên trì",
    hskLevel: 4,
    partOfSpeech: "động từ",
    exampleZh: "只要坚持，就一定会成功。",
    exampleVn: "Chỉ cần kiên trì thì nhất định sẽ thành công.",
  },
  {
    id: "v-hsk4-2",
    hanzi: "严格",
    pinyin: "yángé",
    vietnamese: "Nghiêm khắc, chặt chẽ",
    hskLevel: 4,
    partOfSpeech: "tính từ",
    exampleZh: "王经理对工作要求非常严格。",
    exampleVn: "Giám đốc Vương yêu cầu rất nghiêm khắc với công việc.",
  },
  // HSK 5
  {
    id: "v-hsk5-1",
    hanzi: "投资",
    pinyin: "tóuzī",
    vietnamese: "Đầu tư",
    hskLevel: 5,
    partOfSpeech: "động từ/danh từ",
    exampleZh: "投资教育是明智的选择。",
    exampleVn: "Đầu tư vào giáo dục là sự lựa chọn sáng suốt.",
  },
  {
    id: "v-hsk5-2",
    hanzi: "措施",
    pinyin: "cuòshī",
    vietnamese: "Biện pháp",
    hskLevel: 5,
    partOfSpeech: "danh từ",
    exampleZh: "政府采取了积极的环保措施。",
    exampleVn: "Chính phủ đã áp dụng những biện pháp bảo vệ môi trường tích cực.",
  },
  // HSK 6
  {
    id: "v-hsk6-1",
    hanzi: "精益求精",
    pinyin: "jīng yì qiú jīng",
    vietnamese: "Đã tinh xảo càng muốn tinh xảo hơn (luôn phấn đấu hoàn hảo)",
    hskLevel: 6,
    partOfSpeech: "thành ngữ",
    exampleZh: "他在工艺制作上始终精益求精。",
    exampleVn: "Anh ấy trong kỹ thuật chế tác luôn luôn phấn đấu hoàn hảo hơn.",
  },
];
