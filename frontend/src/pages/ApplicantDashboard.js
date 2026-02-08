import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GraduationCap, FileText, CheckCircle, XCircle, Home as HomeIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const ApplicantDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<ApplicantHome />} />
          <Route path="/applications" element={<MyApplications />} />
        </Routes>
      </div>
    </div>
  );
};

const ApplicantHome = () => {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/applications/my-applications');
      setApplications(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">Applicant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-blue">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {applications.filter(a => a.status === 'selected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">You haven't submitted any applications yet.</p>
              <Button 
                onClick={() => navigate('/apply')} 
                className="bg-brand-blue hover:bg-brand-blue/90"
                data-testid="apply-now-button"
              >
                Apply Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map(app => (
                <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`application-${app._id}`}>
                  <div>
                    <p className="font-medium text-brand-blue">{app.courseId?.name}</p>
                    <p className="text-sm text-slate-600">Applied: {new Date(app.applicationDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/applications/my-applications');
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">My Applications</h1>
      
      <div className="space-y-4">
        {applications.map(app => (
          <Card key={app._id} data-testid={`app-card-${app._id}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-brand-blue mb-2">
                    {app.courseId?.name}
                  </h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Program: {app.programType}</p>
                    <p>Course Code: {app.courseId?.code}</p>
                    <p>Application Date: {new Date(app.applicationDate).toLocaleDateString()}</p>
                    <p>Percentage: {app.percentage}%</p>
                    {app.meritRank && <p>Merit Rank: {app.meritRank}</p>}
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FileText },
    selected: { label: 'Selected', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    enrolled: { label: 'Enrolled', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
  };

  const { label, color, icon: Icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`} data-testid={`status-${status}`}>
      <Icon className="h-4 w-4 mr-1" />
      {label}
    </span>
  );
};

const Sidebar = ({ user, onLogout }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 overflow-y-auto pb-24">
      <div className="flex items-center space-x-2 mb-8">
        <GraduationCap className="h-8 w-8" />
        <Link to="/" className="font-serif text-2xl font-bold">SLMS</Link>
      </div>

      <div className="mb-8">
        <p className="text-sm text-slate-400">Welcome,</p>
        <p className="font-semibold">{user.fullName}</p>
        <p className="text-sm text-slate-400">{user.role}</p>
      </div>

      <nav className="space-y-2 mb-20">
        <Link to="/applicant" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors" data-testid="nav-dashboard">
          <HomeIcon className="inline h-4 w-4 mr-2" />
          Dashboard
        </Link>
        <Link to="/applicant/applications" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors" data-testid="nav-applications">
          <FileText className="inline h-4 w-4 mr-2" />
          My Applications
        </Link>
        <Link to="/apply" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors" data-testid="nav-apply">
          <CheckCircle className="inline h-4 w-4 mr-2" />
          Apply for Course
        </Link>
      </nav>

      <div className="fixed bottom-0 left-0 w-64 bg-slate-900 p-6 border-t border-slate-800">
        <Button variant="outline" className="w-full" onClick={onLogout} data-testid="sidebar-logout">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ApplicantDashboard;