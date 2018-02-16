<article @php(post_class())>
  <header>
    <h1 class="mv4-l f2 f1-m f-subheadline-l white-80">{{ get_the_title() }}</h1>
    @include('partials/entry-meta')
  </header>
  <div class="measure-wide lh-copy">
    @php(the_content())
  </div>
  <footer>
    {!! wp_link_pages(['echo' => 0, 'before' => '<nav class="page-nav"><p>' . __('Pages:', 'sage'), 'after' => '</p></nav>']) !!}
  </footer>
</article>
