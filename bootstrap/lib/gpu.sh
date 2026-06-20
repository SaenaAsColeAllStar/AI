#!/usr/bin/env bash
# Teknovo AI Workstation — GPU detection (NVIDIA, AMD, PCI fallback)
# Priority: nvidia-smi → rocm-smi → lspci → lshw
# Never fails install when detection tools are missing — warns and continues.

GPU_VENDOR=""
GPU_NAME=""
GPU_VRAM=""
GPU_METHOD=""
GPU_DETECTED="false"

detect_gpu() {
  GPU_VENDOR=""
  GPU_NAME=""
  GPU_VRAM=""
  GPU_METHOD=""
  GPU_DETECTED="false"

  if command_exists nvidia-smi; then
    GPU_METHOD="nvidia-smi"
    GPU_VENDOR="nvidia"
    GPU_NAME="$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1 || echo "NVIDIA GPU")"
    GPU_VRAM="$(nvidia-smi --query-gpu=memory.total --format=csv,noheader 2>/dev/null | head -1 || echo "unknown")"
    GPU_DETECTED="true"
    return 0
  fi

  if command_exists rocm-smi; then
    GPU_METHOD="rocm-smi"
    GPU_VENDOR="amd"
    GPU_NAME="$(rocm-smi --showproductname 2>/dev/null | grep -m1 'Card series' | sed 's/.*: //' || echo "AMD GPU")"
    GPU_VRAM="$(rocm-smi --showmeminfo vram 2>/dev/null | grep -m1 'Total Memory' | awk '{print $NF}' || echo "unknown")"
    GPU_DETECTED="true"
    return 0
  fi

  if command_exists lspci; then
    GPU_METHOD="lspci"
    local pci_gpu
    pci_gpu="$(lspci 2>/dev/null | grep -iE 'vga|3d|display' | head -1 || true)"
    if [[ -n "${pci_gpu}" ]]; then
      GPU_DETECTED="true"
      if echo "${pci_gpu}" | grep -qi nvidia; then
        GPU_VENDOR="nvidia"
      elif echo "${pci_gpu}" | grep -qiE 'amd|radeon'; then
        GPU_VENDOR="amd"
      elif echo "${pci_gpu}" | grep -qi intel; then
        GPU_VENDOR="intel"
      else
        GPU_VENDOR="unknown"
      fi
      GPU_NAME="${pci_gpu#*: }"
      GPU_VRAM="unknown"
      return 0
    fi
  else
    warn "lspci not available — skipping PCI GPU scan (CPU fallback OK)"
  fi

  if command_exists lshw; then
    GPU_METHOD="lshw"
    local lshw_gpu
    lshw_gpu="$(lshw -C display 2>/dev/null | grep -m1 'product:' | sed 's/.*product: //' || true)"
    if [[ -n "${lshw_gpu}" ]]; then
      GPU_DETECTED="true"
      GPU_VENDOR="unknown"
      GPU_NAME="${lshw_gpu}"
      GPU_VRAM="unknown"
      return 0
    fi
  fi

  GPU_METHOD="none"
  GPU_VENDOR="none"
  GPU_NAME="No GPU detected"
  GPU_VRAM="n/a"
  return 1
}

gpu_report_summary() {
  if [[ "${GPU_DETECTED}" == "true" ]]; then
    echo "${GPU_VENDOR}/${GPU_NAME} (${GPU_VRAM}, via ${GPU_METHOD})"
  else
    echo "No GPU — CPU inference fallback"
  fi
}
