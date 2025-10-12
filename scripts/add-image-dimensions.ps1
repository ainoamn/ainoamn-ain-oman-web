# Script to add width/height to all InstantImage components
# Ain Oman Web - Fix Image Dimensions

Write-Host "🖼️  إضافة width/height لجميع الصور..." -ForegroundColor Green
Write-Host ""

$filesFixed = 0

# List of files with InstantImage
$files = @(
    "src\components\layout\Header.tsx",
    "src\pages\favorites.tsx",
    "src\pages\properties\index.tsx",
    "src\pages\partners\index.tsx",
    "src\pages\auctions\index.tsx",
    "src\pages\settings.tsx",
    "src\pages\properties\unified-management.tsx",
    "src\pages\properties\new.tsx",
    "src\pages\dashboard\auctions\index.tsx",
    "src\pages\booking\new.tsx",
    "src\pages\auth\verify.tsx",
    "src\pages\auctions\add.tsx",
    "src\pages\admin\header-footer.tsx",
    "src\pages\admin\properties\index.tsx",
    "src\components\PropertyFormModal.tsx",
    "src\components\properties\VirtualTour.tsx",
    "src\components\partners\PartnerCard.tsx",
    "src\components\legal\PrintExport.tsx",
    "src\components\layout\EnhancedHeader.tsx",
    "src\components\layout\EnhancedFooter.tsx",
    "src\components\badges\Badge.tsx",
    "src\pages\admin\bookings\[id].tsx",
    "src\components\properties\PropertyCard.tsx"
)

foreach ($filePath in $files) {
    if (Test-Path $filePath) {
        try {
            $content = Get-Content $filePath -Encoding UTF8 | Out-String
            $originalContent = $content
            
            # Pattern: InstantImage without width/height
            # Add default dimensions based on className patterns
            
            # w-12 h-12 (48x48)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-12\s+h-12[^"]*"[^>]*?)(/>|>)', '$1 width={48} height={48}$2'
            
            # w-8 h-8 (32x32)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-8\s+h-8[^"]*"[^>]*?)(/>|>)', '$1 width={32} height={32}$2'
            
            # w-16 h-16 (64x64)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-16\s+h-16[^"]*"[^>]*?)(/>|>)', '$1 width={64} height={64}$2'
            
            # w-20 h-20 (80x80)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-20\s+h-20[^"]*"[^>]*?)(/>|>)', '$1 width={80} height={80}$2'
            
            # w-24 h-24 (96x96)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-24\s+h-24[^"]*"[^>]*?)(/>|>)', '$1 width={96} height={96}$2'
            
            # w-32 h-32 (128x128)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-32\s+h-32[^"]*"[^>]*?)(/>|>)', '$1 width={128} height={128}$2'
            
            # w-full h-48 (full x 192)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-full\s+h-48[^"]*"[^>]*?)(/>|>)', '$1 width={800} height={192}$2'
            
            # w-full h-64 (full x 256)
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)[^>]*?className="[^"]*w-full\s+h-64[^"]*"[^>]*?)(/>|>)', '$1 width={800} height={256}$2'
            
            # Default for any remaining without dimensions
            $content = $content -replace '(<InstantImage\s+(?![^>]*\bwidth=)(?![^>]*\bheight=)[^>]*?)(/>|>)', '$1 width={400} height={300}$2'
            
            if ($content -ne $originalContent) {
                Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
                $filesFixed++
                Write-Host "✅ $filePath" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠️  $filePath : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "✅ تم إضافة width/height لـ $filesFixed ملف" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

