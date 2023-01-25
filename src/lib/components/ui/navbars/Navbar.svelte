<script lang="ts">
	import NavbarItem from './NavbarItem.svelte';

	let links = {
		home: {
			name: 'Home',
			href: '/',
			icon: null
		},
		about: {
			name: 'About',
			href: '/about',
			icon: null
		},
		contact: {
			name: 'Contact',
			href: '/contact',
			icon: null
		}
	};
</script>

<div class="h-20 flex items-center justify-center gap-5">
	<NavbarItem {...links.home} />
	<NavbarItem {...links.about} />
	<NavbarItem {...links.contact} />
</div>
