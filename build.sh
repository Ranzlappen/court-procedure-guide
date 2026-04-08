#!/bin/bash
cat content/head.html \
    content/sidebar.html \
    content/topbar.html \
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
