# Papers Build Notes

This folder contains publication-style paper drafts.

Current paper:

- `overton-micro-coercion-preprint-v0.1.md`

## Prerequisites

- `pandoc` installed and on PATH
- a PDF engine installed (`xelatex` from TeX Live/MiKTeX, or `tectonic`)

## PowerShell build commands

Run from repo root:

```powershell
# 1) Markdown -> LaTeX
pandoc .\docs\papers\overton-micro-coercion-preprint-v0.1.md `
--from=gfm+yaml_metadata_block+tex_math_dollars `
--to=latex `
--standalone `
--output .\docs\papers\overton-micro-coercion-preprint-v0.1.tex

# 2) Markdown -> PDF (XeLaTeX)
pandoc .\docs\papers\overton-micro-coercion-preprint-v0.1.md `
--from=gfm+yaml_metadata_block+tex_math_dollars `
--standalone `
--pdf-engine=xelatex `
--output .\docs\papers\overton-micro-coercion-preprint-v0.1.pdf
```

## Optional: Tectonic PDF build

```powershell
pandoc .\docs\papers\overton-micro-coercion-preprint-v0.1.md `
--from=gfm+yaml_metadata_block+tex_math_dollars `
--standalone `
--pdf-engine=tectonic `
--output .\docs\papers\overton-micro-coercion-preprint-v0.1.pdf
```

## Zenodo packaging quick checklist

- Include source `.md`
- Include rendered `.pdf`
- Include generated `.tex` (optional but recommended)
- Set final DOI in front matter before final archive
