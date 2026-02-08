import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { GraduationCap, Home, Users, FileText, Calendar, BookOpen, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import api from '../utils/api';

const FacultyDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<FacultyHome user={user} />} />
          <Route path="/profile" element={<FacultyProfile />} />
          <Route path="/students" element={<MyStudents />} />
          <Route path="/attendance" element={<MarkAttendance />} />
          <Route path="/marks" element={<UploadMarks />} />
        </Routes>
      </div>
    </div>
  );
};

const FacultyHome = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchStudents();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/faculty/my-profile');
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/faculty/my-students');
      setStudents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8" data-testid="faculty-dashboard">
        Welcome, {user.fullName}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Assigned Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-blue">
              {profile?.assignedSubjects?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium text-brand-blue">
              {profile?.departmentId?.name || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.assignedSubjects && profile.assignedSubjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.assignedSubjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.semester}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-slate-600">No subjects assigned yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const FacultyProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/faculty/my-profile');
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">My Profile</h1>
      
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Full Name</p>
                  <p className="font-medium">{profile.userId?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium">{profile.userId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium">{profile.userId?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Employee ID</p>
                  <p className="font-medium">{profile.employeeId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Department</p>
                  <p className="font-medium">{profile.departmentId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Designation</p>
                  <p className="font-medium">{profile.designation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Qualification</p>
                  <p className="font-medium">{profile.qualification || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Specialization</p>
                  <p className="font-medium">{profile.specialization || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Experience</p>
                  <p className="font-medium">{profile.experience ? `${profile.experience} years` : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const MyStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/faculty/my-students');
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">My Students</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Student List ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enrollment No</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((enrollment) => (
                  <TableRow key={enrollment._id}>
                    <TableCell className="font-medium">{enrollment.enrollmentNo}</TableCell>
                    <TableCell>{enrollment.rollNo}</TableCell>
                    <TableCell>{enrollment.studentId?.fullName}</TableCell>
                    <TableCell>{enrollment.studentId?.email}</TableCell>
                    <TableCell>{enrollment.courseId?.name}</TableCell>
                    <TableCell>{enrollment.currentSemester}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-slate-600">No students found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const MarkAttendance = () => {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchStudents();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/faculty/my-profile');
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/faculty/my-students');
      setStudents(response.data);
      
      // Initialize attendance data
      const initialData = {};
      response.data.forEach(student => {
        initialData[student.studentId._id] = 'present';
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      studentId,
      subjectId: selectedSubject,
      date: selectedDate,
      status,
      semester: students.find(s => s.studentId._id === studentId)?.currentSemester || 1
    }));

    try {
      await api.post('/api/attendance/mark', { attendanceData: records });
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">Mark Attendance</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Attendance Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Subject</Label>
              <Select onValueChange={setSelectedSubject}>
                <SelectTrigger data-testid="subject-select">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {profile?.assignedSubjects?.map(subject => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                data-testid="attendance-date-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enrollment No</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((enrollment) => (
                    <TableRow key={enrollment._id}>
                      <TableCell>{enrollment.enrollmentNo}</TableCell>
                      <TableCell>{enrollment.rollNo}</TableCell>
                      <TableCell className="font-medium">{enrollment.studentId?.fullName}</TableCell>
                      <TableCell>
                        <Select 
                          value={attendanceData[enrollment.studentId._id]} 
                          onValueChange={(value) => handleAttendanceChange(enrollment.studentId._id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6">
                <Button 
                  onClick={handleSubmit} 
                  className="bg-brand-blue" 
                  disabled={!selectedSubject}
                  data-testid="submit-attendance-button"
                >
                  Submit Attendance
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-slate-600">No students found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const UploadMarks = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchExams();
    fetchStudents();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/faculty/my-profile');
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await api.get('/api/exams');
      setExams(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/faculty/my-students');
      setStudents(response.data);
      
      // Initialize marks data
      const initialData = {};
      response.data.forEach(student => {
        initialData[student.studentId._id] = 0;
      });
      setMarksData(initialData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarksChange = (studentId, marks) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: parseInt(marks) || 0
    }));
  };

  const handleSubmit = async () => {
    if (!selectedExam || !selectedSubject) {
      toast.error('Please select exam and subject');
      return;
    }

    const results = Object.entries(marksData).map(([studentId, marksObtained]) => ({
      studentId,
      examId: selectedExam,
      subjectId: selectedSubject,
      marksObtained
    }));

    try {
      await api.post('/api/exams/results', { results });
      toast.success('Marks uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload marks');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">Upload Marks</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Exam Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Subject</Label>
              <Select onValueChange={setSelectedSubject}>
                <SelectTrigger data-testid="marks-subject-select">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {profile?.assignedSubjects?.map(subject => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Exam</Label>
              <Select onValueChange={setSelectedExam}>
                <SelectTrigger data-testid="marks-exam-select">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name} - Semester {exam.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter Marks</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enrollment No</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((enrollment) => (
                    <TableRow key={enrollment._id}>
                      <TableCell>{enrollment.enrollmentNo}</TableCell>
                      <TableCell>{enrollment.rollNo}</TableCell>
                      <TableCell className="font-medium">{enrollment.studentId?.fullName}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="0" 
                          value={marksData[enrollment.studentId._id] || ''} 
                          onChange={(e) => handleMarksChange(enrollment.studentId._id, e.target.value)}
                          className="w-24"
                          data-testid={`marks-input-${enrollment.studentId._id}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6">
                <Button 
                  onClick={handleSubmit} 
                  className="bg-brand-blue" 
                  disabled={!selectedExam || !selectedSubject}
                  data-testid="submit-marks-button"
                >
                  Submit Marks
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-slate-600">No students found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Sidebar = ({ user, onLogout }) => (
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
      <Link to="/faculty" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-dashboard">
        <Home className="inline h-4 w-4 mr-2" />Dashboard
      </Link>
      <Link to="/faculty/profile" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-profile">
        <User className="inline h-4 w-4 mr-2" />My Profile
      </Link>
      <Link to="/faculty/students" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-students">
        <Users className="inline h-4 w-4 mr-2" />My Students
      </Link>
      <Link to="/faculty/attendance" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-attendance">
        <Calendar className="inline h-4 w-4 mr-2" />Mark Attendance
      </Link>
      <Link to="/faculty/marks" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-marks">
        <FileText className="inline h-4 w-4 mr-2" />Upload Marks
      </Link>
    </nav>
    <div className="fixed bottom-0 left-0 w-64 bg-slate-900 p-6 border-t border-slate-800">
      <Button variant="outline" className="w-full" onClick={onLogout} data-testid="sidebar-logout">Logout</Button>
    </div>
  </div>
);

export default FacultyDashboard;
