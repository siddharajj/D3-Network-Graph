            // dimensions
var width = 1600;
var height = 600;

var margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
}

// create an svg to draw in

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('transform', 'translate(' + margin.top + ',' + margin.left + ')');

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.id;
    })
    .strength(0.007))
    .force("charge", d3.forceManyBody().strength(-250))
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data.json", function(error, graph) {
    var nodes = graph.nodes;

    var links = []
    
    for(i=0; i<graph.links.length;i++){
        links.push({
            source: graph.links[i].node01,
            target: graph.links[i].node02,
            amount: graph.links[i].amount
        });
    }
    
    for (var i =0; i<nodes.length; i++){
        var weight = 0
        var conn = 0
        for(var j=0;j<links.length;j++){
            if (nodes[i].id == links[j].source|| nodes[i].id == links[j].target){
                weight += links[j].amount
                conn += 1   
            }
        }
        nodes[i].weight = weight
        nodes[i].connections = conn
    }
    
    var link = svg.selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr('stroke', '#ddd')
        .attr('stroke-width', function(d){
            return d.amount*0.012
        });
    
    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
    
    node.append("circle")
        .attr("class", "node")
        .attr("r", function(d){
            return d.weight * 0.02
        })
        .attr("fill", '#009c2d')
        .attr("opacity", '1')
        .on("mouseover", mouseOver(.2))
        .on("mouseout", mouseOut);

   
    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation
        .force("link")
        .links(links);

    function ticked() {
        link.attr("d", positionLink);
        node.attr("transform", positionNode);
    }

    function positionLink(d) {
        return "M" + d.source.x + "," + d.source.y +
            " " + d.target.x + "," + d.target.y;
    }

    function positionNode(d) {

        if (d.x < 0) {
            d.x = 0
        };
        if (d.y < 0) {
            d.y = 0
        };
        if (d.x > width) {
            d.x = width
        };
        if (d.y > height) {
            d.y = height
        };
        return "translate(" + d.x + "," + d.y + ")";
    }

    var linkedByIndex = {};
    links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    svg.selectAll('circle').on("mousemove",function(d){
        div.transition()		
            .duration(100)		
            .style("opacity", 0.8);		
        div	.html("<b>"+d.id +"</b><br/><i>Total amount: "+d.weight + "<br/>Connections: "+ d.connections+"</i>")	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 35) + "px"); 
    });

    function mouseOver(opacity) {
        return function(d) {

            svg.selectAll('circle').attr('opacity',0.2);
            d3.select(this).attr('opacity',1)

            link.style("stroke-opacity", function(o) {
                return o.source === d || o.target === d ? 1 : 0;
            });
            link.style("stroke", function(o){
                return o.source === d || o.target === d ? "yellow" : "#aaa";
            });
        };
    }

    function mouseOut() {
        svg.selectAll('circle').attr('opacity',1);
        link.style("stroke-opacity", 1);
        link.style("stroke", "#aaa");
        div.transition()		
            .duration(200)		
            .style("opacity", 0);	
    }

});