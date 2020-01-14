import PointCloud from "./renderables/PointCloud";

export default class AsciiPointCloudLoader {
    static Load = (dataString: string) => {
        console.log("Loading point cloud...");
        let data = dataString.replace(/\r\n/g, " ").split(" ");
        let cols = 9;
        let rows = data.length / cols;
        let perRow = 3;

        let positions = new Float32Array(rows * perRow);

        let p = 0;
        for (let i = 0; i < positions.length; i+= cols) {
            positions.set(
                [parseFloat(data[i]), parseFloat(data[i+1]), parseFloat(data[i+2])],
                p);
            p+=3;
        }
        console.log("Loading complete!");

        return new PointCloud(positions);
    }
}