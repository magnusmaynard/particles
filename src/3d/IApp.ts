import { Renderer } from './Renderer';

export default interface IApp {
    onStartup: (renderer: Renderer) => void;
    onUpdate: (renderer: Renderer) => void;
    onShutdown: (renderer: Renderer) => void;
}