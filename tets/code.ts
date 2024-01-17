if (figma.editorType === 'figma') {
  figma.showUI(__uiFiles__.main, { themeColors: true, })

  figma.currentPage.children

  figma.ui.onmessage = msg => {

    // const frame_exist: { value: boolean } = { value: false };
    // const frame = figma.createNodeFromSvg('FRAME');

    if (msg.type === 'create') {
      figma.showUI(__uiFiles__.third)
      const layer = figma.createFrame();
      layer.resize(1280, 720);
      layer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      figma.currentPage.appendChild(layer);

    }

    if (msg.type === 'create-layer') {
      //if (frame_exist.value === true){
      const comps: ComponentNode[] = [];
      const comp = figma.createComponent();

      for (const node of figma.currentPage.children) {
        if (node.type === "FRAME") {
          comp.resizeWithoutConstraints(node.width, node.height);
          node.appendChild(comp);
          comps.push(comp);
          comp.name = node.children.length.toString();
          //comp.name= comps.length.toString();
          //figma.currentPage.appendChild(comp);
        }
      }

    }
    if (msg.type === 'layers-look') {
      figma.showUI(__uiFiles__.secondary)
    }

    if (msg.type === 'filter') {
      //user traa selectne layer il da kazhe da se slozhi na vsi4ki
      //mozhe bi na otdelni butona idk
    }

    if (msg.type === 'merge') {
      if (figma.currentPage.selection.length < 2) { // figma.ui.postMessage({ type: 'not-selected'}, );
        figma.ui.postMessage({ type: 'not-selected' }, { origin: "*" })
      }
      else
        figma.flatten(figma.currentPage.selection)
      //ok flatten ne raboti za6toto sa components taka 4e trqbva da dobavq ne6tata ot ediniq sloi v drugiq i togava da iztriq ediiq i da flatten drugiq
      //ne6tata v komponentite mozhe da se flttenvat bez problem
      //mozhe bi vsi4ki addnato v komponent da se flatenva zaedno i pri merge da maham ediniq (ask mario)
    }

    if (msg.type === 'save') {
      if (figma.currentPage.selection.length == 0) {
        figma.ui.postMessage({ type: 'cant-save' }, { origin: "*" })
      }
      else {
        (async () => {
          await figma.currentPage.selection[0].exportAsync({ format: 'PNG' })
        })
      }
    }

    if (msg.type === 'close') {
      figma.closePlugin()
    }

    if (msg.type === 'back') {
      figma.showUI(__uiFiles__.main)
    }

  };
}

/*You can ask the user to draw with a pencil tool and then convert all newly added vector objects (drawings) into brush strokes. There is no way to make the effect real-time. Only when the user finishes the stroke you can convert it. */


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
        shape.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
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
          endpointNodeId: nodes[i + 1].id,
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
