<article @php(post_class('Terminal'))>
  <header>
    <h2 class="mv4-l f2 f1-m f-subheadline-l"><a class="white-80 link dim" href="{{ get_permalink() }}">{{ get_the_title() }}</a></h2>
    @include('partials/entry-meta')
  </header>
  <div class="lh-copy measure-wide">
    @php(the_excerpt())
  </div>
</article>
