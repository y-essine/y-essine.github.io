<script lang="ts">
	type Project = {
		name: string;
		description: string;
	};

	const _project: Project = {
		name: 'exocial',
		description: 'A social network for developers'
	};

	const fake = (delay: number, value: any): Promise<Project | any> => {
		return new Promise((resolve) => setTimeout(resolve, delay, value));
	};
</script>

{#await fake(1000, _project)}
	<h1>loading project</h1>
{:then project}
	<div class="max-w-md pl-2">
		<h2 class="text-green-300 font-bold">
			{project.name}
		</h2>
		<p class="text-zinc-400 pl-2 text-sm">
			{project.description}
		</p>
	</div>
{/await}
