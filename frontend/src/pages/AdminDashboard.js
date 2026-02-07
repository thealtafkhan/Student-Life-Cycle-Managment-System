import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { GraduationCap, Home, BookOpen, Users, Building, TrendingUp, DollarSign, FileText, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import api from '../utils/api';
import {
  FacultyManagement,
  ApplicationManagement,
  MeritGeneration,
  EnrollmentManagement,
  HostelManagement,
  FeeManagement,
  ExamManagement
} from './AdminDashboardModules';

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/subjects" element={<SubjectManagement />} />
          <Route path="/faculty" element={<FacultyManagement />} />
          <Route path="/applications" element={<ApplicationManagement />} />
          <Route path="/merit" element={<MeritGeneration />} />
          <Route path="/enrollments" element={<EnrollmentManagement />} />
          <Route path="/exams" element={<ExamManagement />} />
          <Route path="/hostels" element={<HostelManagement />} />
          <Route path="/fees" element={<FeeManagement />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [courseStats, setCourseStats] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchCourseStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchCourseStats = async () => {
    try {
      const response = await api.get('/api/admin/course-stats');
      setCourseStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!stats) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div></div>;

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8" data-testid="admin-dashboard">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Applications" value={stats.applications.total} icon={<FileText />} color="blue" />
        <StatsCard title="Pending Applications" value={stats.applications.pending} icon={<TrendingUp />} color="yellow" />
        <StatsCard title="Total Students" value={stats.students.total} icon={<Users />} color="green" />
        <StatsCard title="Active Enrollments" value={stats.students.active} icon={<Users />} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Courses" value={stats.courses.total} icon={<BookOpen />} color="blue" />
        <StatsCard title="Total Faculty" value={stats.faculty.total} icon={<UserPlus />} color="green" />
        <StatsCard title="Total Hostels" value={stats.hostels.total} icon={<Building />} color="purple" />
        <StatsCard title="Pending Fees" value={stats.fees.pending} icon={<DollarSign />} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Seat Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Total Seats:</span>
                <span className="font-bold">{stats.courses.totalSeats}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Filled Seats:</span>
                <span className="font-bold text-green-600">{stats.courses.filledSeats}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available Seats:</span>
                <span className="font-bold text-blue-600">{stats.courses.availableSeats}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-brand-blue h-4 rounded-full transition-all" 
                  style={{ width: `${(stats.courses.filledSeats / stats.courses.totalSeats) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hostel Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Total Rooms:</span>
                <span className="font-bold">{stats.hostels.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Occupied:</span>
                <span className="font-bold text-green-600">{stats.hostels.occupancy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available:</span>
                <span className="font-bold text-blue-600">{stats.hostels.available}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-brand-gold h-4 rounded-full transition-all" 
                  style={{ width: `${(stats.hostels.occupancy / stats.hostels.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course-wise Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Total Seats</TableHead>
                <TableHead>Occupancy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseStats.map((stat) => (
                <TableRow key={stat._id}>
                  <TableCell className="font-medium">{stat.courseName}</TableCell>
                  <TableCell>{stat.courseCode}</TableCell>
                  <TableCell>{stat.studentCount}</TableCell>
                  <TableCell>{stat.totalSeats}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-blue h-2 rounded-full" 
                          style={{ width: `${(stat.studentCount / stat.totalSeats) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{Math.round((stat.studentCount / stat.totalSeats) * 100)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/courses/departments/all');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/departments', formData);
      toast.success('Department created successfully');
      setShowForm(false);
      setFormData({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create department');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold text-brand-blue">Department Management</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-brand-blue" data-testid="add-department-button">
          {showForm ? 'Cancel' : 'Add Department'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Department</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Department Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required data-testid="dept-name-input" />
              </div>
              <div>
                <Label>Department Code</Label>
                <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required data-testid="dept-code-input" />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} data-testid="dept-desc-input" />
              </div>
              <Button type="submit" className="bg-brand-blue" data-testid="submit-dept-button">Create Department</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept._id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.code}</TableCell>
                  <TableCell>{dept.description}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', departmentId: '', programType: '', duration: '', 
    totalSeats: '', eligibilityPercentage: '', feesPerSemester: '', description: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/courses', formData);
      toast.success('Course created successfully');
      setShowForm(false);
      fetchCourses();
      setFormData({
        name: '', code: '', departmentId: '', programType: '', duration: '', 
        totalSeats: '', eligibilityPercentage: '', feesPerSemester: '', description: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create course');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold text-brand-blue">Course Management</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-brand-blue" data-testid="add-course-button">
          {showForm ? 'Cancel' : 'Add Course'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required data-testid="course-name-input" />
                </div>
                <div>
                  <Label>Course Code</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required data-testid="course-code-input" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select onValueChange={(value) => setFormData({...formData, departmentId: value})} required>
                    <SelectTrigger data-testid="department-select">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Program Type</Label>
                  <Select onValueChange={(value) => setFormData({...formData, programType: value})} required>
                    <SelectTrigger data-testid="program-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                      <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (years)</Label>
                  <Input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required data-testid="duration-input" />
                </div>
                <div>
                  <Label>Total Seats</Label>
                  <Input type="number" value={formData.totalSeats} onChange={(e) => setFormData({...formData, totalSeats: e.target.value})} required data-testid="seats-input" />
                </div>
                <div>
                  <Label>Eligibility %</Label>
                  <Input type="number" value={formData.eligibilityPercentage} onChange={(e) => setFormData({...formData, eligibilityPercentage: e.target.value})} required data-testid="eligibility-input" />
                </div>
                <div>
                  <Label>Fees per Semester</Label>
                  <Input type="number" value={formData.feesPerSemester} onChange={(e) => setFormData({...formData, feesPerSemester: e.target.value})} data-testid="fees-input" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <Button type="submit" className="bg-brand-blue" data-testid="submit-course-button">Create Course</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Fees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id} data-testid={`course-item-${course.code}`}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.programType}</TableCell>
                  <TableCell>{course.duration} years</TableCell>
                  <TableCell>{course.availableSeats}/{course.totalSeats}</TableCell>
                  <TableCell>{course.eligibilityPercentage}%</TableCell>
                  <TableCell>₹{course.feesPerSemester || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', courseId: '', semester: '', credits: '', description: '', isElective: false
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchSubjects();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get(`/api/courses/${selectedCourse}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/courses/subjects', { ...formData, courseId: selectedCourse });
      toast.success('Subject created successfully');
      setShowForm(false);
      fetchSubjects();
      setFormData({ name: '', code: '', courseId: '', semester: '', credits: '', description: '', isElective: false });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create subject');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold text-brand-blue">Subject Management</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-brand-blue" disabled={!selectedCourse} data-testid="add-subject-button">
          {showForm ? 'Cancel' : 'Add Subject'}
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedCourse}>
            <SelectTrigger data-testid="course-filter-select">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course._id} value={course._id}>{course.name} ({course.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {showForm && selectedCourse && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required data-testid="subject-name-input" />
                </div>
                <div>
                  <Label>Subject Code</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required data-testid="subject-code-input" />
                </div>
                <div>
                  <Label>Semester</Label>
                  <Input type="number" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} required data-testid="semester-input" />
                </div>
                <div>
                  <Label>Credits</Label>
                  <Input type="number" value={formData.credits} onChange={(e) => setFormData({...formData, credits: e.target.value})} required data-testid="credits-input" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="elective" checked={formData.isElective} onChange={(e) => setFormData({...formData, isElective: e.target.checked})} data-testid="elective-checkbox" />
                <Label htmlFor="elective">Is Elective</Label>
              </div>
              <Button type="submit" className="bg-brand-blue" data-testid="submit-subject-button">Create Subject</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.semester}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${subject.isElective ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {subject.isElective ? 'Elective' : 'Core'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StatsCard = ({ title, value, icon, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-brand-blue">{value}</div>
          <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const Sidebar = ({ user, onLogout }) => (
  <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 overflow-y-auto pb-24">
    <div className="flex items-center space-x-2 mb-8">
      <GraduationCap className="h-8 w-8" />
      <span className="font-serif text-2xl font-bold">SLMS</span>
    </div>
    <div className="mb-8">
      <p className="text-sm text-slate-400">Welcome,</p>
      <p className="font-semibold">{user.fullName}</p>
      <p className="text-sm text-slate-400 uppercase">{user.role}</p>
    </div>
    <nav className="space-y-2 mb-20">
      <Link to="/admin" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-dashboard">
        <Home className="inline h-4 w-4 mr-2" />Dashboard
      </Link>
      <Link to="/admin/departments" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-departments">
        <Building className="inline h-4 w-4 mr-2" />Departments
      </Link>
      <Link to="/admin/courses" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-courses">
        <BookOpen className="inline h-4 w-4 mr-2" />Courses
      </Link>
      <Link to="/admin/subjects" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-subjects">
        <FileText className="inline h-4 w-4 mr-2" />Subjects
      </Link>
      <Link to="/admin/faculty" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-faculty">
        <UserPlus className="inline h-4 w-4 mr-2" />Faculty
      </Link>
      <Link to="/admin/applications" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-applications">
        <FileText className="inline h-4 w-4 mr-2" />Applications
      </Link>
      <Link to="/admin/merit" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-merit">
        <TrendingUp className="inline h-4 w-4 mr-2" />Merit Generation
      </Link>
      <Link to="/admin/enrollments" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-enrollments">
        <Users className="inline h-4 w-4 mr-2" />Enrollments
      </Link>
      <Link to="/admin/exams" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-exams">
        <FileText className="inline h-4 w-4 mr-2" />Exams
      </Link>
      <Link to="/admin/hostels" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-hostels">
        <Building className="inline h-4 w-4 mr-2" />Hostels
      </Link>
      <Link to="/admin/fees" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-fees">
        <DollarSign className="inline h-4 w-4 mr-2" />Fees
      </Link>
    </nav>
    <div className="fixed bottom-0 left-0 w-64 bg-slate-900 p-6 border-t border-slate-800">
      <Button variant="outline" className="w-full" onClick={onLogout} data-testid="sidebar-logout">Logout</Button>
    </div>
  </div>
);

export default AdminDashboard;