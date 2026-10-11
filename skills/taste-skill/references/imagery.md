# Imagery

Pictures are where generated pages most obviously give up: a grey box, an icon in a square, a fake
dashboard, an abstract blob. This file is how to decide what the pictures are, how to crop and place
them, and what to do when there are none.

## Contents

1. What the study measured
2. Decide what imagery exists
3. The dealt photographs
4. Cropping and placing
5. Treatment
6. Showing software
7. Drawing the subject
8. Type and colour alone
9. Markup

## 1. What the study measured

- On 60% of the studied sites one piece of media covers at least half of the first screen; on half of
  them it covers nearly all of it. Top-scored sites: 68% and 56%. Weak sites: 48% and 39%.
- Only 15% of heroes have no media at all, and those are deliberate typographic statements.
- Media has square corners on 73% of sites. Where corners are rounded the usual radius is about 12px,
  applied to every image alike.
- Top-scored pages carry far more imagery (a median of 37 images against 5 on weak pages): the strong
  sites show, the weak ones tell.
- What the imagery is, by the panel's classification: a mix of kinds 32%, photography 14%, generative
  or WebGL scenes 13%, real product interface 12%, 3D renders 11%, illustration 9%, video 6%, type only
  3%.
- Among the 54 sites the panel scored under 6.8, legibility (text lost over a busy image, or too
  little contrast) was named as a weakness in 13.

## 2. Decide what imagery exists

In order of preference:

1. **The project's own images.** Product shots, the place, the people, the work. Even ordinary
   photographs of the real thing beat beautiful photographs of something else. Ask what exists; look in
   the repository.
2. **Images you can generate** with an image tool in this session. Write prompts as a photographer's
   brief: subject, angle, light, background, crop ratio, and "no text". Generate the hero first and
   make the rest match its light.
3. **Pictures you draw in code from the subject itself** (section 7): the product's own objects as
   flat shapes, the place's tiles and windows, a map of its streets, the document a tool produces, the
   interface of a piece of software. In testing, pages that drew their subject with care beat pages
   that borrowed unrelated photographs every time, and beat pages that showed nothing.
4. **The photographs dealt on the direction sheet.** Real photographs of places, light, texture and
   weather. Use them only where an honestly generic picture fits (the open sea for a house on the sea,
   fog for a quiet retreat). They cannot stand in for a specific product, dish, room, person or
   screen: a foggy motorway on a restaurant page reads as stock at once, and jurors notice.
5. **Type and colour alone,** done on purpose (section 8).

Tell `draw.mjs` the truth with `--have`. If you have no product photographs and no image tool, do not
pass `product-photo`; the draw will avoid the directions that depend on showing the object.

## 3. The dealt photographs

- The sheet lists eight from one set so they share a subject and a light. Use three to six.
- Each line says where the calm area is. Put text there or keep text off the image.
- More from the same or another set: `node scripts/draw.mjs --photos list`, `--photos <set>`, or
  `--photos "fog coast"` to search descriptions.
- URLs have the form `https://picsum.photos/id/<id>/<width>/<height>`. Request the exact pixel size you
  render at twice the CSS size for sharpness, capped around 2400 wide. Add `?grayscale` for
  black-and-white.
- These are photographs from Unsplash served by Lorem Picsum under the Unsplash licence. List the ids
  you used in your report; they are meant to be replaced by the project's own pictures.

## 4. Cropping and placing

- **Choose a small set of ratios and stick to them:** for example 4:5 for portraits, 16:10 for
  landscapes and 1:1 for details. Random ratios look like a stock dump.
- **Go large.** A photograph at full width, or at half the screen and full height, has presence. Six
  small ones in a grid have none. If the image is good, give it the room; if it is not, cut it.
- **Crop with intent.** Use `object-fit: cover` with an `object-position` chosen per image so the
  subject sits where the composition needs it (off-centre, on a third, against the text side).
- **Let images touch edges.** Full-bleed, or bleeding off one side, reads as designed. An image
  floating with equal margins on all sides reads as placed by default.
- **Overlap sparingly and on purpose:** a headline whose last line runs over the top edge of the
  picture, a small image overlapping a large one by a fixed 40–80px. One overlap per screen at most.
- **Square corners** unless the direction or the one-motif shape says otherwise. If rounded, one radius
  for every image on the page.
- **No frames:** no borders, no shadows, no device mock-ups, no browser chrome around pictures.
- **Captions** are one short line in the small size and soft ink under the image, left-aligned to its
  edge. Most images need none.

## 5. Treatment

One treatment for the whole page:

- **Untouched.** The default. Pick images whose light already agrees.
- **Greyscale.** `filter: grayscale(1) contrast(1.05)`, or `?grayscale` on the URL. Unifies a mixed
  set instantly and suits editorial and typographic directions. Apply to every image or none.
