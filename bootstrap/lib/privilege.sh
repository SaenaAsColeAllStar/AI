#!/usr/bin/env bash
# Teknovo AI Workstation — privilege detection (root vs non-root)
# shellcheck disable=SC2034

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

export SUDO
