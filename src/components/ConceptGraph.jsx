import { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const COLORS = [
    '#63b3ed', '#b794f4', '#68d391', '#f6ad55', '#fc8181',
    '#76e4f7', '#fbb6ce', '#90cdf4', '#9ae6b4', '#faf089',
];

function ConceptNode({ data }) {
    return (
        <div
            className={`concept-node${data.selected ? ' selected' : ''}`}
            onClick={() => data.onSelect(data)}
        >
            <div className="node-label">{data.label}</div>
        </div>
    );
}

const nodeTypes = { concept: ConceptNode };

function layoutNodes(rawNodes) {
    const count = rawNodes.length;
    const cx = 400, cy = 300, rx = 340, ry = 220;

    return rawNodes.map((n, i) => ({
        id: n.id,
        type: 'concept',
        position: {
            x: cx + rx * Math.cos((2 * Math.PI * i) / count),
            y: cy + ry * Math.sin((2 * Math.PI * i) / count),
        },
        data: { ...n, color: COLORS[i % COLORS.length] },
    }));
}

export default function ConceptGraph({ graphData, selectedNode, onSelectNode }) {
    const rfNodes = layoutNodes(graphData.nodes).map((n) => ({
        ...n,
        data: { ...n.data, selected: selectedNode?.id === n.id, onSelect: onSelectNode },
    }));

    const rfEdges = graphData.edges.map((e, i) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(99,179,237,0.4)' },
        style: { stroke: 'rgba(99,179,237,0.35)', strokeWidth: 1.5 },
        labelStyle: { fill: '#4a5a7a', fontSize: 11 },
        labelBgStyle: { fill: 'rgba(13,21,38,0.85)', rx: 4, ry: 4 },
        labelBgPadding: [4, 4],
    }));

    const [nodes, , onNodesChange] = useNodesState(rfNodes);
    const [edges, , onEdgesChange] = useEdgesState(rfEdges);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
        >
            <Background color="#1a2540" gap={28} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
                nodeColor={() => '#1e293b'}
                maskColor="rgba(7,11,20,0.7)"
                style={{ bottom: 16, right: 16 }}
            />
        </ReactFlow>
    );
}
