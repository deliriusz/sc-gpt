import {useCallback, useEffect, useRef, useState} from 'react';
import ReactFlow, {addEdge, Background, BackgroundVariant, StraightEdge, useReactFlow} from 'react-flow-renderer';
import {useDispatch, useSelector} from 'react-redux'
import {setSelectedNodeData, setSelectedProject} from '../redux/reducers/workspaceNode'
import TextUpdaterNode from './TextUpdaterNode';
import {AppStateReducer, NodeData} from "../types";
import ConnectionLine from './ConnectionLine';
import {useDisclosure} from "@chakra-ui/react";
import {getParsedProject} from "../services/parser/parserActivities";

const rfStyle = {
  // backgroundColor: '#EFEFEF',
};


// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { textUpdater: TextUpdaterNode };

const fitViewOptions = {
  padding: 7,
};

function Workspace(data :any) {
  const [captureElementClick, setCaptureElementClick] = useState(true);
  const selectedActivityNode = useSelector((state: AppStateReducer) => state.app.selectedActivityNode);
  // const workflow = useSelector((state: AppStateReducer) => state.app.workflow);
  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, onEdgeClick } = data;

  const getId = () => `${nodes.length}`;

  const dispatch = useDispatch()
  const onNodeClick = (event: any, node: any) => {
    dispatch(setSelectedNodeData({
      ...node.data,
      position: {...node.position}
    }));
  }

  // initialize app on first render
  useEffect(() => {
    getParsedProject()
      .then((v) => {
        if (v.data)
          dispatch(setSelectedProject(v.data!))
      })
  }, [])

  ////////////////////
  const reactFlowWrapper = useRef<any>(null);
  const connectingNodeId = useRef(null);
  const { project } = useReactFlow();
  // TODO: probably not required. I'm not planning to allow users to change the flow graphically just yet
  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  //
  // const onConnectStart = useCallback((_, { nodeId }) => {
  //   connectingNodeId.current = nodeId;
  // }, []);
  //
  // const onConnectStop = useCallback(
  //   (event) => {
  //     const targetIsPane = event.target.classList.contains('react-flow__pane');
  //
  //     if (targetIsPane) {
  //       // we need to remove the wrapper bounds, in order to get the correct position
  //       const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
  //       const id = getId();
  //       const uid = `a${id}`;
  //
  //       const newNodePosition = project({ x: event.clientX - left - 75, y: event.clientY - top })
  //       const newNode = {
  //         id: uid,
  //         // we are removing the half of the node width (75) to center the new node
  //         position: newNodePosition,
  //         data: {
  //           label: `Node ${id}`,
  //           id: uid
  //         },
  //       };
  //
  //       const transactionUid = `t${id}`;
  //
  //       setNodes((nds) => nds.concat(newNode));
  //       setEdges((eds) =>
  //         eds.concat(
  //             {id: transactionUid,
  //               type: 'smoothstep',
  //               label: '',
  //               source: connectingNodeId.current as any,
  //               target: uid,
  //               markerEnd: {
  //                 type: 'arrow'
  //               }
  //             })
  //       );
  //
  //       const updatedWorkflow: Workflow = JSON.parse(JSON.stringify(workflow))
  //
  //       updatedWorkflow.structure.transitions.push({
  //         id: transactionUid,
  //         type: TransitionType.SUCCESS,
  //         from: `${connectingNodeId.current}`,
  //         to: uid
  //       })
  //
  //       dispatch(setWorkflow(updatedWorkflow))
  //     }
  //   },
  //   [project, workflow]
  // );

  return (
    <div className="wrapper"  style={{height: '100%',width: '100%', float:'left'}}  ref={reactFlowWrapper}>
      <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              // onConnect={onConnect}
              // onConnectStart={onConnectStart}
              // onConnectStop={onConnectStop}
              fitView
              fitViewOptions={fitViewOptions}
              onEdgeClick={captureElementClick ? onEdgeClick : undefined}
              onNodeClick={captureElementClick ? onNodeClick : undefined}
              onNodeDragStop={onNodeClick}
              connectionLineComponent={ConnectionLine as any}
              // nodeTypes={nodeTypes}
              style={rfStyle}
              >
              <Background variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </div>
  );
}

export default Workspace;
