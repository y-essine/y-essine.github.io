<script lang="ts">
	import Canvas from '$components/3d/Canvas.svelte';
	import Projects from '$components/projects/list.svelte';
</script>

<div class="flex justify-center">
	<h1 class="font-extrabold">Home</h1>
</div>
<div class="mt-10">
	<Canvas />
</div>
<div class="mt-10">
	<h3 class="font-extrabold">Projects I've worked on</h3>
	<Projects />
</div>
