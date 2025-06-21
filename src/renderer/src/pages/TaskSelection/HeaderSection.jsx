import Download from '@mui/icons-material/Download';
import NavigateNext from '@mui/icons-material/NavigateNext';
import ArrowBack from '@mui/icons-material/ArrowBack';

import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';

import { useNavigate } from 'react-router-dom';


const HeaderSection = ({
  title,
  isVideoReady,
  boundingBoxes,
  persons,
  fileName,
  fps,
  moveToNextScreen,
  taskBoxes,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  
  const downloadConfig = () => {
    const fileData = {
      fps: fps,
      boundingBoxes: boundingBoxes,
      tasks: taskBoxes,
    };
    
    const json = JSON.stringify(fileData);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName.replace(/\.[^/.]+$/, '') + '_task_data.json';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
  return (
    <div className={`flex px-6 py-4 items-center ${isVideoReady ? 'justify-between' : 'justify-center'} bg-slate-700 rounded-b-md shadow-lg`}>
    <Typography variant="h4" className="text-white font-bold font-sans">
    {title}
    </Typography>
    
    
    {isVideoReady && (
      <div className="flex gap-3">
      <Button
      variant="contained"
      onClick={() => navigate('/subjects')}
      startIcon={<ArrowBack />}
      sx={{
        bgcolor: 'primary.main',
        '&:hover': { bgcolor: 'primary.dark' },
        textTransform: 'none',
        fontWeight: 'bold',
        px: 3,
        py: 1
      }}
      >
      Back
      </Button>
      
      <Button
      variant="contained"
      onClick={downloadConfig}
      startIcon={<Download />}
      disabled={taskBoxes.length === 0}
      sx={{
        bgcolor: 'primary.main',
        '&:hover': { bgcolor: 'primary.dark' },
        '&:disabled': {
          bgcolor: 'action.disabledBackground',
          color: 'grey.600'
        },
        textTransform: 'none',
        fontWeight: 'bold',
        px: 3,
        py: 1
      }}
      >
      Config
      </Button>
      
      <Button
      variant="contained"
      onClick={moveToNextScreen}
      endIcon={<NavigateNext />}
      disabled={taskBoxes.length === 0}
      sx={{
        bgcolor: 'primary.main',
        '&:hover': { bgcolor: 'primary.dark' },
        '&:disabled': {
          bgcolor: 'action.disabledBackground',
          color: 'grey.600'
        },
        textTransform: 'none',
        fontWeight: 'bold',
        px: 3,
        py: 1
      }}
      >
      Proceed
      </Button>
      </div>
    )}
    </div>
  );
};

export default HeaderSection; 