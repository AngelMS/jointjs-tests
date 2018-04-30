$(function() {
    
    var graph = new joint.dia.Graph;
    
    var paper = new joint.dia.Paper({
        el: $('#paper-link-snapping'),
        width: 2000,
        height: 500,
        gridSize: 1,
        model: graph,
        defaultLink: new joint.dia.Link({
            attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
        }),
        validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
            // Prevent loop linking
            return (magnetS !== magnetT);
        },
        // Enable link snapping within 75px lookup radius
        snapLinks: { radius: 75 },
        markAvailable: true
    });
    
    var uml = joint.shapes.uml;
    
    var init = new uml.StartState({
        position: { x:20  , y: 20 },
        size: { width: 30, height: 30 },
        attrs: {
            'circle': {
                fill: '#4b4a67',
                stroke: 'none'
            }
        }
    });
    
    var m1 = new joint.shapes.devs.Model({
        position: { x: 150, y: 50 },
        size: { width: 90, height: 90 },
        inPorts: ['in1','in2'],
        outPorts: ['out'],
        ports: {
            groups: {
                'in': {
                    attrs: {
                        '.port-body': {
                            fill: 'rgba(48, 208, 198, 0)',
                            stroke: 'rgba(48, 208, 198, 0)',
                            magnet: 'passive'
                        }
                    }
                },
                'out': {
                    attrs: {
                        '.port-body': {
                            fill: '#E74C3C'
                        }
                    }
                }
            }
        },
        attrs: {
            '.label': { text: 'Model', 'ref-x': .5, 'ref-y': .2 },
            rect: {
                rx: 7,
                ry: 7,
                fill: 'rgba(230, 220, 220, 0.35)',
                stroke: 'rgba(54, 54, 54, 0.5)',
                'stroke-width': 1.5
             }
        }
    });
    
    var m3 = new joint.shapes.devs.Model({
        position: { x: 150, y: 50 },
        size: { width: 90, height: 90 },
        attrs: {
            '.label': { text: 'Model', 'ref-x': .5, 'ref-y': .2 },
            rect: {
                rx: 7,
                ry: 7,
                fill: 'rgba(48, 208, 198, 0.1)',
                stroke: 'rgba(48, 208, 198, 0.5)',
                'stroke-width': 1.5
             }
        }
    });
    
    m3.set("magnet", true);
    
    // Elements are considered cells
    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { 
            rect: { 
                fill: 'blue' 
            }, 
            text: { 
                text: 'my box', 
                fill: 'white' 
            } 
        }
    });
    
    graph.addCell(init);
    
    graph.addCell(m1);
    
    var m2 = m1.clone();
    m2.translate(300, 0);
    m3.translate(600, 0);
    rect.translate(900, 0);
    
    graph.addCells(m2, m3, rect);
    m2.attr('.label/text', 'Model 2');
    
});
