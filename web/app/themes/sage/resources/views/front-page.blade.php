@extends('layouts.app')

@section('content')
  @while(have_posts()) @php(the_post())
    <div class="bg-white-90 w5 h5 pa3 center shadow-5 animate-jump-down">
      <h2 class="black-50 mv0">Hello</h2>
    </div>
  @endwhile
@endsection
