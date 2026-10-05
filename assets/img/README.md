# Images

The 12 photographs are AI-generated art direction made with Higgsfield (GPT Image 2.5, one consistent low-key, amber rim-lit grade).
They live on Higgsfield's CDN and `index.html` links to them directly. The mapping is in `scripts/images.json`.

## Self-host and compress (recommended before launch)

The raw files are 2K PNGs (several MB each). Run:

```bash
python3 scripts/self-host-images.py
```

This downloads every image, writes `assets/img/<name>.webp` (full size) and `<name>-sm.webp` (800px previews),
and repoints `index.html` at the local files. You need ImageMagick or `cwebp` installed.

## Swapping in real photography

Use real photos wherever you can, especially of Rajender himself. Each image has one job:

| Key | Used for | Brief |
|---|---|---|
| `hero` | Full-screen opener | Dog on the right third, dark negative space on the left (21:9) |
| `dawn` | Trainer chapter | Bunty with a dog. A real photo of him belongs here |
| `malinois` `gsd` `dutch` `dobe` | Dog lineup | Single dog on black, rim-lit (3:4 / 4:5) |
| `villa` | The Standard | Dog guarding a home entrance at dusk (16:9) |
| `psa` | PSA chapter | Floodlit trial field, wide (21:9) |
| `action` | CTA | Bite work, mid-air (16:9) |
| `exec` `leash` `puppy` | Program previews | 4:5 |

After self-hosting, overwrite `assets/img/<key>.webp` and `<key>-sm.webp` with the real photos.
