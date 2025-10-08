# تحويل جميع التواريخ من الهجري إلى الميلادي
# نسخة مبسطة

Write-Host "🔍 البحث عن ملفات..." -ForegroundColor Cyan

$files = Get-ChildItem -Path src -Include *.ts,*.tsx,*.js,*.jsx -Recurse | Where-Object { $_.FullName -notmatch 'node_modules' }

$updated = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # ar-SA إلى ar
    $content = $content -replace "toLocaleDateString\('ar-SA'", "toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' }"
    $content = $content -replace 'toLocaleDateString\("ar-SA"', 'toLocaleDateString("ar", { calendar: "gregory", numberingSystem: "latn" }'
    
    # ar-OM إلى ar
    $content = $content -replace "toLocaleDateString\('ar-OM'", "toLocaleDateString('ar', { calendar: 'gregory', numberingSystem: 'latn' }"
    $content = $content -replace 'toLocaleDateString\("ar-OM"', 'toLocaleDateString("ar", { calendar: "gregory", numberingSystem: "latn" }'
    
    # toLocaleString
    $content = $content -replace "toLocaleString\('ar-SA'", "toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn' }"
    $content = $content -replace 'toLocaleString\("ar-SA"', 'toLocaleString("ar", { calendar: "gregory", numberingSystem: "latn" }'
    $content = $content -replace "toLocaleString\('ar-OM'", "toLocaleString('ar', { calendar: 'gregory', numberingSystem: 'latn' }"
    $content = $content -replace 'toLocaleString\("ar-OM"', 'toLocaleString("ar", { calendar: "gregory", numberingSystem: "latn" }'
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $updated++
        Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n📊 النتيجة:" -ForegroundColor Cyan
Write-Host "   الملفات المُحدّثة: $updated" -ForegroundColor Green
Write-Host "`n✅ تم!" -ForegroundColor Green

