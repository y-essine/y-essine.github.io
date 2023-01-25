<script>
	import { Canvas, InteractiveObject, OrbitControls, T, useFrame } from '@threlte/core';
	import { spring } from 'svelte/motion';
	import { degToRad } from 'three/src/math/MathUtils';

	let scaleVal = 0.38;
	let scale = spring({ val: 0.5 }, { stiffness: 0.1, damping: 0.25 });

	let rotationVal = 0;
	let rotation = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.25 });
</script>

<div class="flex justify-center items-center rounded-lg p-3 h-64 max-w-xl relative">
	<div class="absolute right-0">
		<label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>Size: {Math.trunc((scaleVal / 1.5) * 100)}
		</label>
		<input
			id="steps-range"
			type="range"
			min=".38"
			max="1.5"
			bind:value={scaleVal}
			on:input={() => {
				scale.set({ val: scaleVal });
			}}
			step="0.01"
			class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
		/>
		<label for="steps-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>Rotation: {Math.trunc((rotationVal / 6.28) * 360)}
		</label>
		<input
			id="steps-range"
			type="range"
			min="0"
			max="6.28"
			bind:value={rotationVal}
			on:input={() => {
				rotation.set({ x: 0, y: rotationVal });
			}}
			step="0.01"
			class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
		/>
	</div>

	<Canvas>
		<T.PerspectiveCamera makeDefault position={[10, 10, 10]} fov={16}>
			<OrbitControls
				maxPolarAngle={degToRad(80)}
				enableZoom={false}
				target={{ y: 0.5 }}
				enablePan={false}
				enableRotate={false}
			/>
		</T.PerspectiveCamera>

		<T.Group scale={$scale.val} rotation.y={$rotation.y}>
			<T.Mesh position.y={0.5} castShadow let:ref>
				<InteractiveObject object={ref} interactive />
				<T.BoxGeometry />
				<T.MeshStandardMaterial color="#333333" />
			</T.Mesh>
		</T.Group>

		<T.Mesh receiveShadow rotation.x={degToRad(-90)}>
			<T.CircleGeometry args={[2, 72]} />
			<T.MeshStandardMaterial color="white" />
		</T.Mesh>

		<T.DirectionalLight castShadow position={[3, 10, 10]} />
		<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
		<T.AmbientLight intensity={0.2} />
	</Canvas>
</div>
