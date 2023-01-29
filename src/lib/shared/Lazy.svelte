<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import Transition from './Transition.svelte';

	export let component: any;

	let props: any;

	$: {
		const { component, delayMs, ...rest } = $$props;
		props = rest;
	}

	const loadSuspend = import('$components/projects/Suspend.svelte').then((module: any) => {
		return module.default;
	});
</script>

{#await loadSuspend}
	<Transition transition={{ type: 'component' }}>
		<Spinner />
	</Transition>
{:then suspend}
	<svelte:component this={suspend} {...props} {component} />
{/await}
