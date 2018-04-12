$(document).ready(function() {
    /*
    First we need to create a custom view that overrides the pointerdown() and pointermove() methods.
    These methods make sure that the x and y coordinates passed to the default pointerdown() and
    pointermove() methods are located on the boundary of our ellipse object. To compute the points
    on the boundary of our ellipse, we simply take advantage of the
    ellipse.prototype.intersectionWithLineFromCenterToPoint() function. [A complete documentation to
    the geometry library of JointJS can be found on http://www.daviddurman.com/hidden-gold-of-jointjs-the-geometry-library.html ]
    */

    // This is the ellipse that will be used as a constraint for our element dragging.
    var constraint = g.ellipse(g.point(200, 150), 100, 80);

    var ConstraintElementView = joint.dia.ElementView.extend({

        pointerdown: function(evt, x, y) {
            var position = this.model.get('position');
            var size = this.model.get('size');
            var center = g.rect(position.x, position.y, size.width, size.height).center();
            var intersection = constraint.intersectionWithLineFromCenterToPoint(center);
            joint.dia.ElementView.prototype.pointerdown.apply(this, [evt, intersection.x, intersection.y]);
        },
        pointermove: function(evt, x, y) {
            var intersection = constraint.intersectionWithLineFromCenterToPoint(g.point(x, y));
            joint.dia.ElementView.prototype.pointermove.apply(this, [evt, intersection.x, intersection.y]);
        }
    });

    /*
    Now we can just create a graph and paper as usual and tell the paper to use our custom view
    for all the element models. [Note that if you need a custom view for just one type of model
    (not all the models added to the paper), you can do that be defining a view for a specific type.
    An example of this can be found in the forum page.]
    */

    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#paper'),
        width: 650,
        height: 400,
        gridSize: 1,
        model: graph,
        elementView: ConstraintElementView
    });


    /*
    We're almost there! Now we just add a circle element to the paper which will be the one whose
    dragging we just constraint. We also draw our ellipse so that it is visible in the paper. Here
    we'll use the built-in Vectorizer library that makes life easier when dealing with SVG.
    */

    var earth = new joint.shapes.basic.Circle({
        position: constraint.intersectionWithLineFromCenterToPoint(g.point(100, 100)).offset(-10, -10),
        size: { width: 20, height: 20 },
        attrs: { text: { text: 'earth' }, circle: { fill: '#2ECC71' } },
        name: 'earth'
    });

    var orbit = V('<ellipse/>');
    orbit.attr({
        cx: constraint.x, cy: constraint.y, rx: constraint.a, ry: constraint.b,
        fill: '#ECF0F1', stroke: '#34495E', 'stroke-dasharray': [2, 2]
    });

    V(paper.viewport).append(orbit);
    graph.addCell(earth);



});
