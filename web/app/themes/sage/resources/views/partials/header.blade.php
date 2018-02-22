<header class="mh3">
  <div class="mw8 center pa3 bb bw2 b--black-50 tc">
    <a class="link white-80 f2 ttu tracked-mega hover-white" href="{{ home_url('/') }}">Nathan Knowler</a>
    <nav class="nav-primary">
      @if (has_nav_menu('primary_navigation'))
        {!! wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav']) !!}
      @endif
    </nav>
  </div>
</header>
