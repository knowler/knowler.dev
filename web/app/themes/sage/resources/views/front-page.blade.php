@extends('layouts.app')

@section('content')
  @while(have_posts()) @php(the_post())
    <div class="bg-green-light px-3 md:px-4 py-4 md:py-5 lg:py-6">
      <div class="leading-normal">
        <p class="my-3 text-xl md:text-2xl lg:text-3xl leading-tight">
          I was born to <strong>code</strong>.<br>
          It’s in my blood.
        </p>
        <p class="max-w-xs md:max-w-sm lg:max-w-md mx-1 my-3 md:text-lg">
          I never went to school for programming, but I grew up around computers
          since both my parents worked .
        </p>
      </div>
    </div>
    <div class="bg-green-darkest px-3 md:px-4 py-4 md:py-5 lg:py-6 text-green-light">
      <div class="leading-normal">
        <p class="my-3 text-xl md:text-2xl lg:text-3xl leading-tight">
          I was born to <strong>code</strong>.<br>
          It’s in my blood.
        </p>
        <p class="max-w-xs md:max-w-sm lg:max-w-md mx-1 my-3 md:text-lg">
          I never went to school for programming, but I grew up around computers
          since both my parents worked .
        </p>
      </div>
    </div>
  @endwhile
@endsection
