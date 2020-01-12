import IApp from './IApp';
import { Renderer } from './Renderer';
import PointCloud from './PointCloud';
import { vec3 } from 'gl-matrix';

export default class TestApp implements IApp {

    onStartup = (renderer: Renderer) => {
        var positions: number[] = [];

        for (var y = -100; y < 100; y++) {
            for (var x = -100; x < 100; x++) {
                positions.push(x * 0.1, y * 0.1, 10.0);
            }
        }

        let pointCloud = new PointCloud(new Float32Array(positions));
        renderer.scene.add("points", pointCloud);
    }

    onShutdown = (renderer: Renderer) => {
        // Do nothing.
    }

    onUpdate = (renderer: Renderer) => {
        let points = renderer.scene.get("points");
        if(points) {
            let i = renderer.getRenderCount() / 100;
            points.setTranslation(vec3.fromValues(Math.sin(i), Math.cos(i), 0));
        }
    }
}