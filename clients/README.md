# Adding work to a project

Every brand folder has four drop folders. Put a file in the right one, reload the
page, and it appears on the site. There is no publish step.

```
clients/Geely/
├── assets/      the logo
├── images/      stills, key visuals, designs, photography
├── videos/      films and cutdowns you host yourself
├── articles/    write-ups, copy decks, press, PDFs
└── links/       Canva decks, YouTube films, LinkedIn articles
```

## Or add files from the page

Start the editor, open the brand's page, and press Edit. Under "The work" there is
a box. Drag files onto it, or use Choose files. Each file goes into the right
folder by its type. Add a link asks for the address and a title, then saves it into
`links/`. Files that are not images, videos, documents or link shortcuts are refused.

## Empty folders stay invisible

A project only shows the sections it has. Drop three films into `videos/` and
nothing else, and the page shows films and nothing else. A photography project
shows a gallery. An article-led project shows the writing. Leave a folder empty
and it does not appear at all, so there are no blank headings anywhere.

That means you never have to fill all four. Use the ones that fit the project.

## What goes where

| Folder | Accepts |
|---|---|
| `images/` | `.jpg` `.jpeg` `.png` `.webp` `.gif` `.svg` `.avif` `.bmp` `.tif` |
| `videos/` | `.mp4` `.webm` `.mov` `.m4v` `.ogv` |
| `articles/` | `.md` `.txt` `.pdf` `.doc` `.docx` `.rtf` `.odt` |
| `links/` | `.url` shortcuts and `links.txt` |

## Adding links

Two ways, and you can mix them:

**Drag the link in.** Drag the address straight out of your browser's address bar
into the `links/` folder. Windows saves a `.url` shortcut and the site reads it.

**Or type them.** Make a file called `links.txt` in the `links/` folder, one link
per line:

```
https://www.youtube.com/watch?v=xxxxxxxxxxx
Geely launch film | https://www.canva.com/design/DAFxxxxxxx/view
# lines starting with # are ignored
```

Canva decks, YouTube films, Vimeo, Google Drive and LinkedIn posts are all
recognised. Canva and YouTube play inline on the page. Anything else becomes a
clean link out.

## Controlling the order

Files sort by name. Put numbers in front to choose the order:

```
01_hero.jpg
02_billboard.jpg
03_bus-shelter.jpg
```

The number is stripped before it reaches the site, and dashes and underscores
turn into spaces. `03_launch-film.mp4` shows up as **launch film**.

## Where it appears

Both places, from the same folders:

- the panel that opens when you click the brand inside a phone app
- that brand's own case-study page at `clients/<Brand>/index.html`
