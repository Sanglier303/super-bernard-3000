#!/bin/bash
sed -i '' 's/var(--rose-light)/var(--accent-light)/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--rose-pastel)/var(--accent-main)/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--rose-warm)/var(--accent-strong)/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--rose-muted)/var(--text-muted)/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--gold-soft)/var(--accent-light)/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--gold)/var(--accent-strong)/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--cream)/#ffffff/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--brown-mid)/var(--border-focus)/g' *.css */*.jsx 2>/dev/null
sed -i '' 's/var(--brown-deep)/var(--bg-elevated-hover)/g' *.css */*.jsx 2>/dev/null
