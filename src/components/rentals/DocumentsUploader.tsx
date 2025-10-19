// src/components/rentals/DocumentsUploader.tsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { DocKind } from "@/types/rentals";

interface DocumentsUploaderProps {
  rentalId: string;
  onUploadComplete?: (doc: any) => void;
}

export default function DocumentsUploader({ rentalId, onUploadComplete }: DocumentsUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedKind, setSelectedKind] = useState<DocKind>("id");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`/api/rentals/docs/upload?rentalId=${rentalId}&kind=${selectedKind}`, {
        method: "POST",
        body: formData,
      });
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (response.ok) {
        const result = await response.json();
        if (onUploadComplete) {
          onUploadComplete(result.doc);
        }
        
        // عرض مؤقت للنجاح
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      setUploadProgress(0);
      alert("فشل في رفع الملف");
    }
  }, [rentalId, selectedKind, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"]
    },
    disabled: uploading,
    multiple: false
  });

  const docTypes = [
    { value: "id", label: "الهوية الوطنية" },
    { value: "passport", label: "جواز السفر" },
    { value: "cr", label: "السجل التجاري" },
    { value: "iban", label: "الحساب البنكي" },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">رفع المستندات</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">نوع المستند</label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value as DocKind)}
          disabled={uploading}
        >
          {docTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div 
                className="bg-blue-600 h-2.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-600">جاري رفع الملف ومعالجته...</p>
          </div>
        ) : (
          <>
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-1 text-sm text-gray-600">
              {isDragActive ? "أفلت الملف هنا" : "اسحب وأفلت الملف هنا أو انقر للاختيار"}
            </p>
            <p className="text-xs text-gray-500">PDF, PNG, JPG حتى 10MB</p>
          </>
        )}
      </div>
      
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-blue-50 rounded-md"
          >
            <p className="text-sm text-blue-700">جاري معالجة المستند باستخدام الذكاء الاصطناعي...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
