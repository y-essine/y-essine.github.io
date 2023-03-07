<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import ReusableGLTF from '@/shared/ReusableGLTF.svelte';
</script>

<div class="flex justify-center items-center rounded-lg h-full max-w-xl relative">
	<div class="absolute h-full">
		<Canvas>
			<Scene>
				<ReusableGLTF modelURL={'/ballas/ballas.gltf'} />
			</Scene>
		</Canvas>
	</div>
</div>
