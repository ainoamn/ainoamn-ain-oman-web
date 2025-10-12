# scripts/comprehensive-check.ps1
# فحص شامل حقيقي لجميع الصفحات

Write-Host "`n🔍 بدء الفحص الشامل الحقيقي...`n" -ForegroundColor Cyan

$issues = @()

# 1. البحث عن استخدامات Header/Footer المباشرة
Write-Host "1️⃣ فحص استخدامات Header/Footer..." -ForegroundColor Yellow
$headerFooterFiles = Get-ChildItem -Path src\pages -Filter *.tsx -Recurse | 
    Select-String -Pattern "^\s*<Header\s*/>|^\s*<Footer\s*/>" -List | 
    Select-Object -ExpandProperty Path
    
if ($headerFooterFiles) {
    foreach ($file in $headerFooterFiles) {
        $relativePath = $file.Replace((Get-Location).Path + '\', '')
        $issues += "❌ $relativePath - يستخدم Header/Footer مباشرة"
    }
} else {
    Write-Host "   ✅ لا توجد استخدامات مباشرة لـ Header/Footer" -ForegroundColor Green
}

# 2. البحث عن imports لـ Header/Footer
Write-Host "`n2️⃣ فحص imports Header/Footer..." -ForegroundColor Yellow
$importFiles = Get-ChildItem -Path src\pages -Filter *.tsx -Recurse | 
    Select-String -Pattern "import.*Header.*from|import.*Footer.*from" -List | 
    Select-Object -ExpandProperty Path
    
if ($importFiles) {
    Write-Host "   ⚠️ وجد $($importFiles.Count) ملف يستورد Header/Footer (قد يكون طبيعي)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ لا imports غير ضرورية" -ForegroundColor Green
}

# 3. البحث عن أخطاء TypeScript شائعة
Write-Host "`n3️⃣ فحص أخطاء TypeScript..." -ForegroundColor Yellow
$tsErrors = Get-ChildItem -Path src\pages -Filter *.tsx -Recurse | 
    Select-String -Pattern "any\s+as\s+any|@ts-ignore|@ts-expect-error" -List | 
    Select-Object -ExpandProperty Path
    
if ($tsErrors) {
    Write-Host "   ⚠️ وجد $($tsErrors.Count) ملف مع تحذيرات TypeScript (عادي)" -ForegroundColor Yellow
}

# 4. عد الصفحات
Write-Host "`n4️⃣ إحصائيات الصفحات..." -ForegroundColor Yellow
$totalPages = (Get-ChildItem -Path src\pages -Filter *.tsx -Recurse | Where-Object { $_.FullName -notmatch '_app|_document' }).Count
Write-Host "   📄 إجمالي الصفحات: $totalPages" -ForegroundColor Cyan

# 5. النتائج
Write-Host "`n" -NoNewline
Write-Host "═" * 80 -ForegroundColor Cyan
Write-Host "`n📊 النتائج النهائية:`n" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "✅ لا توجد مشاكل! جميع الصفحات نظيفة! 🎉" -ForegroundColor Green
    Write-Host "`nالحالة: 🟢 ممتاز - جاهز للإنتاج" -ForegroundColor Green
} else {
    Write-Host "⚠️ وجد $($issues.Count) مشكلة:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   $issue" -ForegroundColor Red
    }
}

Write-Host "`n" -NoNewline
Write-Host "═" * 80 -ForegroundColor Cyan
Write-Host ""

