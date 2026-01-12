# canvas (node-canvas) Windows prerequisites

This project depends on `canvas` (node-canvas) for tests and some build steps. `canvas@3.x` requires native system libraries and a C/C++ toolchain on Windows. This document summarizes developer and CI steps to make `canvas` build reliably on Windows agents.

## Quick summary

- For local dev on Windows: install Visual Studio Build Tools (Desktop development with C++) or use MSYS2 with pacman-provided packages.
- For GitHub Actions: use the `windows-latest` runner and install the required packages via `choco` or `winget`, or use an action that installs MSYS2.

## Local developer setup (Visual Studio Build Tools)

1. Install Visual Studio Build Tools (2019/2022) with the "Desktop development with C++" workload.
   - Download: https://visualstudio.microsoft.com/downloads/
   - Include the Windows 10/11 SDK and MSVC v142+ components.

2. Install pkg-config and Cairo dependencies (binaries or via MSYS2):
   - Recommended: use MSYS2 for libraries (simpler for Cairo and fontconfig):
     - Install MSYS2: https://www.msys2.org/
     - Then in MSYS2 shell:
       ```sh
       pacman -Syu
       pacman -S mingw-w64-x86_64-toolchain mingw-w64-x86_64-cairo mingw-w64-x86_64-pkg-config mingw-w64-x86_64-fontconfig
       ```
   - Alternatively, follow the instructions in the `canvas` README for Windows binary dependencies.

3. Set environment variables (in PowerShell) when using MSYS2:

```powershell
# Example for MSYS2 installed to C:\msys64
$env:PKG_CONFIG_PATH = 'C:\msys64\mingw64\lib\pkgconfig'
$env:PATH = "C:\msys64\mingw64\bin;" + $env:PATH
```

4. Install Node dependencies:

```powershell
npm ci
```

If `canvas` still fails to build, check the error logs and ensure `pkg-config` and `cairo` are visible to the build environment.

## GitHub Actions / CI notes

For CI we recommend one of the following approaches:

- Use a prebuilt `canvas` package by installing from a tarball that includes prebuilt binaries for Windows (if available for the chosen Node version).

- Install MSYS2 on the runner and install the `cairo` toolchain packages prior to `npm ci`.

Example `jobs` step (GitHub Actions):

```yaml
- name: Install MSYS2 dependencies
  run: |
    choco install msys2 -y
    refreshenv
    # initialize and install packages
    ridk exec pacman -Syu --noconfirm
    ridk exec pacman -S --noconfirm mingw-w64-x86_64-toolchain mingw-w64-x86_64-cairo mingw-w64-x86_64-pkg-config mingw-w64-x86_64-fontconfig
```

Or use the official `msys2/setup-msys2` action:

```yaml
- uses: msys2/setup-msys2@v2
  with:
    update: true
    install: >-
      mingw-w64-x86_64-toolchain
      mingw-w64-x86_64-cairo
      mingw-w64-x86_64-pkg-config
      mingw-w64-x86_64-fontconfig
```

After installing these packages, run `npm ci` as usual.

## Troubleshooting

- If you see errors about `cairo`, `pixman`, or `pkg-config`, ensure the corresponding library is installed and discoverable via `PKG_CONFIG_PATH`.
- If `node-gyp` fails, make sure MSVC build tools are installed and the correct Python and npm/node versions are used.
- Consider using `npm ci --legacy-peer-deps` as a last resort for CI if upgrading dependencies proves difficult; however, this is not recommended for long-term stability.

## References

- `canvas` README: https://github.com/Automattic/node-canvas#readme
- MSYS2: https://www.msys2.org/
- Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
