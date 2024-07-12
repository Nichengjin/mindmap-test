let network;
let selectedNode;
let isAddingEdge = false;
let sourceNode = null;

const sampleData = {
    nodes: [
        { id: 1, label: "Root Node" },
        { id: 2, label: "Child Node 1" },
        { id: 3, label: "Child Node 2" },
        { id: 4, label: "Grandchild Node 1" },
        { id: 5, label: "Grandchild Node 2" }
    ],
    edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 2, to: 5 }
    ]
};

        document.getElementById("mindmapForm").addEventListener("submit", function(event) {
            event.preventDefault();
            generateMindmap();
        });
        var options = {
            nodes: {
                shape: 'dot',
                size: 20,
                borderWidth: 0,
                borderWidthSelected: 0,
                color: {
                    border: 'rgba(255, 255, 255, 0)',
                    background: 'rgba(255, 255, 255, 0.7)',
                    highlight: {
                        border: 'rgba(255, 255, 255, 0)',
                        background: 'rgba(255, 255, 255, 0.9)'
                    },
                    hover: {
                        border: 'rgba(255, 255, 255, 0)',
                        background: 'rgba(255, 255, 255, 0.9)'
                    }
                },
                shadow: {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.2)',
                    size: 5,
                    x: 0,
                    y: 0
                },
                chosen: {
                    node: function(values, id, selected, hovering) {
                        values.shadowSize = 8;
                        values.shadowX = 0;
                        values.shadowY = 0;
                    }
                },
                font: {
                    size: 8,
                    face: 'Poppins',
                }
            },
            edges: {
                // width: 0,
                // color: {
                //     color: 'rgba(0, 0, 0, 0)',
                //     highlight: 'rgba(0, 0, 0, 0)',
                //     hover: 'rgba(0, 0, 0, 0)'
                // },
                // selectionWidth: 0,
                // smooth: {
                //     type: 'continuous'
                // }
                smooth: {
                    type: "cubicBezier",
                    forceDirection: "horizontal",
                    roundness: 0.4
                },
                shadow: true,
                width: 5,
                color: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    highlight: 'rgba(0, 0, 0, 0.1)',
                    hover: 'rgba(0, 0, 0, 0.1)'
                },
                chosen: {
                    edge: function(values, id, selected, hovering) {
                        values.shadow = true;
                        values.shadowColor = 'rgba(0, 0, 0, 0.1)';
                        values.shadowSize = 8;
                        values.shadowX = 0;
                        values.shadowY = 0;
                    }
                }
            },
            interaction: {
                hover: true,
                zoomView: true,
                dragView: true
            },
            physics: {
                stabilization: false,
                barnesHut: {
                    gravitationalConstant: -2000,
                    springConstant: 0.001,
                    springLength: 200
                }
            },
            manipulation: {
                enabled: true,
                addNode: function(nodeData, callback) {
                    nodeData.label = prompt("Enter the label for the new node:");
                    callback(nodeData);
                },
                editNode: function(nodeData, callback) {
                    nodeData.label = prompt("Enter the new label for the node:", nodeData.label);
                    callback(nodeData);
                },
                addEdge: function(edgeData, callback) {
                    if (edgeData.from !== edgeData.to) {
                        callback(edgeData);
                    }
                },
                deleteNode: true,
                deleteEdge: true
            }
        };
        function generateMindmap(nodeId = null) {
            const knowledgePoint = nodeId ? selectedNode.label : document.getElementById("knowledgePoint").value;
            
            // fetch("/generate_mindmap", {
            //     method: "POST", 
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({ knowledgePoint: knowledgePoint, parentId: nodeId })
            // })
            // .then(response => response.json())
            // .then(data => {
                const data = sampleData;
                const container = document.getElementById("mindmap");
                const nodes = new vis.DataSet(data.nodes);
                const edges = new vis.DataSet(data.edges);
                const networkData = { nodes, edges };
                const options = {
                    // ... (existing options) ...
                    nodes: {
                        shape: "dot",
                        font: {
                            size: 16,
                            color: "#333",
                            face: "Poppins"
                        },
                        borderWidth: 2,
                        shadow: true
                    },
                    edges: {
                        smooth: {
                            type: "cubicBezier",
                            forceDirection: "horizontal",
                            roundness: 0.4
                        },
                        shadow: true
                    },
                    physics: {
                        stabilization: false,
                        barnesHut: {
                            gravitationalConstant: -2000,
                            springConstant: 0.001,
                            springLength: 200
                        }
                    },
                    manipulation: {
                        enabled: true
                    }
                };
                if (!network) {
                    network = new vis.Network(container, networkData, options);
                    setupNetworkEvents();
                } else {
                    nodes.forEach(node => {
                        if (!network.body.data.nodes.get(node.id)) {
                            network.body.data.nodes.add(node);
                        }
                    });
                    edges.forEach(edge => {
                        if (!network.body.data.edges.get(edge.id)) {
                            network.body.data.edges.add(edge);
                        }
                    });
                }
            // });
        }

        function setupNetworkEvents() {
            const contextMenu = document.getElementById("contextMenu");
            const infoCard = document.getElementById("info-card");
            network.setOptions(options);

            network.on("click", function (params) {
                // if (params.nodes.length > 0) {
                //     const nodeId = params.nodes[0];
                //     showNodeInfo(nodeId);
                // } else {
                //     hideInfoCard();
                // }
                if (isAddingEdge) {
                    if (params.nodes.length > 0) {
                        const targetNode = params.nodes[0];
                        if (sourceNode !== targetNode) {
                            addEdge(sourceNode, targetNode);
                            isAddingEdge = false;
                            sourceNode = null;
                            network.setOptions({ manipulation: { enabled: true } });
                        }
                    }
                } else if (isDeletingEdge) {
                    if (params.nodes.length > 0) {
                        const targetNode = params.nodes[0];
                        if (edgeSourceNode !== targetNode) {
                            deleteEdgeBetweenNodes(edgeSourceNode, targetNode);
                            isDeletingEdge = false;
                            edgeSourceNode = null;
                            network.setOptions({ manipulation: { enabled: true } });
                        }
                    }
                } else {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        showNodeInfo(nodeId);
                    } else {
                        hideInfoCard();
                    }
                }
            });

            network.on("afterDrawing", function() {
                // Apply your styles here
                document.querySelectorAll('.vis-network .vis-node').forEach(node => {
                  node.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                  node.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                  node.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                  node.style.transition = 'all 0.3s ease';
                });
              });

            network.on("hoverNode", function(params) {
                document.getElementById(params.node).style.transform = 'scale(1.2)';
                document.getElementById(params.node).style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
              });
              
              network.on("blurNode", function(params) {
                document.getElementById(params.node).style.transform = 'scale(1)';
                document.getElementById(params.node).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              });

            
            
            // network.on("oncontext", function (params) {
            //     params.event.preventDefault();
            //     const nodeId = network.getNodeAt(params.pointer.DOM);
            //     if (nodeId) {
            //         selectedNode = network.body.data.nodes.get(nodeId);
            //         contextMenu.style.display = 'block';
            //         contextMenu.style.left = params.event.clientX + 'px';
            //         contextMenu.style.top = params.event.clientY + 'px';
            //     }
            // });
            network.on("oncontext", function (params) {
                params.event.preventDefault();
                const nodeId = network.getNodeAt(params.pointer.DOM);
                if (nodeId) {
                    // selectedNode = network.body.data.nodes.get(nodeId);
                    // showContextMenu(params.event.clientX, params.event.clientY);
                    selectedNode = network.body.data.nodes.get(nodeId);
                    const nodePosition = network.getPositions([nodeId])[nodeId];
                    const canvasPosition = network.canvasToDOM(nodePosition);
        
                    showContextMenu(canvasPosition.x, canvasPosition.y);
                } else {
                    showContextMenu(params.event.clientX, params.event.clientY, true);
                }
            });

            document.addEventListener('click', function() {
                // contextMenu.style.display = 'none';
                hideContextMenu();
            });

            // document.getElementById("expandNode").addEventListener("click", function() {
            //     if (selectedNode) {
            //         generateMindmap(selectedNode.id);
            //     }
            // });

            // document.getElementById("addNode").addEventListener("click", function() {
            //     addNode();
            // });
        
            // document.getElementById("deleteNode").addEventListener("click", function() {
            //     if (selectedNode) {
            //         deleteNode(selectedNode.id);
            //     }
            // });

            network.on("zoom", function (params) {
                document.body.style.cursor = 'move';
            });
        
            network.on("dragStart", function (params) {
                document.body.style.cursor = 'grabbing';
            });
        
            network.on("dragEnd", function (params) {
                document.body.style.cursor = 'grab';
            });

            //smooth zoom
            network.on("zoom", function (params) {
                var scale = network.getScale();
                network.moveTo({
                    scale: scale,
                    animation: {
                        duration: 1000,
                        easingFunction: "easeInOutQuad"
                    }
                });
            });
        }


