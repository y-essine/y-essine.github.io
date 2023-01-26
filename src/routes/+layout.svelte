<script lang="ts">
	import '../app.less';
	import '@fontsource/inter';

	import Navbar from '$lib/components/ui/navbar/Navbar.svelte';
	import Transition from '$lib/shared/Transition.svelte';

	import Lazy from '$shared/Lazy.svelte';

	const delayModuleLoad = (module: any) =>
		new Promise((res) => setTimeout(() => res(module), Math.random() * 2000));

	const Shiba = () => import('$components/3d/Shiba.svelte').then(delayModuleLoad);
</script>

<Navbar />
<div class="flex flex-col items-center">
	<div class="h-40">
		<Lazy component={Shiba} />
	</div>
	<div class="p-7 pt-0">
		<Transition>
			<slot />
		</Transition>
	</div>
</div>
