@extends('layouts.front')

@section('content')

  @while(have_posts()) @php(the_post())
<div class="flex justify-center py-1 md:py-6">
  <div class="Terminal">
    @php the_content() @endphp
    <p>
      Remote work is my jam @if($jam) and so is <a class="mr-1" target="_blank" rel="noopener noreferrer" href="{{$jam->link}}">{{$jam->artist}}</a>..<b class="blinky">@endif.</b>
    </p>
    @if($connects)
    <p>
      <ul class="Terminal--links">
        @foreach($connects as $connect)
        <li><a href="{{$connect->link}}">{{$connect->name}}</a></li>
        @endforeach
      </ul>
    </p>
    @endif
  </div>
</div>
@endwhile

@endsection
