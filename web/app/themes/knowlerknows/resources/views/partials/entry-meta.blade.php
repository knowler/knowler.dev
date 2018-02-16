<p class="f4-ns">
  {{ __('Posted by', 'sage') }} <a class="link white-80 b dim" href="{{ get_author_posts_url(get_the_author_meta('ID')) }}" rel="author" class="fn">
    {{ get_the_author() }}
  </a>
  {{ __('on', 'sage') }} <time class="f4-ns" datetime="{{ get_post_time('c', true) }}">{{ get_the_date() }}</time>
</p>
