import IApp from './IApp';
import { Renderer } from './Renderer';

export default class DefaultApp implements IApp {
    onStartup = (renderer: Renderer) => {
        // Do nothing.
    }

    onShutdown = (renderer: Renderer) => {
        // Do nothing.
    }

    onUpdate = (renderer: Renderer) => {
        // Do nothing.
    }
}