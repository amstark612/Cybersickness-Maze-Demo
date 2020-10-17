import { AbstractMesh, Mesh, MeshBuilder, TransformNode  } from "@babylonjs/core/Meshes";
import { Color3, Scene, StandardMaterial } from "@babylonjs/core";
import { Control3D } from "@babylonjs/gui/3D/controls";

export class Plane3D extends Control3D
{
    public name: string;

    constructor(scene: Scene, name?: string)
    {
        super(name);
        let plane = this._createNode(scene);
    }

    protected _createNode(scene: Scene): TransformNode
    {
        return MeshBuilder.CreatePlane(this.name + "_rootMesh", { size: 1 }, scene);
    }

    protected _affectMaterial(mesh: AbstractMesh) : void
    {
        let material = new StandardMaterial(this.name + "Material", mesh.getScene());
        material.diffuseColor = new Color3(1, 1, 1);
        material.alpha = 0.7;

        mesh.material = material;
    }
}