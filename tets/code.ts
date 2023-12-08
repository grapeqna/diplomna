if (figma.editorType === 'figma') {
  figma.showUI(__html__);

  figma.ui.onmessage = msg => {

  // const frame_exist: { value: boolean } = { value: false };
  // const frame = figma.createNodeFromSvg('FRAME');

    if (msg.type === 'create') {
      //if (frame_exist.value === false)
      const layer = figma.createFrame();
      layer.resize(1280, 720);
      layer.fills = [{type: 'SOLID', color: {r:1, g:0, b:0}}];
      figma.currentPage.appendChild(layer);
     
    }
    if (msg.type === 'create-layer')
    {
    //if (frame_exist.value === true){
      const comps: ComponentNode[] =[];
      const comp = figma.createComponent();

      for (const node of figma.currentPage.children) {
        if (node.type === "FRAME")
        {
          comp.resizeWithoutConstraints(node.width, node.height); 
        }
      }
      comps.push(comp);
      figma.currentPage.appendChild(comp);
    
    }

   
    figma.closePlugin();
  };
}

if (figma.editorType === 'figjam') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many shapes and connectors on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-shapes') {
      const numberOfShapes = msg.count;
      const nodes: SceneNode[] = [];
      for (let i = 0; i < numberOfShapes; i++) {
        const shape = figma.createShapeWithText();
        // You can set shapeType to one of: 'SQUARE' | 'ELLIPSE' | 'ROUNDED_RECTANGLE' | 'DIAMOND' | 'TRIANGLE_UP' | 'TRIANGLE_DOWN' | 'PARALLELOGRAM_RIGHT' | 'PARALLELOGRAM_LEFT'
        shape.shapeType = 'ROUNDED_RECTANGLE'
        shape.x = i * (shape.width + 200);
        shape.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
        figma.currentPage.appendChild(shape);
        nodes.push(shape);
      };

      for (let i = 0; i < (numberOfShapes - 1); i++) {
        const connector = figma.createConnector();
        connector.strokeWeight = 8

        connector.connectorStart = {
          endpointNodeId: nodes[i].id,
          magnet: 'AUTO',
        };

        connector.connectorEnd = {
          endpointNodeId: nodes[i+1].id,
          magnet: 'AUTO',
        };
      };

      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };
};
