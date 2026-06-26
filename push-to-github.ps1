$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host ".next deleted"
} else {
    Write-Host ".next not found"
}

if (-not (Test-Path .git)) {
    git init -b main
}

$originUrl = "https://github.com/davydovavic002-cmyk/aurahair.git"
$remote = git remote 2>$null | Where-Object { $_ -eq "origin" }
if (-not $remote) {
    git remote add origin $originUrl
} else {
    $currentUrl = git remote get-url origin 2>$null
    if ($currentUrl -ne $originUrl) {
        git remote set-url origin $originUrl
    }
}

git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "Initial commit: Aura Hair landing page"
}

git push -u origin main
