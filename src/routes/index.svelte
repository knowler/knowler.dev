<script>
  import Terminal from '../components/Terminal.svelte'
  import LinkList from '../components/LinkList.svelte'

  const links = [
    { href: 'https://github.com/knowler', label: 'GitHub' },
    { href: 'https://twitter.com/kn_wler', label: 'Twitter' },
    { href: 'https://codepen.io/knowler', label: 'CodePen' },
    { href: 'https://words.knowlerkno.ws', label: 'Blog' },
    { href: 'mailto:nathan@knowler.me', label: 'Email' },
    { href: 'https://buymeacoff.ee/knowler', label: 'Buy Me A Coffee' },
  ]
</script>

<style>
  .blinky {
    display: inline-block;
    background-color: var(--white);
    color: var(--mirage);
    padding-top: 0.125em;
    margin-top: -0.125em;
    margin-bottom: -1px;
    animation: blink 1s step-start infinite;
  }

  @keyframes blink {
    50% {
      background-color: transparent;
      color: var(--off-white);
    }
  }
</style>

<Terminal>
  <p>My name is <strong>Nathan Knowler</strong>. I am a web developer and designer living in Calgary originally from Vancouver. I am passionate about using the web to help others accomplish great things. I love building products that I can be proud of.</p>
  <p>On the front of open source, I am a <a href="https://roots.io">Roots</a> team member.</p>
  <p>Remote work is my jam and so is <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=KFOmb9BrdtQ">Norma Jean</a>..<b class="blinky">.</b></p>
  <LinkList {links} />
</Terminal>
