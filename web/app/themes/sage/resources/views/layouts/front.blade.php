<!doctype html>
<html @php(language_attributes())>
  @include('partials.head')
  <body @php(body_class('bg-mirage text-white'))>
    @php(do_action('get_header'))
    <main class="flex justify-center py-1 md:py-4 lg:py-6">
      @yield('content')
    </main>
    @php(do_action('get_footer'))
    @include('partials.footer')
    @php(wp_footer())
  </body>
</html>
