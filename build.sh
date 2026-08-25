#!/bin/bash
# Rebuilds index.html from the content/ partials.
# index.html is a build artifact — edit the partials, never index.html directly.
set -e
cd "$(dirname "$0")"
cat content/head.html \
    content/topbar.html \
    content/sidebar.html \
    content/main-open.html \
    content/flowchart.html \
    content/phase1.html \
    content/phase2.html \
    content/phase3.html \
    content/phase4.html \
    content/phase5.html \
    content/glossary.html \
    content/footer.html > index.html
echo "index.html rebuilt from content/ partials"
