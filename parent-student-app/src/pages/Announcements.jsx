import { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronRight, FileText } from 'lucide-react';
import axios from '../api/axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements');
      setAnnouncements(response.data.data);
    } catch (err) {
      console.error('Error fetching announcements', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-10 text-center font-bold text-gray-500">Loading notices...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">School Notices</h2>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="card text-center py-10">
            <Bell className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No announcements today.</p>
          </div>
        ) : (
          announcements.map((notice) => (
            <div key={notice._id} className="card space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-black text-gray-900 leading-tight">{notice.title}</h3>
                  <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(notice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span className="mx-2">•</span>
                    By {notice.author?.name || 'Admin'}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                  notice.targetAudience === 'All' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {notice.targetAudience}
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {notice.content}
              </p>

              {notice.attachments && notice.attachments.length > 0 && (
                <div className="pt-3 border-t border-gray-50 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attachments</p>
                  {notice.attachments.map((file, i) => (
                    <a
                      key={i}
                      href={file}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center p-2 bg-gray-50 rounded-xl text-primary text-xs font-bold hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Document {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
