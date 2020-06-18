module.exports = ({
  content,
  title = 'Nathan Knowler',
  description = 'Nathan Knowler builds web-based solutions for people.',
}) =>
  `
<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${description}">
    <title>${title}</title>
    <style>body {font-family: system-ui, sans-serif;}</style>
  </head>
  <body>
    ${content}
    <script>if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(registration => { registration.unregister(); });</script>
  </body>
</html>
`.trim();
