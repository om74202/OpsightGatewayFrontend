import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';

const TreeNode = ({ node }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const isObject = node.nodeClass === 'Object' || hasChildren;

  const handleToggle = () => {
    if (hasChildren) setExpanded(!expanded);
  };

  return (
    <div className="ml-1 my-1">
      <div
        className="cursor-pointer flex items-center "
        onClick={handleToggle}
      >
        {/* Arrow Icon */}
        {hasChildren && (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        )}

        {/* Node Type Icon */}
        {!hasChildren ? (
          <FileText size={12} className="text-green-600" />
        ) : (
          <Folder size={12} className="text-blue-600" />
        )}

        {/* Node Info */}
        <span className="font-medium text-xs">
          {node.displayName}
        </span>
        {/* {node.value !== undefined && (
          <span className="text-xs text-gray-500 ml-1">
            ({typeof node.value === 'object' ? JSON.stringify(node.value) : node.value})
          </span>
        )} */}
      </div>

      {/* Node Details */}
      <div className="ml-6 text-xs text-gray-600">
        {node.dataType && <div>Type: {node.dataType}</div>}
        {node.hasValue && (
          <div>
            Value: {typeof node.value === 'object'
              ? JSON.stringify(node.value)
              : String(node.value)}
          </div>
        )}
      </div>

      {/* Recursively Render Children */}
      {expanded && hasChildren && (
        <div className="pl-2 border-l-2 border-gray-300 mt-1">
          {node.children.map(child => (
            <TreeNode key={child.nodeId} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ tree }) => {
  return (
    <div className="text-sm font-sans">
      {tree.map(node => (
        <TreeNode key={node.nodeId} node={node} />
      ))}
    </div>
  );
};

export default TreeView;
