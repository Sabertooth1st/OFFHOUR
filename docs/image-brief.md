# OFFHOUR image brief

This is everything the new scroll experience needs, in priority order. Give Astra (or any image tool) the **style block** and **garment canon** with every request, so the same jacket looks like the same jacket in every picture.

Deliver files with the exact names below. Put them in `public/media/` and the site picks them up.

---

## 1. Style block (paste at the start of every prompt)

> Photorealistic fashion photography for OFFHOUR, a premium unisex clothing label. Colour palette: chalk #EEECE5, charcoal #20211F, concrete #B6B7B0, oxblood #74333D. Natural late-afternoon light, soft and directional. Fine film grain. Quiet brutalist concrete architecture. Real fabric texture and believable folds. No text, no logos, no labels, no watermarks, no extra garments or accessories, no jewellery.

## 2. Garment canon (paste the relevant lines into each prompt)

| Slug | Garment | Exact description |
|---|---|---|
| `form-shell-jacket` | Form Shell Jacket | Muted oxblood (#74333D) cropped boxy shell jacket. Stand collar, one central zip, two large patch pockets on the lower front. Dense matte cotton-nylon. Sits at the hip, room through the shoulder. |
| `field-wool-overshirt` | Field Wool Overshirt | Concrete grey (#86877F) brushed wool overshirt. Point collar, button placket, two chest pockets with flaps, straight hem, relaxed fit. |
| `heavyweight-tee` | Heavyweight Tee | Chalk (#E4E1D8) heavyweight cotton jersey t-shirt. Square boxy fit, wide neck rib, slightly dropped shoulder. |
| `relaxed-pleat-trouser` | Relaxed Pleat Trouser | Charcoal (#30312F) wool-blend trousers. Single forward pleat each side, relaxed through the hip, straight full-length leg. |
| `volume-hoodie` | Volume Hoodie | Washed charcoal (#585956) heavyweight hoodie. Deep hood, dropped shoulder, kangaroo pocket, ribbed cuffs and hem, soft washed surface. |
| `rib-knit` | Rib Knit | Oat (#D0C2A5) textured rib-knit sweater. Close crew neck, relaxed body, ribbed cuffs and hem. |

**Model** (for every on-body and campaign shot): one androgynous model, late 20s, short dark hair, neutral expression, no visible makeup, slim build. Use the same model in every picture.

---

## 3. Turntables: the "all camera angles" section (highest priority)

The site scrubs through these frames as you scroll, so each garment spins in 3D. This only works if every frame matches exactly.

- **Per garment:** 24 frames, one every 15 degrees (000, 015, 030 ... 345). If 24 is too many, send 8 frames at 000, 045, 090 ... 315.
- **Two extra views per garment:** one from above (`above`) and one from low down (`below`).
- **Format:** PNG with a transparent background, 1600 × 2000 px (4:5).
- **Framing:** a ghost-mannequin (invisible mannequin) photo. The garment is centred on the vertical axis, fills about 80% of the frame height, and sits at the same scale and position in every frame.
- **Lighting:** identical in every frame. Soft key light from the upper right, gentle fill light, no cast shadow (the site adds its own).
- **Names:** `turntable/<slug>/<slug>-000.png` ... `-345.png`, `<slug>-above.png`, `<slug>-below.png`.

**Prompt template** (fill in GARMENT and ANGLE):

> [Style block] Ghost-mannequin product photograph of [GARMENT canon line], shown on an invisible mannequin, rotated [ANGLE] degrees clockwise from straight-on front view (0 = front, 90 = left side, 180 = back, 270 = right side). Garment centred, filling 80% of frame height, isolated on a transparent background. Studio lighting, soft key light from the upper right, no cast shadow. Same scale, framing and lighting as the other frames in this turntable series.

## 4. Hero (the opening "pop up" moment)

| File | Size | Prompt |
|---|---|---|
| `hero/hero-desktop.jpg` | 2400 × 1600 | [Style block] Wide campaign photograph. The model wears [Form Shell Jacket canon] over [Heavyweight Tee canon] and [Relaxed Pleat Trouser canon], standing right of centre under a deep concrete overhang. Low angled sun lights the jacket and leaves the left third of the frame in quiet shadow, kept empty for large text. Full figure visible from mid-thigh up. |
| `hero/hero-mobile.jpg` | 1200 × 2000 | Same scene as the desktop hero, framed vertically. The model is centred, with the jacket in the middle third of the frame. |
| `hero/hero-cutout.png` | 1600 × 2000, transparent | The same model and outfit as the desktop hero, cut out cleanly on a transparent background. Three-quarter front view, mid-thigh up, light from the upper right. The site animates this cutout so it rises over the OFFHOUR wordmark. |

## 5. On body (one per garment)

| File | Size | Prompt |
|---|---|---|
| `onbody/<slug>.jpg` | 1600 × 2000 | [Style block] Full-length photograph of the model wearing [GARMENT canon] with neutral pieces from the collection, standing in a concrete passage with an angled shaft of late light. The garment's shape, fit and colour are clearly visible. |

## 6. Detail zoom chain (the section that "goes more in depth")

This sequence takes you from the whole jacket to the thread. Keep the lighting continuous from one picture to the next.

| File | Size | Prompt |
|---|---|---|
| `detail/jacket-collar.jpg` | 1600 × 2000 | [Style block] Close-up of the stand collar of the [Form Shell Jacket canon], zip pull at the top, raking light showing the stitching. |
| `detail/jacket-zip.jpg` | 1600 × 2000 | Close-up of the central zip running down the jacket front, teeth continuous and straight, matte metal. |
| `detail/jacket-pocket.jpg` | 1600 × 2000 | Close-up of one large front patch pocket: its edge stitching and corner, light grazing across. |
| `detail/jacket-fabric.jpg` | 1600 × 2000 | Macro photograph of the jacket fabric filling the frame: dense matte oxblood weave, soft sheen where the light lands. |
| `detail/jacket-thread.jpg` | 1600 × 2000 | Extreme macro of the same oxblood fabric: individual yarns and the weave structure, shallow depth of field. |
| `detail/<slug>-fabric.jpg` (other 5 pieces) | 1600 × 2000 | Macro photograph of [GARMENT canon] fabric filling the frame, raking light, true colour. |

## 7. Identity and closing

| File | Size | Prompt |
|---|---|---|
| `campaign/stairwell.jpg` | 1600 × 2000 | [Style block] The model in a concrete stairwell at last light, wearing [Form Shell Jacket] open over [Heavyweight Tee] and [Relaxed Pleat Trouser]. Mid-step, quiet movement. |
| `campaign/passage.jpg` | 2400 × 1600 | The model walking through a long concrete passage toward light, wearing [Volume Hoodie] under [Field Wool Overshirt]. Wide framing, lots of architecture. |
| `campaign/chair.jpg` | 1600 × 2000 | [Form Shell Jacket] draped over a plain wooden chair against a plaster wall, window light. No person. |
| `campaign/closing.jpg` | 2400 × 1600 | All six pieces hanging on a simple steel rail in a concrete room, evening light, in this order: jacket, overshirt, tee, trousers, hoodie, knit. |

---

## Quality checks before sending

- The jacket is the same colour, length and pocket layout in every picture.
- No warped zips, extra pockets, mismatched sleeves or melted hands.
- The turntable frames line up: flicking through them, the garment does not jump or change size.
- No text or logos anywhere in an image.
