// src/components/Gait.jsx
import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import TouchApp from '@mui/icons-material/TouchApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';

let globalFocalLength = null;
let globalHeight      = null;
let globalIntrinsicMatrix = null;
let globalExtrinsicMatrix = null;
const listeners       = new Set();

export function setGlobalFocalLength(onFieldChange, val, task) {
  globalFocalLength = val;
  onFieldChange(val, 'focal_length', task);
  listeners.forEach(cb => cb());
}

export function setGlobalHeight(onFieldChange, val, task) {
  globalHeight = val;
  onFieldChange(val, 'height', task);
  listeners.forEach(cb => cb());
}

export function setGlobalIntrinsicMatrix(onFieldChange, matrix, task) {
  globalIntrinsicMatrix = matrix;
  onFieldChange(matrix, 'intrinsic_matrix', task);
  listeners.forEach(cb => cb());
}

export function setGlobalExtrinsicMatrix(onFieldChange, matrix, task) {
  globalExtrinsicMatrix = matrix;
  onFieldChange(matrix, 'extrinsic_matrix', task);
  listeners.forEach(cb => cb());
}

const subscribe = cb => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const modalOverlayClass = "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center";
const modalWindowClass  = "bg-white p-6 rounded-lg shadow-lg relative w-80";

const Gait = ({
  task,
  onFieldChange,
  onTaskDelete,
  onTimeMark,
  onTimeClick,
  options,
}) => {
  const [open, setOpen] = useState(true);
  const taskSelectionRef = useRef(null);

  const fl = useSyncExternalStore(subscribe, () => globalFocalLength);
  const h  = useSyncExternalStore(subscribe, () => globalHeight);

  // Modal visibility state
  const [showIntrinsicModal, setShowIntrinsicModal] = useState(false);
  const [showExtrinsicModal, setShowExtrinsicModal] = useState(false);

  // Initialize matrix states from task or identity
  const defaultIntrinsic = task.intrinsic_matrix || [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const defaultExtrinsic = task.extrinsic_matrix || [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const intrinsicMatrix = useSyncExternalStore(subscribe, () => globalIntrinsicMatrix || defaultIntrinsic);
  const extrinsicMatrix = useSyncExternalStore(subscribe, () => globalExtrinsicMatrix || defaultExtrinsic);


  const handleTaskChange = selectedTask => {
    onFieldChange(selectedTask.value, 'name', task);
  };

  // Focus first render
  useEffect(() => {
    if (taskSelectionRef.current) {
      taskSelectionRef.current.focus();
    }
  }, []);

  // Initialize global values from task
  useEffect(() => {
    if (task.focal_length != null) setGlobalFocalLength(onFieldChange, task.focal_length, task);
    if (task.height      != null) setGlobalHeight(onFieldChange, task.height, task);
  }, []);

  // Sync global into task
  useEffect(() => {
    if (fl != null && fl !== task.focal_length) {
      onFieldChange(fl, 'focal_length', task);
    }
  }, [fl]);

  useEffect(() => {
    if (h != null && h !== task.height) {
      onFieldChange(h, 'height', task);
    }
  }, [h]);

  // Renders a size×size matrix editor
  const renderMatrixEditor = (matrix, setMatrix, size) => (
    <div>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {matrix.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${i}-${j}`}
              type="number"
              step="any"
              className="border p-1 w-16 text-right"
              value={matrix[i][j]}
              onChange={e => {
                const newVal = e.target.value === '' ? '' : Number(e.target.value);
                const currentMatrix = matrix.map(row => [...row]);
                currentMatrix[i][j] = newVal;
                const setter = size === 3 ? setGlobalIntrinsicMatrix : setGlobalExtrinsicMatrix;
                setter(onFieldChange, currentMatrix, task);
              }}
            />
          ))
        )}
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => {
            size === 3 ? setShowIntrinsicModal(false) : setShowExtrinsicModal(false);
          }}
        >Cancel</button>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() => {
            const field = size === 3 ? 'intrinsic_matrix' : 'extrinsic_matrix';
            const value = size === 3 ? intrinsicMatrix : extrinsicMatrix;
            onFieldChange(value, field, task);
            size === 3 ? setShowIntrinsicModal(false) : setShowExtrinsicModal(false);
          }}
        >Save</button>
      </div>
      <button
        className="absolute top-2 right-2 text-gray-500"
        onClick={() => {
          size === 3 ? setShowIntrinsicModal(false) : setShowExtrinsicModal(false);
        }}
      >&times;</button>
    </div>
  );

  return (
    <div
      tabIndex={-1}
      className="border-2 rounded-lg mb-4 overflow-hidden min-h-[50px]
                 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-300
                 focus-within:shadow-blue-200 focus-within:shadow-md
                 transition-all duration-500 ease-in-out"
      key={task.id}
      ref={taskSelectionRef}
    >
      {/* HEADER ROW */}
      <div className="flex items-center gap-4 justify-between px-4 py-2 bg-white font-semibold">
        {task.name} #{task.id}
        <div>
          <IconButton
            size="small"
            className={`transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
            aria-label="Toggle details"
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="remove"
            onClick={() => onTaskDelete(task)}
          >
            <HighlightOffIcon fontSize="inherit" />
          </IconButton>
        </div>
      </div>

      {/* DETAILS PANEL */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <div className="bg-white px-4 pb-1">
          <div className="h-[1px] bg-gray-200 w-full" />
        </div>
        <div className="flex flex-row items-start flex-wrap justify-between px-6 py-1 bg-white gap-y-4 rounded-b-lg">
          {/* Task selector */}
          <div className="relative whitespace-nowrap">
            <label className="inline whitespace-nowrap font-medium">Task: </label>
            <select
              className="p-2 border rounded-lg bg-white"
              value={task.name}
              onChange={e => handleTaskChange({ value: e.target.value, label: e.target.value })}
            >
              <option value="" hidden>Select task</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start time */}
          <div className="flex items-center gap-x-1">
            <label className="inline whitespace-nowrap font-medium">Start: </label>
            <input
              className="p-2 w-20 text-left border rounded-lg"
              type="number"
              onChange={e => onFieldChange(e.target.value, 'start', task)}
              onDoubleClick={() => onTimeClick(task.start)}
              min={0}
              step={0.001}
              value={task.start}
            />
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onTimeMark('start', task); }}
            >
              <TouchApp fontSize="small" />
            </IconButton>
          </div>

          {/* End time */}
          <div className="flex items-center gap-x-1">
            <label className="inline whitespace-nowrap font-medium">End: </label>
            <input
              className="p-2 w-20 text-left border rounded-lg"
              type="number"
              onChange={e => onFieldChange(e.target.value, 'end', task)}
              onDoubleClick={() => onTimeClick(task.end)}
              min={0}
              step={0.001}
              value={task.end}
            />
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); onTimeMark('end', task); }}
            >
              <TouchApp fontSize="small" />
            </IconButton>
          </div>

          {/* Focal Length */}
          <div className="flex items-center space-x-1">
            <label className="inline whitespace-nowrap font-medium">
              Focal Length (mm):
            </label>
            <input
              className="p-2 w-20 sm:w-24 text-left border rounded-lg"
              type="number"
              placeholder="Optional"
              onChange={e => {
                const v = +e.target.value;
                setGlobalFocalLength(onFieldChange, v, task);
              }}
              value={fl || ''}
            />
            <Tooltip
              arrow
              title="Enter the 35mm equivalent focal length of the lens."
            >
              <HelpOutlineIcon className="ml-1 text-gray-500 cursor-pointer" fontSize="small" />
            </Tooltip>
          </div>

          {/* Height */}
          <div className="flex items-center space-x-1">
            <label className="inline whitespace-nowrap font-medium">
              Height (cm)
            </label>
            <input
              className="p-2 w-20 sm:w-24 text-center border rounded-lg"
              type="number"
              placeholder="Required"
              onChange={e => {
                const v = +e.target.value;
                setGlobalHeight(onFieldChange, v, task);
              }}
              value={h || ''}
            />
          </div>

          {/* Intrinsic Matrix */}
          <div className="flex items-center space-x-2">
            <label className="inline font-medium">Intrinsic Matrix</label>
            <button
              className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setShowIntrinsicModal(true)}
            >Edit</button>
          </div>

          {/* Extrinsic Matrix */}
          <div className="flex items-center space-x-2">
            <label className="inline font-medium">Extrinsic Matrix</label>
            <button
              className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setShowExtrinsicModal(true)}
            >Edit</button>
          </div>
        </div>
      </Collapse>

      {/* Intrinsic Modal */}
      {showIntrinsicModal && (
        <div className={modalOverlayClass}>
          <div className={modalWindowClass}>
            <h2 className="text-lg font-semibold mb-4">Edit Intrinsic Matrix</h2>
            {renderMatrixEditor(intrinsicMatrix, setGlobalIntrinsicMatrix, 3)}
          </div>
        </div>
      )}

      {/* Extrinsic Modal */}
      {showExtrinsicModal && (
        <div className={modalOverlayClass}>
          <div className={modalWindowClass}>
            <h2 className="text-lg font-semibold mb-4">Edit Extrinsic Matrix</h2>
            {renderMatrixEditor(extrinsicMatrix, setGlobalExtrinsicMatrix, 4)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gait;