// function showNodeInfo(nodeId) {
//     const node = network.body.data.nodes.get(nodeId);
//     const infoCard = document.getElementById('info-card');
//     const nodeTitle = document.getElementById('node-title');
//     const nodeContent = document.getElementById('node-content');

//     nodeTitle.textContent = node.label;
//     nodeContent.textContent = node.title || 'No additional information available';

//     infoCard.classList.remove('hidden');
//     infoCard.classList.add('visible');

//     setTimeout(() => {
//         infoCard.style.transform = 'translateY(-50%) translateX(0)';
//         infoCard.style.opacity = '1';
//     }, 10);

//     network.selectNodes([nodeId]);
//     const selectedNode = document.getElementsByClassName('vis-node-select')[0];
//     if (selectedNode) {
//         selectedNode.classList.add('active');
//     }
// }
// function showContextMenu(x, y, addOnly = false) {
//     const contextMenu = document.getElementById("contextMenu");
//     contextMenu.style.left = x + 'px';
//     contextMenu.style.top = y + 'px';
//     contextMenu.innerHTML = '';

//     if (!addOnly) {
//         contextMenu.innerHTML += '<button id="expandNode">Expand this node</button>';
//         contextMenu.innerHTML += '<button id="deleteNode">Delete this node</button>';
//     }
//     contextMenu.innerHTML += '<button id="addNode">Add new node</button>';

