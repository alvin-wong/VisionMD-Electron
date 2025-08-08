import { useState, useRef, useEffect } from 'react';
import { IconButton, Collapse} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import TouchApp from '@mui/icons-material/TouchApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const FingerTapLeft = ({
  task,
  onFieldChange,
  onTaskDelete,
  onTimeMark,
  onTimeClick,
  options,
}) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!task.norm_strategy) {
      onFieldChange('INDEXSIZE', 'norm_strategy', task);
    }
  }, []);

  return (
    <div
      tabIndex={-1}
      className="border-2 border-zinc-600 bg-zinc-700 text-gray-100 rounded-lg mb-4 overflow-hidden min-h-[50px]
                focus:border-blue-500 focus:outline-none
                transition-all duration-500 ease-in-out"
      key={task.id}
    >
      {/*  HEADER ROW  */}
      <div className={`flex items-center gap-4 justify-between px-4 py-2 bg-transparent text-gray-100`}>
        Finger Tap Left #{task.id}
        <div>
          <IconButton
            size="small"
            className={`transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
            aria-label="Toggle details"
          >
            <ExpandMoreIcon className='text-gray-100' fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="remove"
            onClick={() => onTaskDelete(task)}
          >
            <HighlightOffIcon className='text-gray-100' fontSize="inherit" />
          </IconButton>
        </div>
      </div>


      {/*  DETAILS PANEL  */}
      <Collapse in={open} timeout="auto" unmountOnExit className="border-t-2 border-zinc-600">
        <div className="flex flex-row items-center flex-nowrap justify-between px-3 py-2 bg-transparent gap-y-4 rounded-b-lg">
          
          {/* Task selector */}
          <div className="relative whitespace-nowrap">
            <label className="inline whitespace-nowrap ">Task: </label>
            <select
              className="p-2 border rounded-lg bg-zinc-700 text-gray-100 border-zinc-600"
              value={task.name}
              onChange={(e) => onFieldChange(e.target.value, 'name', task)}
            >
              <option value="" hidden>Select task</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start time */}
          <div className="flex items-center gap-x-1">
            <label className="inline whitespace-nowrap ">Start: </label>
            <input
              className="p-2 w-20 text-left border border-zinc-600 rounded-lg bg-transparent"
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
              <TouchApp className='text-gray-100' fontSize="small" />
            </IconButton>
          </div>

          {/* End time */}
          <div className="flex items-center gap-x-1">
            <label className="inline whitespace-nowrap ">End: </label>
            <input
              className="p-2 w-20 text-left border border-zinc-600 rounded-lg bg-transparent"
              type="number"
              onChange={e => onFieldChange(e.target.value, 'end', task)}
              onDoubleClick={() => onTimeClick(task.end)}
              min={0}
              step={0.001}
              value={task.end}
            />
            <IconButton size="small" onClick={e => { e.stopPropagation(); onTimeMark('end', task); }}>
              <TouchApp className='text-gray-100' fontSize="small" />
            </IconButton>
          </div>
        </div>
          
        <div className="flex flex-row items-center flex-nowrap justify-between px-3 py-2 bg-transparent gap-y-4 rounded-b-lg">
          {/* Normalization selector */}
          <div className="relative whitespace-nowrap">
            <label className="inline whitespace-nowrap ">Normalization: </label>
              <select
                className="p-2 border rounded-lg bg-zinc-700 text-gray-100 border-zinc-600"
                value={task?.norm_strategy? task.norm_strategy: "INDEXSIZE"}
                onChange={e => onFieldChange(e.target.value, 'norm_strategy', task)}
              >
                <option value="INDEXSIZE">Index finger size</option>
                <option value="THUMBSIZE">Thumb size</option>
                <option value="PALMSIZE">Palm size</option>
                <option value="MAXAMPLITUDE">Max amplitude</option>
              </select>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default FingerTapLeft;
