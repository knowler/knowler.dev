<!doctype html>
<html @php(language_attributes()) class="h-full">
  @include('partials.head')
  <body @php(body_class('bg-mirage text-white'))>
    @php(do_action('get_header'))
    <div role="document">
      <main class="flex justify-center py-1 md:py-4 lg:py-6">
        @yield('content')
      </main>
    </div>
    @php(do_action('get_footer'))
    @php(wp_footer())
  </body>
</html>
