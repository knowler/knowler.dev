<script>
  export let links
</script>

<style>
  .LinkList {
    display: flex;
    flex-flow: row wrap;
    list-style: none;
    padding: 0;
    margin-top: 1rem;
    margin-bottom: 0;
  }

  .LinkList__item {
    display: block;
    margin-top: 0.5rem;
  }

  .LinkList__item:not(:last-child) {
    margin-right: 0.5rem;
  }

  .LinkList__link {
    background-color: var(--black);
    border-bottom: 0;
    color: var(--green);
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.5rem;
    margin: 0;
    transition: 0.1s cubic-bezier(0.39, 0.58, 0.57, 1);
  }

  .LinkList__link:hover {
    background-color: var(--green);
    color: var(--mirage);
  }
</style>

<ul class="LinkList">
  {#each links as link}
  <li class="LinkList__item"><a class="LinkList__link" href="{link.href}">{link.label}</a></li>
  {/each}
</ul>
