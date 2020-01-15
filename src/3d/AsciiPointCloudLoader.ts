import PointCloud from "./renderables/PointCloud";

export default class AsciiPointCloudLoader {
    static Load = (dataString: string) => {
        console.log("Loading point cloud...");

        const rows = dataString.split(/\r\n/g);
        const perRow = 3;
        let positions = new Float32Array(rows.length * perRow);

        for (let i = 0; i < rows.length; i+= perRow) {
            const row = rows[i].split(" ");
            positions.set(
                [parseFloat(row[0]), parseFloat(row[1]), parseFloat(row[2])], i);
        }

        console.log("Loading complete!");

        return new PointCloud(positions);
    }
}