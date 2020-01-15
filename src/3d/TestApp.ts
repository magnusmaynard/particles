import IApp from './IApp';
import { Renderer } from './Renderer';
import PointCloud from './renderables/PointCloud';
import AsciiLoader from './AsciiPointCloudLoader';
import { vec3 } from 'gl-matrix';
import axios from "axios";

export default class TestApp implements IApp {

    onStartup = (renderer: Renderer) => {
        renderer.getCamera().setPosition(vec3.fromValues(0, 0, -3));

        // Load point cloud.
        axios.get("/data/buda_med.asc")
            .then((response: any) => {
                let pointCloud = AsciiLoader.Load(response.data);
                renderer.scene.add("buda", pointCloud)
            });

        // Add grid of points.
        let positions: number[] = [];
        let size =  50;
        let spacing = 5;
        for (let y = -size; y < size; y++) {
            for (let x = -size; x < size; x++) {
                for (let z = -size; z < size; z++) {
                    positions.push(x * spacing, y * spacing, z * spacing);
                }
            }
        }

        renderer.scene.add(
            "grid",
            new PointCloud(new Float32Array(positions)))
    }

    onShutdown = (renderer: Renderer) => {
        // Do nothing.
    }

    onUpdate = (renderer: Renderer) => {
        let grid = renderer.scene.get("grid");
        if (grid) {
            let i = renderer.getRenderCount() / 100;
            grid.setRotation(vec3.fromValues(0, i, 0));
            grid.setTranslation(vec3.fromValues(0, Math.cos(i) * 100,Math.sin(i) * 100));
        }

        let buda = renderer.scene.get("buda");
        if (buda) {
            let i = renderer.getRenderCount() / 100;
            buda.setRotation(vec3.fromValues(0, -i, 0));
        }
    }
}