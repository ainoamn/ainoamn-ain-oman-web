import Head from "next/head";
// Header and Footer handled by MainLayout in _app.tsx
import Link from "next/link";
import InstantLink from "@/components/InstantLink";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Property, Unit, ExtraRow } from "@/types/property";
import { resolveSrc } from "@/utils/files";

export default function NewPropertyPage() {
  const router = useRouter();
  const [property, setProperty] = useState<Property>({
    id: "",
    name: "",
    address: "",
    status: "vacant",
    image: "",
    units: [],
    published: false,
    extra: [],
  });

  const [units, setUnits] = useState<Unit[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUnitChange = (index: number, key: keyof Unit, value: any) => {
    const newUnits = [...units];
    (newUnits[index] as any)[key] = value;
    setUnits(newUnits);
  };

  const addUnit = () => {
    setUnits([...units, { id: Date.now().toString(), unitNo: "", status: "vacant", images: [] }]);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to save property
    console.log("Saving new property:", { ...property, units, imageFile });
    router.push("/admin/properties"); // Redirect to the properties list page
  };

  return (
    <>
      <Head>
        <title>إضافة عقار جديد</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-start p-4 bg-gray-100">
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">إضافة عقار جديد</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">اسم العقار:</label>
                <input
                  type="text"
                  name="name"
                  value={property.name}
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
                  value={property.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">صورة العقار الرئيسية:</label>
              <input type="file" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded-md" />
              {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Property Preview" className="mt-4 w-48 h-48 object-cover rounded-md" />}
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
                        onChange={(e) => handleUnitChange(index, "status", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="vacant">متاح</option>
                        <option value="rented">مؤجر</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-2">صور الوحدة:</label>
                    <input type="file" className="w-full p-2 border border-gray-300 rounded-md" />
                    {/* Placeholder for images */}
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

            <div className="flex justify-end gap-4">
              <Link href="/admin/properties" className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                إلغاء
              </Link>
              <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                حفظ العقار
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
