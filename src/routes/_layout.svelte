<style>
  main {
    display: flex;
    justify-content: center;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  @media screen and (min-width: 768px) {
    main {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
  }

  @media screen and (min-width: 992px) {
    main {
      padding-top: 8rem;
      padding-bottom: 8rem;
    }
  }
</style>

<main>
  <slot></slot>
</main>
