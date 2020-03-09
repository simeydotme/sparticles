<script>
  import Sparticles from "sparticles";
  let sparticles;
  let options = { color: "gold", shape: "star", speed: 50 };
  function addSparticles(node) {
    new Sparticles(node, options);
  }
</script>

<main use:addSparticles>
</main>

<style>
  main {
    height: 100%;
  }
</style>
