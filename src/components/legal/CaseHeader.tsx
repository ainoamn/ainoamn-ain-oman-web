// src/components/legal/CaseHeader.tsx
import React from "react";
export default function CaseHeader({ title }: { title: string }) {
  return (
    <header className="border-b pb-4 mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
