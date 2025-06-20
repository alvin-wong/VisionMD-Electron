// src/pages/HomePage/projects.jsx
import { useEffect, useState, useRef, useContext } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Plus, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VideoContext } from "../../contexts/VideoContext";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const BASE_URL = import.meta.env.VITE_BASE_URL;
dayjs.extend(relativeTime);

const fetchVideos = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/get_video_data/`);
    if (!res.ok) {
      console.error('API returned non-OK', res.status, await res.text());
      return;
    }
    return res.json();
  } catch (err) {
    console.error('Network or parse error', err);
    throw new Error('Fetching video data failed');
  }
}

const uploadVideo = async (file) => {
  const form = new FormData();
  form.append('video', file);
  const res = await fetch(`${BASE_URL}/api/upload_video/`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

const deleteVideo = async (id) => {
  const res = await fetch(`${BASE_URL}/api/delete_video/?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    console.error('Delete API returned non-OK', res.status, await res.text());
    throw new Error('Delete failed');
  }
};

const renameVideo = async (id, videoName, fileType, setVideos) => {

  const request_body = {
    "video_name": `${videoName}.${fileType}`,
    "stem_name": `${videoName}`,
    "video_url": `/media/video_uploads/${id}/${videoName}.${fileType}`,
  }
  console.log("Request body", request_body)
  
  const res = await fetch(`${BASE_URL}/api/update_video_data/?id=${id}&file_name=metadata.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request_body),  
  });

  if (!res.ok) {
    console.error('Updating video name returned non-OK', res.status, await res.text());
    throw new Error('Updating video name failed');
  }

  setVideos(vs =>
    vs.map(v => {
      if (v.metadata.id !== id) {
        return v;
      }

      return {
        ...v,
        metadata: {
          ...v.metadata,
          stem_name: videoName,
          video_name: `${videoName}.${v.metadata.file_type}`,
          video_url: `/media/video_uploads/${id}/${videoName}.${v.metadata.file_type}`
        }
      };
    })
  )
}




const AddTile = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full h-full
        rounded-lg flex
        p-4
        items-center justify-center
        border-2 border-dashed border-gray-500 
        hover:bg-gray-700 
        focus:outline-none focus:ring
      "
    >
      <div className="flex flex-col items-center">
        <Plus size={32}/>
        <span className="mt-2 text-sm">New Project</span>
      </div>
    </button>
  );
}





const VideoTile = ({ video, setVideos }) => {
  const [editing, setEditing] = useState(false);
  const [videoName, setVideoName] = useState(video.metadata.stem_name);
  const navigate = useNavigate();
  const {
    setVideoId,
  } = useContext(VideoContext);

  const onVideoNameChange = (newStemName) => {
    setVideoName(newStemName);
  }

  const openVideoProject = async () => {
    setVideoId(video.metadata.id)
    navigate("/subjects");
  }

  const handleDeleteClick = async () => {
    console.log("Running delete")
    try {
      await deleteVideo(video.metadata.id);
      setVideos(vs => vs.filter(v => v.metadata.id !== video.metadata.id));
    } catch (err) {
      console.error('Video delete failed:', err);
    }
  };

  return (
    <div 
      className="relative group rounded-lg hover:bg-gray-700 bg-surfaceElevated p-4 flex flex-col overflow-hidden h-full"
    >
        <button
          onClick={handleDeleteClick}
          className="absolute z-10 top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-700 rounded-full text-white inline-flex items-center justify-center"
        >
          <HighlightOffIcon className="text-white hover:text-gray-400 transition-colors duration-200" fontSize="small" />
        </button>

        <img
          src={`${BASE_URL}${video.metadata.thumbnail_url}?t=${video.metadata.last_edited}`}
          className="rounded-lg w-full aspect-video object-contain cursor-pointer"
          alt={`Thumbnail for ${video.metadata.video_name}`}
          onClick={() => openVideoProject()}
        />
      <div className="flex items-center mt-2">
        {editing ? (
          <div className='flex flex-row w-full items-start justify-items-start'>
            <input
              className="p-0 bg-transparent border-b border-gray-400 text-sm focus:outline-none"
              value={videoName}
              onBlur={() => setEditing(false)}
              onChange={e => onVideoNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                  renameVideo(video.metadata.id, videoName, video.metadata.file_type, setVideos);
                }
              }}
              autoFocus
            />
          </div>
        ) : (
          <h3 className="flex-1 text-sm truncate" title={videoName}>{videoName}.{video.metadata.file_type}</h3>
        )}
        <button 
          onClick={() => {
            setEditing(true)}
          }
          aria-label="Edit title"
          className="p-1 hover:text-gray-400"
        >
          <Pencil size={14}/>
        </button>
      </div>
      <p className="text-xs text-gray-400">Last edited {dayjs(video.metadata.last_edited).fromNow()}</p>
    </div>
  );
}





export default function Projects() {
  const [videos, setVideos] = useState(null);
  const fileInputRef        = useRef();
  console.log("videos", videos)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const all_videos_data = await fetchVideos();
        setVideos(all_videos_data);
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    }

    loadVideos();
  }, []);

  const handleAddClick = () => fileInputRef.current.click();

  const handleFiles = async e => {
    const file = e.target.files[0];

    if (!file) return;
    try {
      const response_metadata = await uploadVideo(file);
      setVideos(v => [response_metadata, ...(v ?? [])]);
    } catch(error) {
      console.error('Video upload failed:', error);
    } finally {
      e.target.value = null; 
    }
  };

  return (
    <section>
      
      {/* Hidden input for video uploading*/}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFiles}
      />

      {/* Grid for video tiles and add project tile */}
      <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
        {videos && (
          <>
            {/* All video tiles */}
            {videos.map((video) => (
              <div key={video.metadata.id} style={{ width: '100%', aspectRatio: '4 / 3' }}>
                <VideoTile className="w-full h-full" video={video} setVideos={setVideos}/>
              </div>
            ))}

            {/* Add project tile */}
            <div key={"add"} style={{ width: '100%', aspectRatio: '4 / 3' }}>
              <AddTile className="w-full h-full" onClick={handleAddClick} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}