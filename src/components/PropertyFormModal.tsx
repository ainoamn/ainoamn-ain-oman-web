import React, { useState, useEffect } from "react";
import type { Property, Unit } from "@/types/property";
import { resolveSrc } from "@/utils/files";

interface PropertyFormModalProps {
  property: Property | null;
  onSave: (property: Property) => void;
  onClose: () => void;
}

export default function PropertyFormModal({ property, onSave, onClose }: PropertyFormModalProps) {
  const [formData, setFormData] = useState<Property | null>(property);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [units, setUnits] = useState<Unit[]>(property?.units || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleUnitChange = (index: number, key: keyof Unit, value: any) => {
    const newUnits = [...units];
    (newUnits[index] as any)[key] = value;
    setUnits(newUnits);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const addUnit = () => {
    setUnits([...units, { id: Date.now().toString(), unitNo: "", status: "vacant", images: [] }]);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    const finalData = { ...formData, units };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">{property ? 'تعديل العقار' : 'إضافة عقار جديد'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Property Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">اسم العقار:</label>
              <input
                type="text"
                name="name"
                value={formData?.name || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">العنوان:</label>
              <input
                type="text"
                name="address"
                value={formData?.address || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">صورة العقار الرئيسية:</label>
            <input type="file" onChange={handleImageFileChange} className="w-full p-2 border border-gray-300 rounded-md" />
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Property Preview" className="mt-4 w-48 h-48 object-cover rounded-md" />
            ) : (
              formData?.image && <img src={resolveSrc(formData.image)} alt="Property Preview" className="mt-4 w-48 h-48 object-cover rounded-md" />
            )}
          </div>

          <section>
            <h2 className="text-xl font-bold mb-4">الوحدات السكنية</h2>
            {units.map((unit, index) => (
              <div key={unit.id} className="bg-gray-100 p-4 rounded-md mb-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">وحدة رقم {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">رقم الوحدة:</label>
                    <input
                      type="text"
                      value={unit.unitNo}
                      onChange={(e) => handleUnitChange(index, "unitNo", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">حالة الوحدة:</label>
                    <select
                      value={unit.status}
                      onChange={(e) => handleUnitChange(index, "status", e.target.value as "vacant" | "rented")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="vacant">متاح</option>
                      <option value="rented">مؤجر</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 font-semibold mb-2">صور الوحدة:</label>
                  <input type="file" multiple className="w-full p-2 border border-gray-300 rounded-md" />
                  {/* Image previews would go here */}
                </div>
                <button type="button" onClick={() => removeUnit(index)} className="mt-4 bg-red-500 text-white py-1 px-3 rounded-md text-sm hover:bg-red-600 transition-colors">
                  حذف الوحدة
                </button>
              </div>
            ))}
            <button type="button" onClick={addUnit} className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
              إضافة وحدة سكنية
            </button>
          </section>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
              {property ? 'حفظ التغييرات' : 'إضافة العقار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
