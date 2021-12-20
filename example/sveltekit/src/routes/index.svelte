<script>
  import Sparticles from "sparticles";
  let options = { color: "cyan", shape: "star", speed: 50 };
  function addSparticles(node) {
    new Sparticles(node, options);
  }
</script>

<main use:addSparticles>
  <h1>Sparticles in SvelteKit</h1>
  <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
</main>

<style>
  main {
    height: 100%;
  }
</style>

