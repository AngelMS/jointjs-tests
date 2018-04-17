$(document).ready(function() {
    // Diagrams consist of elements connected with links. A diagram in JointJS is represented by a model
    // joint.dia.Graph. This model then collects cells (a term representing both elements and links).
    // A cell could therefore be either an element (joint.dia.Element or its inheritants) or a link
    // (joint.dia.Link). In JointJS (starting from version 0.6), you manipulate models, not views.


    // This is the model to be used without coupling with the views - Models represents a diagrams
    var graph = new joint.dia.Graph;

    // This is a view using the model without defining its implementation
    var paper = new joint.dia.Paper({
        el: $('#paper-multiple-links'),
        width: 600,
        height: 200,
        model: graph,
        gridSize: 1
    });

    // This is another view using the same model than the above one. Models can have multiple views
    // "model has views" = "is used by multiple views" - (the former is the documentation notation)
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
        target: { id: rect2.id },
        smooth: true
    });
    
    var link2 = link.clone();
    var link3 = link.clone();
    var link4 = link.clone();
    var link5 = link.clone();

    // properties can be set at construction time or afterwards using the .set method
    // ===================================== (this snippet is the same than the above)
    // var link = new joint.dia.Link({
    //     target: { id: rect2.id }
    // });
    //
    // link.set("smooth", true)
    // link.set("source", { id: rect.id })
    // =====================================
    
    var myAdjustVertices = _.partial(adjustVertices, graph);
    
    // adjust vertices when a cell is removed or its source/target was changed
    graph.on('add remove change:source change:target', myAdjustVertices);
    
    // also when an user stops interacting with an element.
    paper.on('cell:pointerup', myAdjustVertices);
    
    // The model collects cells (a term representing both elements and links)
    graph.addCells([rect, rect2, link, link2, link3, link4, link5]); // <-- if this is set before the listeners with "myAdjustVertices" the graph won't load correctly linked
    
    // Logs all events for all the elements
    // graph.on('all', function(eventName, cell) {
    //     console.log(arguments);
    // });
    
    // Logs a particular element when it change its position
    rect.on('change:position', function(element) {
        console.log(element.id, ':', element.get('position'));
    });
});







function adjustVertices(graph, cell) {
    
    // If the cell is a view, find its model.
    cell = cell.model || cell;
    
    if (cell instanceof joint.dia.Element) {
        
        _.chain(graph.getConnectedLinks(cell)).groupBy(function(link) {
            // the key of the group is the model id of the link's source or target, but not our cell id.
            return _.omit([link.get('source').id, link.get('target').id], cell.id)[0];
        }).each(function(group, key) {
            // If the member of the group has both source and target model adjust vertices.
            if (key !== 'undefined') adjustVertices(graph, _.first(group));
        }).value();
        
        return;
    }
    
    // The cell is a link. Let's find its source and target models.
    var srcId = cell.get('source').id || cell.previous('source').id;
    var trgId = cell.get('target').id || cell.previous('target').id;
    
    // If one of the ends is not a model, the link has no siblings.
    if (!srcId || !trgId) return;
    
    var siblings = _.filter(graph.getLinks(), function(sibling) {
        
        var _srcId = sibling.get('source').id;
        var _trgId = sibling.get('target').id;
        
        return (_srcId === srcId && _trgId === trgId) || (_srcId === trgId && _trgId === srcId);
    });
    
    switch (siblings.length) {
        
        case 0:
        // The link was removed and had no siblings.
        break;
        
        case 1:
        // There is only one link between the source and target. No vertices needed.
        cell.unset('vertices');
        break;
        
        default:
        
        // There is more than one siblings. We need to create vertices.
        
        // First of all we'll find the middle point of the link.
        var srcCenter = graph.getCell(srcId).getBBox().center();
        var trgCenter = graph.getCell(trgId).getBBox().center();
        var midPoint = g.line(srcCenter, trgCenter).midpoint();
        
        // Then find the angle it forms.
        var theta = srcCenter.theta(trgCenter);
        
        // This is the maximum distance between links
        var gap = 20;
        
        _.each(siblings, function(sibling, index) {
            
            // We want the offset values to be calculated as follows 0, 20, 20, 40, 40, 60, 60 ..
            var offset = gap * Math.ceil(index / 2);
            
            // Now we need the vertices to be placed at points which are 'offset' pixels distant
            // from the first link and forms a perpendicular angle to it. And as index goes up
            // alternate left and right.
            //
            //  ^  odd indexes 
            //  |
            //  |---->  index 0 line (straight line between a source center and a target center.
            //  |
            //  v  even indexes
            var sign = index % 2 ? 1 : -1;
            var angle = g.toRad(theta + sign * 90);
            
            // We found the vertex.
            var vertex = g.point.fromPolar(offset, angle, midPoint);
            
            sibling.set('vertices', [{ x: vertex.x, y: vertex.y }]);
        });
    }
};
