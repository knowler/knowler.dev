@extends('layouts.front')

@section('content')

<section class="flex justify-center py-4 md:py-5 lg:py-6 overflow-hidden">
  <div class="heading max-w-lg lg:max-w-2xl overflow-hidden py-3 group flex flex-wrap justify-center quick ease props-all">
    <h2 class="inline-block text-center w-full font-normal uppercase tracking-widest -mb-2 sm:-mb-3 lg:-mb-4 text-lg sm:text-xl lg:text-2xl z-10">Nathan Knowler</h2>
    <h1 class="bg-white-50 rounded-lg quick ease props-all group-hover:bg-white-70 shadow group-hover:shadow-md mx-4 p-2 md:p-3 text-base sm:text-lg lg:text-xl font-light">Calgary-based, remote-friendly web designer &amp; developer</h1>
  </div>
</section>

<div class="bg-green-washed text-green-darkest p-4 md:p-5 sm:text-lg flex flex-wrap justify-center">

  <div class="rich-text max-w-lg w-full">
    <h2>My Values</h2>
    <ul>
      <li>Your website should serve you &mdash; not the other way around.</li>
      <li>Your website should be fast. I use the best practises to ensure your website is high performance through and through.</li>
      <li>Your website should look good. Nobody wants a website that looks bad.</li>
      <li>Your website should work on mobile. It’s {{ date('Y') }}! Most people will be viewing it on mobile anyway.</li>
      <li>Your website should work for everybody. This means it needs to be accessible.</li>
      <li>Your website should be findable. My best practises combined with your awesome content will bring you to the top of the search results.</li>
    </ul>
  </div>


  <div class="rich-text max-w-lg w-full">
    <h2>Products &amp; Services I Provide</h2>
    <ul>
      <li>Websites that work.</li>
      <li>Internal tools &ndash; your workflow is important to your business.</li>
      <li>Hosting &ndash; I provide the hosting for the sites I build.</li>
    </ul>
  </div>

  <div class="rich-text max-w-lg w-full">
    <h2>Technologies I Use</h2>
    <p>I strive to use relevant and modern technologies. This is my current toolset:</p>
    <ul>
      <li>
        <strong>WordPress</strong> &ndash; I know what you’re thinking? WordPress? It does power a massive portion of the web. But how much of that is just Internet garbage? Forget everything you know about your last WordPress site. I use <a href="https://roots.io">modern tools</a> to build WordPress sites that don’t suck.
      </li>
      <li><strong>Laravel</strong> &ndash; If your website needs extended functionality that a CMS does not provide, I can build it with Laravel instead.</li>
      <li><strong>React</strong> &ndash; </li>
    </ul>
  </div>

</div>

@endsection
