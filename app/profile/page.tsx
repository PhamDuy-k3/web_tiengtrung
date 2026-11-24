"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Award,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  Flame,
  Sparkles,
} from "lucide-react";
import { repository } from "@/services";
import { UserProfile } from "@/types";
import { useUserStore } from "@/store/useUserStore";

export default function ProfilePage() {
  const { profile, isHydrated, loadProfile, updateName } = useUserStore();

  const [inputName, setInputName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile?.name) {
      setInputName(profile.name);
    }
  }, [profile]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    await updateName(inputName.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExport = async () => {
    const jsonStr = await repository.exportData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hanyu_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const success = await repository.importData(text);
      if (success) {
        setImportStatus("Nhập dữ liệu thành công!");
        await loadProfile();
      } else {
        setImportStatus("Tệp dữ liệu không hợp lệ hoặc bị lỗi.");
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    await repository.resetData();
    await loadProfile();
    setShowResetModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-cream-300 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal flex items-center gap-2">
          <User className="text-coral" size={28} />
          <span>Hồ sơ người học & Quản lý dữ liệu</span>
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/60">
          Tùy chỉnh thông tin cá nhân, xem huy hiệu đã đạt và sao lưu/khôi phục tiến trình
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-6">
        <form onSubmit={handleSaveName} className="space-y-4">
          <h2 className="text-lg font-bold text-charcoal">Thông tin người học</h2>
          <div>
            <label className="block text-xs font-bold text-charcoal/60 uppercase mb-2">
              Tên hiển thị (không cần mật khẩu)
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                className="flex-1 p-3.5 rounded-2xl border-2 border-cream-300 focus:border-coral focus:ring-4 focus:ring-coral/10 outline-none text-base font-bold text-charcoal"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-sm shadow-duo-coral active:translate-y-1 transition-all flex items-center gap-1.5"
              >
                {isSaved ? <Check size={18} /> : null}
                <span>{isSaved ? "Đã lưu!" : "Lưu thay đổi"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick summary badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-cream-200">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <div className="text-xs text-amber-800 font-bold">Chuỗi học tập</div>
            <div className="text-xl font-black text-amber-600 mt-1 flex items-center justify-center gap-1">
              <Flame size={20} className="fill-amber-500" />
              <span>{isHydrated ? profile?.streak || 1 : 1} ngày</span>
            </div>
          </div>

          <div className="p-3 bg-coral/10 rounded-2xl border border-coral/20 text-center">
            <div className="text-xs text-coral-dark font-bold">Điểm tích lũy</div>
            <div className="text-xl font-black text-coral mt-1 flex items-center justify-center gap-1">
              <Sparkles size={18} />
              <span>{isHydrated ? profile?.totalXp || 50 : 50} XP</span>
            </div>
          </div>

          <div className="p-3 bg-mint-light/60 rounded-2xl border border-mint/30 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-mint-dark font-bold">Cấp đã mở khóa</div>
            <div className="text-xl font-black text-mint-dark mt-1">
              {isHydrated ? profile?.unlockedLevels.length || 1 : 1} / 3 cấp
            </div>
          </div>
        </div>
      </div>

      {/* Badges Collection Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Award className="text-amber-600" size={20} />
            <span>Bộ sưu tập Huy hiệu ({profile?.badges?.length || 0})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {profile?.badges?.map((badge) => (
            <div
              key={badge.id}
              className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-start gap-3"
            >
              <div className="text-3xl shrink-0">{badge.icon}</div>
              <div>
                <div className="font-bold text-sm text-charcoal">{badge.name}</div>
                <div className="text-xs text-charcoal/60 mt-0.5 leading-relaxed">
                  {badge.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management: Export / Import / Reset */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-6">
        <h2 className="text-lg font-bold text-charcoal">
          Quản lý & Sao lưu dữ liệu (LocalStorage)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-5 bg-cream-100 rounded-2xl border border-cream-200 space-y-2">
            <h3 className="font-bold text-sm text-charcoal">Xuất dữ liệu dự phòng</h3>
            <p className="text-xs text-charcoal/60">
              Tải toàn bộ lịch sử điểm số, sổ lỗi sai và hồ sơ về máy tính dưới dạng tệp JSON.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl bg-white border border-cream-300 hover:bg-cream-50 font-bold text-xs flex items-center gap-1.5 shadow-sm text-charcoal"
            >
              <Download size={15} />
              <span>Tải file backup JSON</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-5 bg-cream-100 rounded-2xl border border-cream-200 space-y-2">
            <h3 className="font-bold text-sm text-charcoal">Khôi phục từ file</h3>
            <p className="text-xs text-charcoal/60">
              Nhập tệp JSON sao lưu trước đó để khôi phục lại tiến trình học.
            </p>
            <label className="px-4 py-2.5 rounded-xl bg-white border border-cream-300 hover:bg-cream-50 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm text-charcoal cursor-pointer">
              <Upload size={15} />
              <span>Chọn file JSON để phục hồi</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            {importStatus && (
              <div className="text-xs font-bold text-coral">{importStatus}</div>
            )}
          </div>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-red-600">Đặt lại toàn bộ dữ liệu</div>
            <div className="text-xs text-charcoal/50">
              Xóa sạch toàn bộ điểm số, lịch sử làm bài và sổ lỗi sai về trạng thái ban đầu
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs transition-colors"
          >
            Reset dữ liệu
          </button>
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-charcoal">
              Xác nhận xóa toàn bộ dữ liệu?
            </h3>
            <p className="text-sm text-charcoal/70">
              Hành động này sẽ xóa vĩnh viễn tất cả điểm số, sổ lỗi sai và các cấp độ đã mở khóa. Bạn không thể khôi phục nếu chưa tải bản sao lưu JSON.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-2xl bg-cream-200 hover:bg-cream-300 text-charcoal font-bold text-sm"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md"
              >
                Xác nhận xóa hết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
