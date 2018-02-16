<header class="banner">
  <div class="mw8 center pa3">
    <a class="link white-50 f4 ttu tracked-mega hover-white" href="{{ home_url('/') }}">Nathan Knowler</a>
    <nav class="nav-primary">
      @if (has_nav_menu('primary_navigation'))
        {!! wp_nav_menu(['theme_location' => 'primary_navigation', 'menu_class' => 'nav']) !!}
      @endif
    </nav>
  </div>
</header>
