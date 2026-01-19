pkgname=blitz
pkgver=0.1.0
pkgrel=1
pkgdesc="Blitz Tauri desktop application"
arch=('x86_64')
url="https://github.com/your-repo/blitz"
license=('MIT')

depends=('webkit2gtk' 'gtk3' 'libappindicator-gtk3')

source=()
sha256sums=()

package() {
  cd "${startdir}"  # Return to the directory where PKGBUILD is located
  
  install -Dm755 \
    src-tauri/target/release/blitz \
    "$pkgdir/usr/bin/blitz"

  install -Dm644 \
    src-tauri/icons/32x32.png \
    "$pkgdir/usr/share/icons/hicolor/32x32/apps/blitz.png"

  install -Dm644 \
    src-tauri/icons/128x128.png \
    "$pkgdir/usr/share/icons/hicolor/128x128/apps/blitz.png"

  install -Dm644 \
    src-tauri/target/release/bundle/appimage/blitz.AppDir/usr/share/applications/blitz.desktop \
    "$pkgdir/usr/share/applications/$pkgname.desktop"
}