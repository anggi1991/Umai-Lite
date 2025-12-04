#!/usr/bin/env bash
set -euo pipefail

# Simple logger
log() { echo "[supabase-install] $*"; }

# Check existing
if command -v supabase >/dev/null 2>&1; then
  log "Supabase CLI already installed at: $(command -v supabase)"
  supabase --version || true
  exit 0
fi

log "Supabase CLI not found. Installing official CLI..."

# Try Homebrew (Linuxbrew) if available
if command -v brew >/dev/null 2>&1; then
  log "Homebrew detected. Installing via brew..."
  brew install supabase/tap/supabase
  log "Installed via Homebrew."
  supabase --version || true
  exit 0
fi

# Determine OS/ARCH for release asset name
OS="$(uname -s)"
ARCH="$(uname -m)"

# Normalize values expected by Supabase release assets
case "$OS" in
  Linux) os_name="linux" ;;
  Darwin) os_name="darwin" ;;
  *) log "Unsupported OS: $OS"; exit 1 ;;
esac

case "$ARCH" in
  x86_64|amd64) arch_name="amd64" ;;
  aarch64|arm64) arch_name="arm64" ;;
  *) log "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Compose download URL for latest release
# Note: Uses "latest" redirect — GitHub will serve the latest release assets.
asset_name="supabase_${os_name}_${arch_name}.tar.gz"
download_url="https://github.com/supabase/cli/releases/latest/download/${asset_name}"

tmp_dir="$(mktemp -d)"
tarball_path="${tmp_dir}/${asset_name}"

log "Downloading ${asset_name} from GitHub releases..."
if ! curl -fsSL -o "${tarball_path}" "${download_url}"; then
  log "Download failed. Possible reasons: asset name mismatch or no network."
  log "Please check releases: https://github.com/supabase/cli/releases"
  rm -rf "${tmp_dir}"
  exit 1
fi

log "Extracting..."
tar -xzf "${tarball_path}" -C "${tmp_dir}"

# The tarball should contain a file named `supabase` (binary)
if [ ! -x "${tmp_dir}/supabase" ]; then
  # If binary exists but not marked executable, set it
  if [ -f "${tmp_dir}/supabase" ]; then
    chmod +x "${tmp_dir}/supabase"
  else
    log "Expected binary 'supabase' not found inside archive. Listing contents for debugging:"
    tar -tzf "${tarball_path}"
    rm -rf "${tmp_dir}"
    exit 1
  fi
fi

# Destination
dest="/usr/local/bin/supabase"

# Try move with sudo if necessary
if mv "${tmp_dir}/supabase" "${dest}" 2>/dev/null; then
  log "Moved supabase to ${dest}"
else
  log "Permission required to move binary to ${dest}. Trying with sudo..."
  if command -v sudo >/dev/null 2>&1; then
    sudo mv "${tmp_dir}/supabase" "${dest}"
    sudo chmod +x "${dest}"
    log "Installed supabase to ${dest} using sudo."
  else
    log "sudo not available. You can move the file manually:"
    echo "  sudo mv ${tmp_dir}/supabase ${dest} && sudo chmod +x ${dest}"
    log "Temporary binary available at ${tmp_dir}/supabase"
    exit 1
  fi
fi

# Cleanup
rm -rf "${tmp_dir}"

# Verify
if command -v supabase >/dev/null 2>&1; then
  log "Installation complete. Version:"
  supabase --version || true
  log "Binary location: $(command -v supabase)"
  exit 0
else
  log "Installation finished but 'supabase' not in PATH. You may need to add /usr/local/bin to your PATH."
  echo 'Add to PATH (bash/zsh): export PATH="/usr/local/bin:$PATH"'
  exit 1
fi
