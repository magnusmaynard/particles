import React from 'react';
import './App.css';

import { Renderer } from './3d/Renderer';
import TestApp from './3d/TestApp';

const App: React.FC = () => {
  const [renderer, setRenderer] = React.useState<Renderer | null>(null);

  React.useEffect(() => {
    const canvas: HTMLCanvasElement | null = document.querySelector('#gl-canvas');
    let app = new TestApp();
    if (canvas != null) {
      setRenderer(new Renderer(canvas, app));
    }
  }, []);

  return (
    <React.Fragment>
      <div className="app">
        <canvas id="gl-canvas"></canvas>
      </div>
    </React.Fragment>
  );
}

export default App;
