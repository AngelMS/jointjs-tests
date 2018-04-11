$(document).ready(function() {
    
    // This is the model to be used defined without coupling to the views - Models represents a diagrams
    var graph = new joint.dia.Graph;
    
    // This is a view using the model without defining its implementation
    var paper = new joint.dia.Paper({
        el: $('#myholder'),
        width: 600,
        height: 200,
        model: graph,
        gridSize: 1
    });
    
    // This is another view using the same model than the above one. Models can have multiple views
    // "model has views" = "is used by multiple views"   -   (the former is the documentation notation)
    var paperSmall = new joint.dia.Paper({
        el: $('#myholder-small'),
        width: 600,
        height: 100,
        model: graph,
        gridSize: 1
    });
    paperSmall.scale(.5);
    paperSmall.$el.css('pointer-events', 'none');
    
    // Elements are considered cells
    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });
    
    // Again, another cell (element)
    var rect2 = rect.clone();
    rect2.translate(300);
    
    // Links are considered cells as well
    var link = new joint.dia.Link({
        source: { id: rect.id },
        target: { id: rect2.id }
    });
    
    // The model collects cells (a term representing both elements and links)
    graph.addCells([rect, rect2, link]);
    
    
    // graph.on('all', function(eventName, cell) {
    //     console.log(arguments);
    // });
    
    rect.on('change:position', function(element) {
        console.log(element.id, ':', element.get('position'));
    });
});
