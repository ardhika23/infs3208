#!/usr/bin/env python
import os, sys
from pathlib import Path

# /app/services/gateway
HERE = Path(__file__).resolve().parent
# >>> tambahkan parent (/app/services) ke sys.path
sys.path.insert(0, str(HERE.parent))   # <-- INI YANG PENTING
# opsional: juga tambahkan /app
sys.path.insert(0, "/app")

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gateway.settings")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()