type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
};

if (figma.editorType === 'figma') {
  figma.showUI(__uiFiles__.main, { themeColors: true, height: 298 })

  const comps: ComponentNode[] = [];

  function clone_layer(val: readonly SceneNode[]) {
    let clone: SceneNode[]
    clone = val.slice()
    return clone
  }

  function cloneScene(val: SceneNode) {
    return { ...val };
  }

  function clone_colors(val: RGB) {
    return { ...val };
  }

  function clonePaint(val: Paint) {
    return { ...val }
  }

  figma.ui.onmessage = async msg => {


    if (msg.type === 'create') {
      
      const width = parseInt(msg.width, 10)
      const height = parseInt(msg.height, 10)

      if (width > 10 && height > 10) {
        const frame = figma.createFrame();
        frame.resize(width, height);
        frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        figma.currentPage.appendChild(frame);
        figma.ui.postMessage({ type: 'frame-added' }, { origin: "*" })
      }
      else{
        figma.ui.postMessage({ type: 'too-small' }, { origin: "*" })
      }
      

    }

    if (msg.type === 'create-layer') {
      const comp = figma.createComponent();

      for (const node of figma.currentPage.children) {
        if (node.type === "FRAME") {
          comp.resizeWithoutConstraints(node.width, node.height);
          node.appendChild(comp);
          comps.push(comp);
          figma.ui.postMessage({ type: 'layer-added' }, { origin: "*" })
          comp.name = node.children.length.toString();
        }
      }

    }
    if (msg.type === 'layers-look') {
      figma.showUI(__uiFiles__.secondary, { themeColors: true, height: 260 })

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
          figma.ui.postMessage({ type: 'filter-added' }, { origin: "*" })
        }
    }

    if (msg.type === 'background-blur') {
      for (let i = 0; i <= figma.currentPage.selection.length; i++)
        if (figma.currentPage.selection[i].type === 'COMPONENT') {
          for (const child of (figma.currentPage.selection[i] as ComponentNode).children) {
            if (child.type === 'VECTOR' || child.type === 'ELLIPSE' || child.type === 'LINE' || child.type === 'RECTANGLE'
              || child.type === 'POLYGON' || child.type === 'STAR' || child.type === 'TEXT') {
              child.effects = [{ type: 'BACKGROUND_BLUR', radius: 10, visible: true }];
            }
          }
          figma.ui.postMessage({ type: 'filter-added' }, { origin: "*" })
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
                    figma.ui.postMessage({ type: 'filter-added' }, { origin: "*" })
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

                    figma.ui.postMessage({ type: 'filter-added' }, { origin: "*" })
                    return fill
                  }
                  figma.ui.postMessage({ type: 'filter-added' }, { origin: "*" })
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
          if (parseInt(layers[i].name) > parseInt(layers[i + 1].name) &&
            layers[i].type === 'COMPONENT' && layers[i + 1].type === 'COMPONENT') {
            let kids: SceneNode[] = clone_layer((layers[i] as ComponentNode).children) as Mutable<SceneNode>[];
            for (let j = 0; j < kids.length; j++) {
              (layers[i + 1] as ComponentNode).appendChild(kids[j])
            }

            layers[i].remove
            figma.currentPage.selection = layers
            figma.currentPage.selection[i].remove
            figma.ui.postMessage({ type: 'merged' }, { origin: "*" })
          }
          else {
            let kids: SceneNode[] = clone_layer((layers[i + 1] as ComponentNode).children) as Mutable<SceneNode>[];
            for (let j = 0; j < kids.length; j++) {
              (layers[i] as ComponentNode).appendChild(kids[j])
            }
            layers[i + 1].remove
            figma.currentPage.selection = layers
            figma.currentPage.selection[i + 1].remove
            figma.ui.postMessage({ type: 'merged' }, { origin: "*" })

          }
        }
      }
    }

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

    if (msg.type === 'saveImg') {
      let img = figma.createImage(msg.uintArray)
      for (const node of figma.currentPage.children) {
        if (node.type === "FRAME") {
          const rectangle = figma.createRectangle();
          rectangle.fills = [
            {
              type: 'IMAGE',
              imageHash: img.hash,
              scaleMode: 'FILL',
            },
          ];
          node.appendChild(rectangle)
        }
      }

    }

    if (msg.type === 'close') {
      figma.closePlugin()
    }

    if (msg.type === 'back') {
      figma.showUI(__uiFiles__.main, { themeColors: true, height: 298 })
    }

  };
}
