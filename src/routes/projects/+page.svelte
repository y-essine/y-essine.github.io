<script>
	import Lazy from '$shared/Lazy.svelte';
	const Projects = () => import('$components/projects/AsyncList.svelte');
</script>

<svelte:head>
	<title>Projects - YESSINE</title>
</svelte:head>
<div>
	<h3 class="font-extrabold">Projects I've worked on</h3>
	<Lazy component={Projects} />
</div>
