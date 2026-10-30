# Portfolio

My personal website: https://mehdibedja.github.io

It's a single static page (HTML and CSS, no framework, no build step) with my background, work experience, projects and skills.

## Run locally

```bash
git clone https://github.com/MehdiBedja/MehdiBedja.github.io.git
cd MehdiBedja.github.io
python -m http.server 3000    # then open http://localhost:3000
```

## Tests

```bash
npm test
```

A few static checks using Node's built-in test runner: metadata, in-page links, that referenced images exist, safe external links, and alt text. GitHub Actions runs them on every push, and GitHub Pages deploys the `main` branch.

## Files

```
index.html            the page
404.html              not-found page
img/                  images
tests/                checks run by npm test
```

## Contact

mahdibedja@gmail.com · [LinkedIn](https://www.linkedin.com/in/mahdi-bedja-0b94031b3/)
