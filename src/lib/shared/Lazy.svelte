<script lang="ts">
	import Spinner from '$components/ui/loading/Spinner.svelte';
	import { onMount } from 'svelte';
	import Transition from './Transition.svelte';

	export let component: any;

	let props: any;

	$: {
		const { component, delayMs, ...rest } = $$props;
		props = rest;
	}

	const loadComponent = component().then((module: any) => {
		return module.default;
	});
</script>

{#await loadComponent}
	<Transition transition={{ type: 'component' }}>
		<Spinner />
	</Transition>
{:then component}
	<Transition transition={{ type: 'component' }}>
		<svelte:component this={component} {...props} />
	</Transition>
{/await}
