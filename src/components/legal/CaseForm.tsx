// src/components/legal/CaseForm.tsx
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

type CaseFormData = {
  caseNumber: string;
  title?: string;
  court?: string;
  plaintiff?: string;
  defendant?: string;
  filingDate?: string; // ISO string
};

export default function CaseForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess?: (data: CaseFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormData>({ mode: "onSubmit" });

  const onSubmit: SubmitHandler<CaseFormData> = async (data) => {
    // TODO: أرسل البيانات لـ API إن لزم
    onSubmitSuccess?.(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div>
        <label className="block mb-1 font-medium">رقم القضية</label>
        <input
          className="w-full border rounded px-3 py-2"
          {...register("caseNumber", { required: "رقم القضية مطلوب" })}
        />
        {errors.caseNumber?.message ? (
          <span className="text-red-600 text-sm">
            {String(errors.caseNumber.message)}
          </span>
        ) : null}
      </div>

      <div>
        <label className="block mb-1 font-medium">عنوان القضية</label>
        <input
          className="w-full border rounded px-3 py-2"
          {...register("title")}
        />
        {errors.title?.message ? (
          <span className="text-red-600 text-sm">
            {String(errors.title.message)}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">المحكمة</label>
          <input
            className="w-full border rounded px-3 py-2"
            {...register("court")}
          />
          {errors.court?.message ? (
            <span className="text-red-600 text-sm">
              {String(errors.court.message)}
            </span>
          ) : null}
        </div>

        <div>
          <label className="block mb-1 font-medium">تاريخ القيد</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            {...register("filingDate")}
          />
          {errors.filingDate?.message ? (
            <span className="text-red-600 text-sm">
              {String(errors.filingDate.message)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">المدعي</label>
          <input
            className="w-full border rounded px-3 py-2"
            {...register("plaintiff")}
          />
          {errors.plaintiff?.message ? (
            <span className="text-red-600 text-sm">
              {String(errors.plaintiff.message)}
            </span>
          ) : null}
        </div>

        <div>
          <label className="block mb-1 font-medium">المدعى عليه</label>
          <input
            className="w-full border rounded px-3 py-2"
            {...register("defendant")}
          />
          {errors.defendant?.message ? (
            <span className="text-red-600 text-sm">
              {String(errors.defendant.message)}
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-sky-600 text-white px-4 py-2 disabled:opacity-60"
      >
        {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
