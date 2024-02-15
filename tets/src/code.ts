type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
};

if (figma.editorType === 'figma') {
  figma.showUI(__uiFiles__.main, { themeColors: true, height: 300 })
  //nz traa opravq da ne se scrollva

  const comps: ComponentNode[] = [];

  function clone_layer(val: readonly SceneNode[]) {
    let clone: SceneNode[]
    clone = val.slice()
    return clone
  }

  function clone_colors(val: RGB) {
    return { ...val };
  }

  function clonePaint(val: Paint) {
    return { ...val }
  }

  figma.ui.onmessage = async msg => {


    if (msg.type === 'create') {
      const frame = figma.createFrame();
      const width=parseInt(msg.width,10)
      const height=parseInt(msg.height,10)

      frame.resize(width, height);
      frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      figma.currentPage.appendChild(frame);

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

    const clone = <T extends symbol | readonly Paint[] | readonly Effect[]>(
      node: T
    ): T => {
      return JSON.parse(JSON.stringify(node));
    };

    const clone_colorStop = <T extends ColorStop>(
      node: unknown
    ): T => {
      return JSON.parse(JSON.stringify(node));
    };


    function invertColor(color: RGB) {
      let c: RGB = { r: (1 - color.r), g: (1 - color.g), b: (1 - color.b) }
      return c;
    }

    if (msg.type === 'inverted') {
      for (let i = 0; i <= figma.currentPage.selection.length; i++)
        if (figma.currentPage.selection[i].type === 'COMPONENT') {
          for (const child of (figma.currentPage.selection[i] as ComponentNode).children) {
            if (child.type === 'VECTOR' || child.type === 'ELLIPSE' || child.type === 'LINE' || child.type === 'RECTANGLE'
              || child.type === 'POLYGON' || child.type === 'STAR' || child.type === 'TEXT') {

              if (!(child.fills === figma.mixed)) {
                child.fills = child.fills.map((originalFill) => {
                  let fill = clonePaint(originalFill) as Mutable<Paint>

                  if (fill.type === 'SOLID') {
                    let color = invertColor(clone_colors(fill.color))
                    fill.color = { r: color.r, b: color.b, g: color.g }
                    return fill
                  }

                  else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_ANGULAR'
                    || fill.type === 'GRADIENT_DIAMOND' || fill.type === 'GRADIENT_RADIAL') {

                    fill.gradientStops = fill.gradientStops.map((gradFill) => {
                      let stop = (clone_colorStop(gradFill) as Mutable<ColorStop>)
                      let color = (clone_colors(stop.color) as Mutable<RGB>)
                      color = invertColor(color)
                      stop.color = { r: color.r, b: color.b, g: color.g, a: stop.color.a }
                      return stop
                    })

                    return fill
                  }
                  return fill
                })
              }

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
            let kids: SceneNode[] = clone_layer((layers[i] as ComponentNode).children) as Mutable<SceneNode>[];
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
            let kids: SceneNode[] = clone_layer((layers[i++] as ComponentNode).children) as Mutable<SceneNode>[];
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

    //ok flatten ne raboti za6toto sa components taka 4e trqbva da dobavq ne6tata ot ediniq sloi v drugiq i togava da iztriq ediiq i da flatten drugiq
    //ne6tata v komponentite mozhe da se flttenvat bez problem
    //mozhe bi vsi4ki addnato v komponent da se flatenva zaedno i pri merge da maham ediniq

    if (msg.type === 'canvas') {
      figma.showUI(__uiFiles__.third, { width: 750, height: 600 })
    }

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

