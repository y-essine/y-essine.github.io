<script lang="ts">
	import Projects from '$components/projects/list.svelte';
	import Lazy from '$shared/Lazy.svelte';

	const delayModuleLoad = (module: any) =>
		new Promise((res) => setTimeout(() => res(module), Math.random() * 2000));

	const Canvas = () => import('$components/3d/Canvas.svelte').then(delayModuleLoad);
</script>

<svelte:head>
	<title>Home - YESSINE</title>
</svelte:head>
<div class="flex justify-center">
	<h1 class="font-extrabold">Home</h1>
</div>
<div class="mt-5">
	<Lazy component={Canvas} />
</div>
<div class="mt-10">
	<h3 class="font-extrabold">Projects I've worked on</h3>
	<Projects />
</div>