- **Multiply on a field.** On a light flat ground, `mix-blend-mode: multiply` makes a white studio
  background vanish so a product sits directly on the colour.
- **Darkened for a dark page.** `filter: brightness(0.85) contrast(1.05)` so the image edges sink into
  the ground.

Not treatments: colour washes over photographs, duotone overlays, blur, grain overlays, vignettes,
tilted "polaroid" frames with shadows.

For text on a photograph, a neutral scrim covering only the text area: a solid block at 40–55% black,
or a fade from 55% black to transparent over the lower third. Never a coloured overlay.

## 6. Showing software

- Build a real fragment of the interface in HTML at its true size, with believable content, instead of
  a shrunken screenshot or a decorative mock-up. Crop to the part that makes the point: one control,
  one row, one panel.
- Believable means real labels, real numbers that add up, one item hovered or selected, proper
  alignment. Grey bars standing in for text are worse than no image.
- Put the fragment directly on the page or on one flat stage colour. No laptop, no phone frame unless
  the product is a phone app and the frame is a plain rounded rectangle.
- Inside a fragment the product's own interface conventions apply (its small radii, its 1px control
  borders, a shadow on its open menu). Put the attribute `data-ui` on the fragment's root element: the
  inspector and the linter then leave what is inside alone, and hold the page around it to the house
  rules. `data-ui` is for cropped fragments only; wrapping a heading or a whole section in it fails.
  Write the fragment's CSS under a `[data-ui]` selector (`[data-ui] .row { … }`) so the linter can
  tell it apart from page styles.
- If the user supplies real screenshots, show them large and uncropped at least once.

## 7. Drawing the subject

When nothing real can be photographed, draw it, and draw it well. Inline SVG and CSS are enough.

- **Draw the subject's own things,** not decoration: the stool's three legs and the grain of its seat,
  the enamel sign over the bakery door, the hut's two windows and its stove pipe, the street plan, the
  invoice the tool produces, the festival's stage. If you cannot name what a drawing depicts in the subject's world, it is decoration.
- **One graphic language for the whole page:** flat filled shapes, no outlines or one consistent
  stroke weight, the same corner and curve vocabulary everywhere, drawn in the palette's real colours
  (fields and accent at full strength, not greys). A set of drawings that obviously belong together
  reads as an identity; a mix of styles reads as clip art.
- **Colour is the material.** A product sold on its finish is drawn in that finish's colours; a sea house in the
  sea's blues and the sand; never a page of grey placeholders.
- **Draw with three levels of detail.** Jurors called simple drawings "basic" every time. Give each
  drawing big shapes that read at a glance, middle shapes that describe the thing (the handle, the
  window frame, the step), and small details that reward a second look (the maker's mark, the house
  number, the chipped tile, the hinge, a bird on the roof). Make light with flat tone steps (a lit face
  and a shaded face of each volume), not gradients. A drawing that would pass as a placeholder icon at
  full size is not finished.
- **Draw large and let it work:** the drawing is the hero's dominant element, a full-width band, a set
  of tiles, the footer mark. Small doodles scattered around read as filler.
- **Let it carry the idea through the page,** the way a motif does: the same drawn object returns at
  different scales, the tile grid becomes the opening hours, the map becomes the booking section.
- **Honesty:** say plainly, in small text near the first drawing or in the footer, that the pictures
  are drawn until photographs exist, if the client might otherwise be taken to be showing real
  products. In your report, list which drawings are placeholders for photography.
- **Not this:** gradient-shaded 3D-looking blobs, isometric clip art, generic line illustrations of
  people at laptops, abstract floating shapes, icons in squares. Those are the generated look.

## 8. Type and colour alone

This is a legitimate design, not a gap to disguise. Only 7 of the studied sites use no imagery at all,
and they hold their own: a median panel score of 7.5 against 7.2 for the whole set.

- Make the typography the image: one statement at 10–14vw, a list set at 5vw, numerals at display size.
- Use colour at scale: a full field, an inverted section, a two-field split.
- Use the subject's own shape as one flat motif if the direction calls for it (a circle, an arc, a
  notch), drawn in CSS, cropped by the viewport.
- Do not add: icons in squares, abstract gradients, dot grids, wave dividers, floating shapes, emoji,
  generic line illustrations, or an empty box where a picture "will go".

## 9. Markup

```html
<img src="https://picsum.photos/id/626/2400/1500" width="2400" height="1500"
     alt="Red and white lighthouse in a turquoise sea below a chalk cliff" loading="lazy" decoding="async">
```

- Always `width` and `height` (or `aspect-ratio` in CSS) so nothing jumps while loading.
- `loading="lazy"` on everything except the hero image, which gets `fetchpriority="high"`.
- `alt` describes the picture in plain words. Decorative repeats get `alt=""`.
- A coloured `background-color` on the image container (the ground or surface tone) so the layout is
  whole before the image arrives.
- A broken image fails the inspector. Check every picture in the screenshots.
