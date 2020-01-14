import PointCloud from "./renderables/PointCloud";

export default class Scene{
    private pointClouds: Map<string, PointCloud>;

    constructor(){
        this.pointClouds = new Map();
    }
    
    public add(name: string, pointCloud: PointCloud) {
        this.pointClouds.set(name, pointCloud);
    }

    public get(name: string) {
        return this.pointClouds.get(name);
    }

    public getPointClouds(){
        return this.pointClouds;
    }
}