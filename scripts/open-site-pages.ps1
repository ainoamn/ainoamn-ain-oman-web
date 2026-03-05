# فتح الصفحات الرئيسية للموقع في المتصفح
# عدّل $BaseUrl إذا كان الموقع على دومين آخر (مثلاً بعد النشر على Vercel)
$BaseUrl = "https://ain-oman-web.vercel.app"
if ($env:SITE_BASE_URL) { $BaseUrl = $env:SITE_BASE_URL.TrimEnd("/") }

$pages = @(
  "/",
  "/properties",
  "/subscriptions",
  "/auctions",
  "/development/projects",
  "/profile",
  "/dashboard",
  "/login",
  "/admin",
  "/admin/subscriptions",
  "/admin/users",
  "/admin/properties",
  "/admin/bookings",
  "/admin/contracts",
  "/pricing"
)

Write-Host "Opening $($pages.Count) pages with base: $BaseUrl"
foreach ($path in $pages) {
  $url = "$BaseUrl$path"
  Write-Host "  $url"
  Start-Process $url
  Start-Sleep -Milliseconds 400
}

Write-Host "Done."
