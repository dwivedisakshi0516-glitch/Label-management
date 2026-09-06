"""Compatibility package for running backend.app imports from ./backend."""

from pathlib import Path

__path__ = [str(Path(__file__).resolve().parent.parent)]
