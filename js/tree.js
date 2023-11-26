var layoutInfo = {
    startTab: "none",
    startNavTab: "meta",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: [["layer-proxy", ["p"]]],
    previousTab: "",
    leftTab: true,
})