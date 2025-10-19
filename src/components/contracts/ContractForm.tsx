import { useState } from "react";
import { useForm } from "react-hook-form";
import { createContract } from "@/lib/contracts";

interface ContractFormData {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentFrequency: "monthly" | "quarterly" | "yearly";
  terms: string;
}

export default function ContractForm({ property, onSuccess }: { property: any; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContractFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ContractFormData) => {
    setIsSubmitting(true);
    try {
      await createContract({
        ...data,
        propertyId: property.id,
        status: "draft"
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating contract:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">تاريخ البدء</label>
          <input
            type="date"
            {...register("startDate", { required: "تاريخ البدء مطلوب" })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">تاريخ الانتهاء</label>
          <input
            type="date"
            {...register("endDate", { required: "تاريخ الانتهاء مطلوب" })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">قيمة الإيجار (ر.ع)</label>
          <input
            type="number"
            step="0.001"
            {...register("rentAmount", { 
              required: "قيمة الإيجار مطلوبة",
              min: { value: 1, message: "يجب أن تكون قيمة الإيجار أكبر من الصفر" }
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
          {errors.rentAmount && <p className="text-red-500 text-sm">{errors.rentAmount.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">فترة الدفع</label>
          <select
            {...register("paymentFrequency", { required: "فترة الدفع مطلوبة" })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="monthly">شهري</option>
            <option value="quarterly">ربع سنوي</option>
            <option value="yearly">سنوي</option>
          </select>
          {errors.paymentFrequency && <p className="text-red-500 text-sm">{errors.paymentFrequency.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">الشروط والأحكام</label>
        <textarea
          rows={4}
          {...register("terms", { required: "الشروط والأحكام مطلوبة" })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="أدخل الشروط والأحكام الخاصة بالعقد..."
        />
        {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
      >
        {isSubmitting ? "جاري الإنشاء..." : "إنشاء عقد"}
      </button>
    </form>
  );
}
