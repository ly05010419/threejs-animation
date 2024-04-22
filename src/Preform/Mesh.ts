import { BoxGeometry, Mesh, Vector3, SkinnedMesh } from 'three'
export async function getCube(size: Vector3, position = new Vector3()) {
	const geometry = new BoxGeometry(size.x, size.y, size.z);
	const cube = new Mesh(geometry);
	cube.position.copy(position)
	cube.castShadow = true;
	cube.receiveShadow = true;

	return cube
}
export async function getSkinned(size: Vector3, position = new Vector3()) {
	const geometry = new BoxGeometry(size.x, size.y, size.z);
	const cube = new SkinnedMesh(geometry);
	cube.position.copy(position)
	cube.castShadow = true;
	cube.receiveShadow = true;

	return cube
}
