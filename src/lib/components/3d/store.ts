import { writable, derived } from 'svelte/store';

// Contains the status of all models
export const statusOfModels = writable({}); // { uniqueName: "LOADING" | "ERROR" | "SUCCESS" }

// Returns a boolean if any model has a status of loading
export const modelsLoading = derived(statusOfModels, (statusObj) => {
	return Object.values(statusObj).includes('LOADING');
});

// Updates a model's status based on its unique name
export const updateModelStatus = (name: string, status: string) => {
	statusOfModels.update((current) => {
		return {
			...current,
			[name]: status
		};
	});
};

// List of example model URLs
export const modelURL = {
	shiba: '/static/3d/shiba/scene.gltf'
};
/*
	Models taken from the threejs examples. 
	Little City model created by antonmoek:
	https://sketchfab.com/antonmoek
*/
