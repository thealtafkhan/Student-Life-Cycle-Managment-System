import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { GraduationCap, Home, FileText, Calendar, DollarSign, Building, File, Bell, User, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import api from '../utils/api';

const StudentDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<StudentHome user={user} />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/subjects" element={<StudentSubjects />} />
          <Route path="/attendance" element={<StudentAttendance />} />
          <Route path="/results" element={<StudentResults />} />
          <Route path="/fees" element={<StudentFees />} />
          <Route path="/hostel" element={<StudentHostel />} />
          <Route path="/documents" element={<StudentDocuments />} />
          <Route path="/notifications" element={<StudentNotifications />} />
        </Routes>
      </div>
    </div>
  );
};

const StudentHome = ({ user }) => {
  const [enrollment, setEnrollment] = useState(null);
  const [stats, setStats] = useState({
    attendance: 0,
    results: [],
    fees: { total: 0, paid: 0, pending: 0 }
  });

  useEffect(() => {
    fetchEnrollment();
    fetchStats();
  }, []);

  const fetchEnrollment = async () => {
    try {
      const response = await api.get('/api/enrollments/my-enrollment');
      setEnrollment(response.data.enrollment);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const [attendanceRes, feesRes] = await Promise.all([
        api.get('/api/attendance/my-attendance'),
        api.get('/api/fees/my-fees')
      ]);

      const attendanceData = attendanceRes.data;
      const totalClasses = attendanceData.attendance?.length || 0;
      const presentClasses = attendanceData.attendance?.filter(a => a.status === 'present').length || 0;
      const attendancePercent = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

      setStats({
        attendance: attendancePercent,
        fees: feesRes.data.summary || { total: 0, paid: 0, pending: 0 }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8" data-testid="student-dashboard">
        Welcome, {user.fullName}!
      </h1>

      {enrollment ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Enrollment No</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-blue">{enrollment.enrollmentNo}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Roll No</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-blue">{enrollment.rollNo}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Semester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-blue">{enrollment.currentSemester}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.attendance}%</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Loading enrollment details...</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollment ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Course:</span>
                  <span className="font-medium">{enrollment.courseId?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Code:</span>
                  <span className="font-medium">{enrollment.courseId?.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Program:</span>
                  <span className="font-medium">{enrollment.courseId?.programType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-medium capitalize">{enrollment.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">No enrollment data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Fees:</span>
                <span className="font-medium">₹{stats.fees.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Paid:</span>
                <span className="font-medium text-green-600">₹{stats.fees.paid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Pending:</span>
                <span className="font-medium text-red-600">₹{stats.fees.total - stats.fees.paid}</span>
              </div>
              <Link to="/student/fees">
                <Button variant="outline" className="w-full mt-4" size="sm">View Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StudentProfile = () => {
  const [enrollment, setEnrollment] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/enrollments/my-enrollment');
      setEnrollment(response.data.enrollment);
      setProfile(response.data.profile);
      
      // Fetch subjects for the course
      if (response.data.enrollment?.courseId?._id) {
        const subjectsRes = await api.get(`/api/courses/${response.data.enrollment.courseId._id}/subjects`);
        setSubjects(subjectsRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {enrollment && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Enrollment Number</p>
                  <p className="font-medium">{enrollment.enrollmentNo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Roll Number</p>
                  <p className="font-medium">{enrollment.rollNo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Course</p>
                  <p className="font-medium">{enrollment.courseId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Semester</p>
                  <p className="font-medium">{enrollment.currentSemester}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Enrollment Year</p>
                  <p className="font-medium">{enrollment.enrollmentYear}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Full Name</p>
                  <p className="font-medium">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
                {profile.dateOfBirth && (
                  <div>
                    <p className="text-sm text-slate-600">Date of Birth</p>
                    <p className="font-medium">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                {profile.gender && (
                  <div>
                    <p className="text-sm text-slate-600">Gender</p>
                    <p className="font-medium capitalize">{profile.gender}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        subject.isElective ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
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
const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get(
        "/api/courses/69871185e5d184fbe5c1cbcc/subjects"
      );
      setSubjects(res.data);
    } catch (error) {
      toast.error("Failed to fetch subjects");
    }
  };

  // Group subjects by semester
  const subjectsBySemester = subjects.reduce((acc, subject) => {
    const sem = subject.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(subject);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">
        Course Subjects
      </h1>

      {Object.keys(subjectsBySemester)
        .sort((a, b) => a - b)
        .map((semester) => (
          <Card key={semester} className="mb-6">
            <CardHeader>
              <CardTitle>Semester {semester}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectsBySemester[semester].map((subject) => (
                    <TableRow key={subject._id}>
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            subject.isElective
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {subject.isElective ? "Elective" : "Core"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

      {subjects.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">No subjects found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/api/attendance/my-attendance');
      setAttendance(response.data.attendance || []);
      setStats(response.data.stats || {});
    } catch (error) {
      toast.error('Failed to fetch attendance');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">My Attendance</h1>
      
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-blue">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-gold">{stats.percentage}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.subjectId?.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-slate-600">No attendance records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StudentResults = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/api/exams/my-results');
      setResults(response.data);
    } catch (error) {
      toast.error('Failed to fetch results');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">My Results</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Marks Obtained</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell className="font-medium">{result.subjectId?.name}</TableCell>
                    <TableCell>{result.examId?.name}</TableCell>
                    <TableCell>{result.marksObtained}/{result.examId?.maxMarks}</TableCell>
                    <TableCell><span className="font-bold">{result.grade}</span></TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        result.isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.isPass ? 'Pass' : 'Fail'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-slate-600">No results available yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0 });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await api.get('/api/fees/my-fees');
      setFees(response.data.fees || []);
      setSummary(response.data.summary || { total: 0, paid: 0 });
    } catch (error) {
      toast.error('Failed to fetch fees');
    }
  };

  const handlePayment = async (feeId, amount) => {
    try {
      await api.post(`/api/fees/${feeId}/pay`, { amount, paymentMode: 'demo' });
      toast.success('Payment successful!');
      fetchFees();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">My Fees</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-blue">₹{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{summary.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">₹{summary.total - summary.paid}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
        </CardHeader>
        <CardContent>
          {fees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell className="capitalize">{fee.feeType}</TableCell>
                    <TableCell>₹{fee.amount}</TableCell>
                    <TableCell>₹{fee.paidAmount}</TableCell>
                    <TableCell>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        fee.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {fee.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {fee.status !== 'paid' && (
                        <Button 
                          size="sm" 
                          className="bg-brand-blue" 
                          onClick={() => handlePayment(fee._id, fee.amount - fee.paidAmount)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-slate-600">No fee records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StudentHostel = () => {
  const [allocation, setAllocation] = useState(null);
  const [availableHostels, setAvailableHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAllocation, setHasAllocation] = useState(false);

  useEffect(() => {
    fetchAllocation();
    fetchAvailableHostels();
  }, []);

  const fetchAllocation = async () => {
    try {
      const response = await api.get('/api/hostels/my-allocation');
      setAllocation(response.data);
      setHasAllocation(true);
    } catch (error) {
      setHasAllocation(false);
    }
  };

  const fetchAvailableHostels = async () => {
    try {
      const response = await api.get('/api/hostels/available');
      setAvailableHostels(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApply = async () => {
    if (!selectedHostel) {
      toast.error('Please select a hostel');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/hostels/apply', { hostelId: selectedHostel });
      toast.success(response.data.message);
      setAllocation(response.data.allocation);
      setHasAllocation(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply for hostel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">Hostel Information</h1>
      
      {hasAllocation && allocation ? (
        <Card>
          <CardHeader>
            <CardTitle>Hostel Allocation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Hostel Name</p>
                <p className="text-lg font-medium">{allocation.hostelId?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Room Number</p>
                <p className="text-lg font-medium">{allocation.roomNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Allocation Date</p>
                <p className="text-lg font-medium">{new Date(allocation.allocationDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {allocation.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Hostel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">You don't have a hostel allocation yet. Apply for one below:</p>
              
              <div className="space-y-4">
                <div>
                  <Label>Select Hostel</Label>
                  <Select onValueChange={setSelectedHostel}>
                    <SelectTrigger data-testid="hostel-select">
                      <SelectValue placeholder="Choose a hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHostels.map(hostel => (
                        <SelectItem key={hostel._id} value={hostel._id}>
                          {hostel.name} ({hostel.gender}) - {hostel.availableRooms} rooms available - ₹{hostel.feePerSemester}/sem
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleApply} 
                  disabled={loading || !selectedHostel}
                  className="bg-brand-blue"
                  data-testid="apply-hostel-btn"
                >
                  {loading ? 'Applying...' : 'Apply for Hostel'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {availableHostels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Hostels</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hostel Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Available Rooms</TableHead>
                      <TableHead>Fee/Semester</TableHead>
                      <TableHead>Amenities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableHostels.map((hostel) => (
                      <TableRow key={hostel._id}>
                        <TableCell className="font-medium">{hostel.name}</TableCell>
                        <TableCell className="capitalize">{hostel.gender}</TableCell>
                        <TableCell>{hostel.availableRooms}</TableCell>
                        <TableCell>₹{hostel.feePerSemester}</TableCell>
                        <TableCell>{hostel.amenities?.join(', ') || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    fetchDocuments();
    fetchEnrollment();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/documents/my-documents');
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    }
  };

  const fetchEnrollment = async () => {
    try {
      const response = await api.get('/api/enrollments/my-enrollment');
      setEnrollment(response.data.enrollment);
    } catch (error) {
      console.error(error);
    }
  };

  const generateAdmissionCard = () => {
    if (!enrollment) return;

    const cardContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; color: #1e3a8a; font-weight: bold; }
            .subtitle { font-size: 16px; color: #64748b; margin-top: 10px; }
            .content { margin: 30px 0; }
            .row { display: flex; margin: 15px 0; }
            .label { font-weight: bold; width: 200px; color: #475569; }
            .value { color: #1e293b; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SLMS University</div>
            <div class="subtitle">ADMISSION CARD</div>
            <div class="subtitle">Academic Year ${enrollment.enrollmentYear}-${enrollment.enrollmentYear + 1}</div>
          </div>
          <div class="content">
            <div class="row">
              <div class="label">Student Name:</div>
              <div class="value">${enrollment.studentId?.fullName || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Enrollment Number:</div>
              <div class="value">${enrollment.enrollmentNo}</div>
            </div>
            <div class="row">
              <div class="label">Roll Number:</div>
              <div class="value">${enrollment.rollNo}</div>
            </div>
            <div class="row">
              <div class="label">Course:</div>
              <div class="value">${enrollment.courseId?.name || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Course Code:</div>
              <div class="value">${enrollment.courseId?.code || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Current Semester:</div>
              <div class="value">${enrollment.currentSemester}</div>
            </div>
            <div class="row">
              <div class="label">Admission Date:</div>
              <div class="value">${new Date(enrollment.admissionDate).toLocaleDateString()}</div>
            </div>
            <div class="row">
              <div class="label">Status:</div>
              <div class="value">${enrollment.status.toUpperCase()}</div>
            </div>
          </div>
          <div class="footer">
            This is a computer-generated admission card and does not require a signature.<br/>
            For any queries, contact: admissions@SLMS.edu
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(cardContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold text-brand-blue">My Documents</h1>
        {enrollment && (
          <Button onClick={generateAdmissionCard} className="bg-brand-blue" data-testid="generate-admission-card">
            Generate Admission Card
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Vault</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollment && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-brand-blue">Admission Card</p>
                  <p className="text-sm text-slate-600">Digital admission card available for download</p>
                </div>
                <Button onClick={generateAdmissionCard} variant="outline" size="sm">
                  View/Print
                </Button>
              </div>
            </div>
          )}

          {documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Uploaded Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell className="capitalize">{doc.documentType.replace('_', ' ')}</TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">View</Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-slate-600">No other documents uploaded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">Notifications</h1>
      
      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif._id} className={notif.isRead ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-brand-blue">{notif.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  notif.type === 'success' ? 'bg-green-100 text-green-800' :
                  notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  notif.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {notif.type}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">No notifications</p>
            </CardContent>
          </Card>
        )}
      </div>
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
      <Link to="/student" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-dashboard">
        <Home className="inline h-4 w-4 mr-2" />Dashboard
      </Link>
      <Link to="/student/profile" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-profile">
        <User className="inline h-4 w-4 mr-2" />Profile
      </Link>
      <Link to="/student/subjects" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-subjects">
        <BookOpen className="inline h-4 w-4 mr-2" />My Subjects
      </Link>
      <Link to="/student/attendance" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-attendance">
        <Calendar className="inline h-4 w-4 mr-2" />Attendance
      </Link>
      <Link to="/student/results" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-results">
        <FileText className="inline h-4 w-4 mr-2" />Results
      </Link>
      <Link to="/student/fees" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-fees">
        <DollarSign className="inline h-4 w-4 mr-2" />Fees
      </Link>
      <Link to="/student/hostel" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-hostel">
        <Building className="inline h-4 w-4 mr-2" />Hostel
      </Link>
      <Link to="/student/documents" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-documents">
        <File className="inline h-4 w-4 mr-2" />Documents
      </Link>
      <Link to="/student/notifications" className="block px-4 py-2 rounded-md hover:bg-slate-800" data-testid="nav-notifications">
        <Bell className="inline h-4 w-4 mr-2" />Notifications
      </Link>
    </nav>
    <div className="fixed bottom-0 left-0 w-64 bg-slate-900 p-6 border-t border-slate-800">
      <Button variant="outline" className="w-full" onClick={onLogout} data-testid="sidebar-logout">Logout</Button>
    </div>
  </div>
);

export default StudentDashboard;