//     contextMenu.style.display = 'block';
// }
function showContextMenu(x, y, addOnly = false) {
    const contextMenu = document.getElementById("contextMenu");
    // contextMenu.style.left = x + 'px';
    // contextMenu.style.top = y + 'px';
    contextMenu.style.left = `${x + 10}px`;
    contextMenu.style.top = `${y + 10}px`;
    
    // Ensure menu is within viewport
    const rect = contextMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (rect.right > viewportWidth) {
        contextMenu.style.left = `${x - rect.width - 10}px`;
    }
    if (rect.bottom > viewportHeight) {
        contextMenu.style.top = `${y - rect.height - 10}px`;
    }
    contextMenu.innerHTML = '';

    if (!addOnly) {
        const expandButton = document.createElement('button');
        expandButton.textContent = 'Expand with AI';
        expandButton.onclick = function() {
            if (selectedNode) {
                generateMindmap(selectedNode.id);
            }
            hideContextMenu();
        };
        contextMenu.appendChild(expandButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete this node';
        deleteButton.onclick = function() {
            if (selectedNode) {
                deleteNode(selectedNode.id);
            }
            hideContextMenu();
        };
        contextMenu.appendChild(deleteButton);
    }

    const addButton = document.createElement('button');
    addButton.textContent = 'Add new node';
    addButton.onclick = function() {
        addNode();
        hideContextMenu();
    };
    contextMenu.appendChild(addButton);
    //last edited.

    const addEdgeButton = document.createElement('button');
    addEdgeButton.textContent = 'Add relationship with...';
    addEdgeButton.onclick = function() {
        startAddingEdge();
        hideContextMenu();
    };
    contextMenu.appendChild(addEdgeButton);

    const deleteEdgeButton = document.createElement('button');
    deleteEdgeButton.textContent = 'Delete relationship';
    deleteEdgeButton.onclick = function() {
        startDeletingEdge();
        hideContextMenu();
    };
    contextMenu.appendChild(deleteEdgeButton);

    contextMenu.style.display = 'block';
}

function startAddingEdge() {
    if (selectedNode) {
        isAddingEdge = true;
        sourceNode = selectedNode.id;
        network.setOptions({ manipulation: { enabled: false } });
        alert("Select another node to create a relationship");
    }
}

function startDeletingEdge() {
    if (selectedNode) {
        isDeletingEdge = true;
        edgeSourceNode = selectedNode.id;
        network.setOptions({ manipulation: { enabled: false } });
        alert("Select another node to delete the relationship between them");
    }
}

function addEdge(from, to) {
    const newEdge = {
        from: from,
        to: to
    };
    network.body.data.edges.add(newEdge);
}

// function deleteEdge() {
//     if (selectedNode) {
//         const connectedEdges = network.getConnectedEdges(selectedNode.id);
//         if (connectedEdges.length > 0) {
//             const edgeToDelete = connectedEdges[0]; // You might want to implement a way to choose which edge to delete
//             network.body.data.edges.remove(edgeToDelete);
//         } else {
//             alert("This node has no relationships to delete");
//         }
//     }
// }

function deleteEdgeBetweenNodes(from, to) {
    const edges = network.getConnectedEdges(from);
    const edgeToDelete = edges.find(edgeId => {
        const edge = network.body.data.edges.get(edgeId);
        return (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from);
    });

    if (edgeToDelete) {
        network.body.data.edges.remove(edgeToDelete);
        alert("Relationship deleted successfully");
    } else {
        alert("No direct relationship found between these nodes");
    }
}

function hideContextMenu() {
    const contextMenu = document.getElementById("contextMenu");
    contextMenu.style.display = 'none';
}

function addNode() {
    const label = prompt("Enter the label for the new node:");
    if (label) {
        const newNode = {
            id: Date.now(),
            label: label
        };
        network.body.data.nodes.add(newNode);

        if (selectedNode) {
            const newEdge = {
                from: selectedNode.id,
                to: newNode.id
            };
            network.body.data.edges.add(newEdge);
        }
    }
    hideContextMenu();
}

function deleteNode(nodeId) {
    network.body.data.nodes.remove(nodeId);
    hideContextMenu();
}

function hideInfoCard() {
    const infoCard = document.getElementById('info-card');
    infoCard.style.transform = 'translateY(-50%) translateX(100%)';
    infoCard.style.opacity = '0';
    setTimeout(() => {
        infoCard.classList.add('hidden');
        infoCard.classList.remove('visible');
    }, 300);

    network.unselectAll();
    const activeNodes = document.getElementsByClassName('active');
    Array.from(activeNodes).forEach(node => {
        node.classList.remove('active');
    });
}


        //original ver

        // document.getElementById("mindmapForm").addEventListener("submit", function(event) {
        //     event.preventDefault();
        //     var knowledgePoint = document.getElementById("knowledgePoint").value;

        //     fetch("/generate_mindmap", {
        //         method: "POST", 
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({ knowledgePoint: knowledgePoint })
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         var container = document.getElementById("mindmap");
        //         var nodes = new vis.DataSet(data.nodes);
        //         var edges = new vis.DataSet(data.edges);
        //         var networkData = {
        //             nodes: nodes,
        //             edges: edges
        //         };
        //         var options = {
        //             layout: {
        //                 hierarchical: {
        //                     direction: "UD",
        //                     sortMethod: "directed",
        //                     nodeSpacing: 200
        //                 }
        //             },
        //             edges: {
        //                 smooth: {
        //                     type: "cubicBezier",
        //                     forceDirection: "vertical",
        //                     roundness: 0.4
        //                 }
        //             },
        //             nodes: {
        //                 shape: "box",
        //                 font: {
        //                     size: 16,
        //                     color: "#333"
        //                 }
        //             },
        //             interaction: {
        //                 hover: true
        //             }
        //         };
        //         new vis.Network(container, networkData, options);
        //     });
        // });
        function toggleSidebar(show) {
            const sidebar = document.getElementById('sidebar');
            if (show) {
                sidebar.classList.add('active');
            } else {
                sidebar.classList.remove('active');
            }
        }
        function setupSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mindmapContainer = document.getElementById('mindmap-container');
            const generateButton = document.getElementById('generateMindmap');
            const knowledgePointInput = document.getElementById('knowledgePoint');
            let sidebarTimer;
        
            if (!sidebar || !mindmapContainer || !generateButton || !knowledgePointInput) {
                console.warn('Sidebar elements not found. Sidebar setup aborted.');
                return;
            }
        
            function showSidebar() {
                clearTimeout(sidebarTimer);
                toggleSidebar(true);
            }
        
            function hideSidebar() {
                sidebarTimer = setTimeout(() => toggleSidebar(false), 300);
            }
        
            mindmapContainer.addEventListener('mousemove', function(e) {
                const distanceFromRight = window.innerWidth - e.clientX;
                if (distanceFromRight < 50) {
                    showSidebar();
                } else {
                    hideSidebar();
                }
            });
        
            sidebar.addEventListener('mouseenter', showSidebar);
            sidebar.addEventListener('mouseleave', hideSidebar);
        
            generateButton.addEventListener('click', function() {
                const knowledgePoint = knowledgePointInput.value;
                if (knowledgePoint) {
                    generateMindmap(null, knowledgePoint);
                }
            });
        }

        function initializeApp() {
            setupSidebar();
            setupNetworkEvents();
        }