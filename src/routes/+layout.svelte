<script>
	import '../app.less';
	import '@fontsource/inter';

	import Navbar from '$components/ui/Navbar/Navbar.svelte';
</script>

<Navbar />
<div class="flex flex-col items-center pt-5 pb-10">
	<slot />
</div>
