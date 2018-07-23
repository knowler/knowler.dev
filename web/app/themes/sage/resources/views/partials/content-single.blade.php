<article @php(post_class('Terminal'))>
  <header class="mb-3">
    <h1>{{ get_the_title() }}</h1>
  </header>
  <p>
    @php(the_content())
  </p>
  <footer>
    @include('partials/entry-meta')
  </footer>
</article>
