import { Color3, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { Button3D, Control3D, PlanePanel } from "@babylonjs/gui/3D";

// custom classes
import { UI } from "./UI";

export class gui3D extends UI
{
    private _3Dgui: GUI3DManager;
    private _3Dpanel: PlanePanel;

    constructor(name: string, scene: Scene, playerCollider: Mesh)
    {
        super(name);    // creates fullscreen 2D UI

        // babylon 3D gui sucks...will come back here and code custom Control3D classes later

        // this._3Dgui = new GUI3DManager(scene);
        // this._3Dpanel = new PlanePanel();
        // this._3Dpanel.name = "Panel";

        // this._3Dgui.addControl(this._3Dpanel);
        // this._3Dpanel.linkToTransformNode(playerCollider);  // make sure panel follows user

        // let background = new plane3D(scene, "background");
        // this._3Dpanel.addControl(background);
    }
}