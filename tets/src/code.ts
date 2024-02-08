import { Color } from "./Color";
if (figma.editorType === 'figma') {
  figma.showUI(__uiFiles__.main, { themeColors: true, height: 300 })
  //nz traa opravq da ne se scrollva

  // figma.currentPage.children
  const comps: ComponentNode[] = [];
  for (const i in comps) {
    figma.flatten(comps[i].children)
  }

  function clone_layer(val: readonly SceneNode[]) {
    let clone: SceneNode[]
    clone = val.slice()
    return clone
  }

  function clone_colors(val: RGB) {
    return { ...val };
  }

  // function clone_colors(val: readonly Paint[]) {
  //   let clone: Paint[]
  //   clone = val.slice()
  //   return clone
  // }

  figma.ui.onmessage = async msg => {

    // const frame_exist: { value: boolean } = { value: false };
    // const frame = figma.createNodeFromSvg('FRAME');

    if (msg.type === 'create') {
      // figma.showUI(__uiFiles__.third)
      const layer = figma.createFrame();
      layer.resize(1280, 720);
      layer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      figma.currentPage.appendChild(layer);

    }

    if (msg.type === 'create-layer') {
      const comp = figma.createComponent();

      for (const node of figma.currentPage.children) {
        if (node.type === "FRAME") {
          comp.resizeWithoutConstraints(node.width, node.height);
          node.appendChild(comp);
          comps.push(comp);
          comp.name = node.children.length.toString();
        }
      }

    }
    if (msg.type === 'layers-look') {
      figma.showUI(__uiFiles__.secondary)
    }


    if (msg.type === 'blur') {
      for (let i = 0; i <= figma.currentPage.selection.length; i++)
        if (figma.currentPage.selection[i].type === 'COMPONENT') {
          for (const child of (figma.currentPage.selection[i] as ComponentNode).children) {
            if (child.type === 'VECTOR' || child.type === 'ELLIPSE' || child.type === 'LINE' || child.type === 'RECTANGLE'
              || child.type === 'POLYGON' || child.type === 'STAR' || child.type === 'TEXT') {
              child.effects = [{ type: 'LAYER_BLUR', radius: 10, visible: true }];
              // child.effects = [{ type: 'BACKGROUND_BLUR', radius: 10, visible: true }];

            }
          }
        }
    }

    if (msg.type === 'background-blur') {
      for (let i = 0; i <= figma.currentPage.selection.length; i++)
        if (figma.currentPage.selection[i].type === 'COMPONENT') {
          for (const child of (figma.currentPage.selection[i] as ComponentNode).children) {
            if (child.type === 'VECTOR' || child.type === 'ELLIPSE' || child.type === 'LINE' || child.type === 'RECTANGLE'
              || child.type === 'POLYGON' || child.type === 'STAR' || child.type === 'TEXT') {
              // podlezhi na korekciq
              child.effects = [{ type: 'BACKGROUND_BLUR', radius: 10, visible: true }];
            }
          }
        }
    }

    // TODO improve types
    const clone = <T extends symbol | readonly Paint[] | readonly Effect[]>(
      node: T
    ): T => {
      return JSON.parse(JSON.stringify(node));
    };

    /*export const invertImage = async (node: ImagePaint) => {
      const newFills = [];
    
      const image = figma.getImageByHash(node.imageHash);
      const bytes = await image.getBytesAsync();
    
      figma.showUI(__html__, { visible: false });
    
      figma.ui.postMessage({ type: 'invert-image', data: { bytes } });
    
      const newBytes: Uint8Array = await new Promise((resolve) => {
        figma.ui.onmessage = (
          message: MessageEvent & { data: { bytes: Uint8Array } }
        ) => {
          // console.log({ message });
          if (message.type === 'invert-image') {
            resolve(message.data.bytes);
          }
        };
      });
    
      const newPaint = JSON.parse(JSON.stringify(node));
    
      newPaint.imageHash = figma.createImage(newBytes).hash;
      newFills.push(newPaint);
    
      return newFills;
    };*/


    // function invertColor(color: RGB) {
    //   color.r = 1 - color.r;
    //   color.g = 1 - color.g;
    //   color.b = 1 - color.b;

    //   return color;
    // }

    if (msg.type === 'inverted') {
      for (let i = 0; i <= figma.currentPage.selection.length; i++)
        if (figma.currentPage.selection[i].type === 'COMPONENT') {
          for (const child of (figma.currentPage.selection[i] as ComponentNode).children) {

            if (child.type === 'VECTOR') {
              const fills = clone(child.fills);

            } else {
              // fills.forEach((fill) => {
              //   if (fill.type === 'SOLID') {
              //     let color = clone_colors(fill.color)
              //     fill.color = invertColor(color)

              //   } else if (fill.type === 'GRADIENT_LINEAR') {
              //     console.log('Gradient fill:', fill.gradientStops);
              //   } else if (fill.type === 'IMAGE') {
              //     console.log('Image fill:', fill.imageRef);
              //   }
              //   // Add handling for other fill types as needed
              // });
            }

            if (child.type === 'ELLIPSE' || child.type === 'LINE' || child.type === 'RECTANGLE'
              || child.type === 'POLYGON' || child.type === 'STAR' || child.type === 'TEXT') {


            }
          }
        }
    }
  


if (msg.type === 'merge') {
  let layers: SceneNode[] = clone_layer(figma.currentPage.selection)
  if (layers.length < 2) {
    figma.ui.postMessage({ type: 'not-selected' }, { origin: "*" })
  }
  else {
    for (let i = 0; i < layers.length - 1; i++) {
      if (parseInt(layers[i].name) > parseInt(layers[i++].name) && layers[i].type === 'COMPONENT' && layers[i++].type === 'COMPONENT')
      //proverqvame koe e po golemiq sloi (po golemiq se maha) i dali i 2te izbrani sa component (demek tova koeto polzvam za sloi)
      {
        let kids: SceneNode[] = clone_layer((layers[i] as ComponentNode).children);
        for (let j = 0; j < kids.length; j++) {
          (layers[i++] as ComponentNode).appendChild(kids[j])
        }
        //prisuedinqvame decatana po-golemiq sloi v malkiq sloi
        figma.flatten((layers[i++] as ComponentNode).children)
        layers[i].remove //mahame po golemiq sloi, 4iito deca ve4e trqbwa da sa w drugiq sloi
        figma.currentPage.selection = layers
      }
      else {
        //su6toto no ako i++ e po golqmo
        let kids: SceneNode[] = clone_layer((layers[i++] as ComponentNode).children);
        for (let j = 0; j < kids.length; j++) {
          (layers[i] as ComponentNode).appendChild(kids[j])
        }
        figma.flatten((layers[i] as ComponentNode).children)
        layers[i++].remove
        figma.currentPage.selection = layers
      }
    }
  }
}

// if (msg.type === 'merge') {
//   let layers: SceneNode[] = clone(figma.currentPage.selection)
//   if (figma.currentPage.selection.length < 2) { // figma.ui.postMessage({ type: 'not-selected'}, );
//     figma.ui.postMessage({ type: 'not-selected' }, { origin: "*" })
//   }
//   else {
//     for (let i = 0; i < figma.currentPage.selection.length - 1; i++) {
//       if (parseInt(figma.currentPage.selection[i].name) > parseInt(figma.currentPage.selection[i++].name) && figma.currentPage.selection[i].type === 'COMPONENT' && figma.currentPage.selection[i++].type === 'COMPONENT')
//       //proverqvame koe e po golemiq sloi (po golemiq se maha) i dali i 2te izbrani sa component (demek tova koeto polzvam za sloi)
//       {
//         let kids: SceneNode[] = clone((figma.currentPage.selection[i] as ComponentNode).children);
//         for (let j = 0; j < kids.length; j++) {
//           (figma.currentPage.selection[i++] as ComponentNode).appendChild(kids[j])
//         }
//         //prisuedinqvame decatana po-golemiq sloi v malkiq sloi
//         figma.flatten((figma.currentPage.selection[i++] as ComponentNode).children)
//         figma.currentPage.selection[i].remove //mahame po golemiq sloi, 4iito deca ve4e trqbwa da sa w drugiq sloi
//       }
//       else {
//         //su6toto no ako i++ e po golqmo
//         let kids: SceneNode[] = clone((figma.currentPage.selection[i++] as ComponentNode).children);
//         for (let j = 0; j < kids.length; j++) {
//           (figma.currentPage.selection[i] as ComponentNode).appendChild(kids[j])
//         }
//         figma.flatten((figma.currentPage.selection[i] as ComponentNode).children)
//         figma.currentPage.selection[i++].remove
//       }
//     }
//   }
// }
//ok flatten ne raboti za6toto sa components taka 4e trqbva da dobavq ne6tata ot ediniq sloi v drugiq i togava da iztriq ediiq i da flatten drugiq
//ne6tata v komponentite mozhe da se flttenvat bez problem
//mozhe bi vsi4ki addnato v komponent da se flatenva zaedno i pri merge da maham ediniq (ask mario)


if (msg.type === 'save') {
  if (figma.currentPage.selection.length === 0 || figma.currentPage.selection[0].type != 'FRAME') {

    figma.ui.postMessage({ type: 'cant-save' }, { origin: "*" })
  }
  else {
    const imageBytes = await figma.currentPage.selection[0].exportAsync({ format: 'PNG' })
    let name = figma.currentPage.selection[0].name

    figma.ui.postMessage({ type: 'can-save', imageBytes, name }, { origin: "*" })
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

