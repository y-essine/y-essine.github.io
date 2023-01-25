<script>
	import { Canvas, InteractiveObject, OrbitControls, T } from '@threlte/core';
	import { spring } from 'svelte/motion';
	import { degToRad } from 'three/src/math/MathUtils';

	const scale = spring(1);
</script>

<div class="flex justify-center items-center rounded-lg p-3 h-64 max-w-xl">
	<!-- <div class="text-3xl font-extrabold select-none">Canvas</div> -->
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[10, 10, 10]} fov={16}>
			<OrbitControls
				maxPolarAngle={degToRad(80)}
				enableZoom={false}
				target={{ y: 0.5 }}
				enablePan={false}
			/>
		</T.PerspectiveCamera>

		<T.DirectionalLight castShadow position={[3, 10, 10]} />
		<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
		<T.AmbientLight intensity={0.2} />

		<!-- Cube -->
		<T.Group scale={$scale}>
			<T.Mesh position.y={0.5} castShadow let:ref>
				<!-- Add interaction -->
				<InteractiveObject
					object={ref}
					interactive
					on:pointerenter={() => ($scale = 2)}
					on:pointerleave={() => ($scale = 1)}
				/>

				<T.BoxGeometry />
				<T.MeshStandardMaterial color="#333333" />
			</T.Mesh>
		</T.Group>

		<!-- Floor -->
		<T.Mesh receiveShadow rotation.x={degToRad(-90)}>
			<T.CircleGeometry args={[2, 72]} />
			<T.MeshStandardMaterial color="white" />
		</T.Mesh>
	</Canvas>
</div>
