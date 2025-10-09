# سكريبت لإصلاح استيرادات Layout المكررة

Write-Host "`n🔧 إصلاح استيرادات Layout في جميع الصفحات...`n" -ForegroundColor Cyan

$files = @(
  "src/pages/search.tsx",
  "src/pages/favorites.tsx",
  "src/pages/legal/index.tsx",
  "src/pages/legal/directory.tsx",
  "src/pages/legal/new.tsx",
  "src/pages/inbox/index.tsx",
  "src/pages/manage-properties/index.tsx",
  "src/pages/manage-properties/requests.tsx",
  "src/pages/manage-messages/index.tsx",
  "src/pages/manage-requests/index.tsx",
  "src/pages/settings.tsx",
  "src/pages/reports.tsx",
  "src/pages/billing.tsx"
)

$count = 0

foreach ($file in $files) {
  $fullPath = Join-Path $PSScriptRoot "..\$file"
  
  if (Test-Path $fullPath) {
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    
    # إزالة استيراد Layout
    $content = $content -replace "import Layout from ['\`"]@\/components\/layout\/Layout['\`"];?\r?\n?", ""
    $content = $content -replace "import Layout from ['\`"]..\/..\/components\/layout\/Layout['\`"];?\r?\n?", ""
    
    # استبدال <Layout> بـ <>
    $content = $content -replace "<Layout>", "<>"
    $content = $content -replace "</Layout>", "</>"
    
    # حفظ الملف
    Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
    
    $count++
    Write-Host "✅ $file - تم الإصلاح" -ForegroundColor Green
  } else {
    Write-Host "⚠️ $file - غير موجود" -ForegroundColor Yellow
  }
}

Write-Host "`n✅ تم إصلاح $count ملف بنجاح!`n" -ForegroundColor Green

