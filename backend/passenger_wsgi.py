import os
import sys

ROOT = os.path.dirname(__file__)
VENDOR = os.path.join(ROOT, "vendor")

sys.path.insert(0, ROOT)
if os.path.isdir(VENDOR):
    sys.path.insert(0, VENDOR)

from app import app as application
