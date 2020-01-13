import IApp from './IApp';
import { Renderer } from './Renderer';
import PointCloud from './PointCloud';
import AsciiLoader from './AsciiPointCloudLoader';
import { vec3 } from 'gl-matrix';
import axios from "axios";

export default class TestApp implements IApp {

    onStartup = (renderer: Renderer) => {
        renderer.getCamera().setPosition(vec3.fromValues(0, 0, -2));

        // Load point cloud.
        axios.get("/data/guanyin.asc")
            .then((response: any) => {
                let pointCloud = AsciiLoader.Load(response.data);
                renderer.scene.add("points", pointCloud)
            });
    }

    onShutdown = (renderer: Renderer) => {
        // Do nothing.
    }

    onUpdate = (renderer: Renderer) => {
        let points = renderer.scene.get("points");
        if (points) {
            let i = renderer.getRenderCount() / 100;
            points.setRotation(vec3.fromValues(0, i, 0));
        }
    }
}