# Timetable Maker

A one-page website where a Baby Sensory franchisee picks a theme, types in their class days and times, and downloads a branded timetable image. Nothing is AI generated: every timetable is drawn from the same fixed template (brand green and yellow columns, logo, title, theme pictures), so the same details always give the same picture.

## What franchisees do

1. Open the website.
2. Pick a theme (Spring, Easter, Summer, Summer holiday, Autumn, Baby Pumpkin, Christmas, New Year or Everyday).
3. Check the title, and add a venue if they want one.
4. Add their days, then each class's start time and age group. "Copy to next day" saves retyping.
5. Pick a size (Facebook post, Instagram square, story, or A4 poster) and press **Download timetable**.

Their details stay saved in their own browser, so next term they only change what is different. Nothing is sent anywhere and there are no accounts.

## Putting it online for free (GitHub Pages)

1. Sign in at github.com (a free account is fine) and create a new **public** repository, for example `timetable-maker`.
2. Choose **uploading an existing file** and drag in everything in this folder: `index.html`, `app.js`, `render.js`, `themes.js` and the `fonts` folder. The `examples` folder and this README are optional.
3. Open the repository's **Settings → Pages**, set Source to **Deploy from a branch**, choose `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://<your-username>.github.io/timetable-maker/`. Share that link with franchisees.

To change something later, upload the changed file to the same repository and the site updates itself.

Netlify Drop (app.netlify.com/drop) or Cloudflare Pages also work on their free plans: drag this folder in and they give you a link.

## Trying it on your own computer

Double-click `index.html`. It works offline because the fonts are included.

## Changing the look

- **Themes** are in `themes.js`. Each theme has a name, default title, title colour, a background and two corner decorations. Copy one and edit it to add a new theme.
- **Brand colours** are at the top of `themes.js`, taken from the Baby Sensory brand book: green `#75C044`, yellow `#FFEB00`, yellow tint `#FFFCD5`, green tint `#E8F1D9` and black tint `#58595B`. Text follows the brand book's pairings: yellow or white on green, green on yellow.
- **Age groups** in the drop-down are the `AGES` list at the top of `app.js`.
- **Sizes** are the `SIZES` list at the top of `render.js`.
- **Fonts** follow the brand book: Delius for the day names (sub-headers), and Nunito in place of Museo Sans Rounded for the title and times. Museo Sans Rounded is a paid font; if you have a web licence for it, add the file to `fonts/` and swap it in at the top of `render.js`.
- **Logo**: the brand book asks for the original logo artwork. Upload the primary logo from the Knowledge Library as `logo.png` next to `index.html` and every timetable uses it automatically. Until then a drawn copy of the cloud logo is used. Franchisees can also upload the logo file in the form.
